"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth.config"

export interface ReviewResponse {
    success: boolean
    data?: any
    error?: string
    errorEn?: string  // English error message for multilingual support
}

export interface ReviewsResponse {
    success: boolean
    data?: any[]
    error?: string
    averageRating?: number
    totalReviews?: number
}

export interface FilteredReviewsResponse extends ReviewsResponse {
    filters?: {
        rating?: number
        sortBy?: 'newest' | 'oldest' | 'helpful'
        verifiedOnly?: boolean
    }
}

// Check if database is available
async function isDatabaseAvailable() {
    try {
        await import("@/lib/db")
        await import("@/lib/db/schema")
        return true
    } catch (error) {
        // console.warn("Database not available")
        return false
    }
}

/*///////////////////////////////////

 * Get all reviews for a product

 *///////////////////////////////////

export async function getProductReviews(productId: number): Promise<ReviewsResponse> {
    try {
        const dbAvailable = await isDatabaseAvailable()
        if (!dbAvailable) {
            return {
                success: false,
                error: "Database not available",
            }
        }

        const { db } = await import("@/lib/db")
        const { reviews, users } = await import("@/lib/db/schema")
        const { eq, desc, avg, count } = await import("drizzle-orm")

        // Get reviews with user information
        const productReviews = await db
            .select({
                id: reviews.id,
                rating: reviews.rating,
                comment: reviews.comment,
                createdAt: reviews.createdAt,
                user: {
                    id: users.id,
                    username: users.username,
                    email: users.email,
                    image: users.image,
                },
            })
            .from(reviews)
            .leftJoin(users, eq(reviews.userId, users.id))
            .where(eq(reviews.productId, productId))
            .orderBy(desc(reviews.createdAt))

        // Calculate average rating
        const stats = await db
            .select({
                avgRating: avg(reviews.rating),
                totalReviews: count(),
            })
            .from(reviews)
            .where(eq(reviews.productId, productId))

        const averageRating = stats[0]?.avgRating ? Number(stats[0].avgRating) : 0
        const totalReviews = stats[0]?.totalReviews || 0

        return {
            success: true,
            data: productReviews,
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            totalReviews,
        }
    } catch (error) {
        // console.error("Get product reviews error:", error)
        return {
            success: false,
            error: "Failed to fetch reviews",
        }
    }
}

/* //////////////////////////////////////////////

 * Check if user has purchased the product

 *///////////////////////////////////////////////

async function checkPurchaseVerification(userId: number, productId: number): Promise<boolean> {
    try {
        const { db } = await import("@/lib/db")
        const { orders, orderItems } = await import("@/lib/db/schema")
        const { eq, and } = await import("drizzle-orm")

        const purchaseCheck = await db
            .select()
            .from(orders)
            .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
            .where(
                and(
                    eq(orders.userId, userId),
                    eq(orderItems.productId, productId),
                    eq(orders.status, "delivered"), // Only delivered orders count
                    eq(orders.paymentStatus, "paid") // AND payment must be confirmed
                )
            )
            .limit(1)

        return purchaseCheck.length > 0
    } catch (error) {
        return false
    }
}

/*///////////////////////////////////////////////

 * Add a new review

 *///////////////////////////////////////////////

export async function addReview(
    productId: number,
    rating: number,
    comment?: string
): Promise<ReviewResponse> {
    try {
        // Check authentication
        const session = await getServerSession(authOptions)
        if (!session || !session.user?.id) {
            return {
                success: false,
                error: "You must be logged in to add a review",
            }
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return {
                success: false,
                error: "Rating must be between 1 and 5",
            }
        }

        const dbAvailable = await isDatabaseAvailable()
        if (!dbAvailable) {
            return {
                success: false,
                error: "Database not available",
            }
        }

        const { db } = await import("@/lib/db")
        const { reviews } = await import("@/lib/db/schema")
        const { eq, and } = await import("drizzle-orm")

        // Check if user already reviewed this product
        const existingReview = await db
            .select()
            .from(reviews)
            .where(
                and(
                    eq(reviews.productId, productId),
                    eq(reviews.userId, session.user.id)
                )
            )
            .limit(1)

        if (existingReview.length > 0) {
            return {
                success: false,
                error: "You have already reviewed this product",
            }
        }

        // Check if user has purchased the product (required to add a review)
        const hasPurchased = await checkPurchaseVerification(session.user.id, productId)
        
        if (!hasPurchased) {
            return {
                success: false,
                error: "يجب عليك شراء هذا المنتج قبل أن تتمكن من كتابة تقييم له", // Arabic message
                errorEn: "You must purchase this product before you can write a review",
            }
        }

        // Add review (all reviews from purchased users are verified)
        const [newReview] = await db
            .insert(reviews)
            .values({
                productId,
                userId: session.user.id,
                rating,
                comment: comment || null,
                verifiedPurchase: true, // Always true since purchase is required
            })
            .returning()

        // Revalidate product page
        revalidatePath(`/product/${productId}`)

        return {
            success: true,
            data: newReview,
        }
    } catch (error) {
        // console.error("Add review error:", error)
        return {
            success: false,
            error: "Failed to add review",
        }
    }
}

/*//////////////////////////////////////////////////////

 * Update a review

 *//////////////////////////////////////////////////////

export async function updateReview(
    reviewId: number,
    rating: number,
    comment?: string
): Promise<ReviewResponse> {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user?.id) {
            return {
                success: false,
                error: "You must be logged in to update a review",
            }
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return {
                success: false,
                error: "Rating must be between 1 and 5",
            }
        }

        const dbAvailable = await isDatabaseAvailable()
        if (!dbAvailable) {
            return {
                success: false,
                error: "Database not available",
            }
        }

        const { db } = await import("@/lib/db")
        const { reviews } = await import("@/lib/db/schema")
        const { eq, and } = await import("drizzle-orm")

        // Check if review exists and belongs to user
        const existingReview = await db
            .select()
            .from(reviews)
            .where(
                and(
                    eq(reviews.id, reviewId),
                    eq(reviews.userId, session.user.id)
                )
            )
            .limit(1)

        if (existingReview.length === 0) {
            return {
                success: false,
                error: "Review not found or you don't have permission to update it",
            }
        }

        // Update review
        const [updatedReview] = await db
            .update(reviews)
            .set({
                rating,
                comment: comment || null,
            })
            .where(eq(reviews.id, reviewId))
            .returning()

        // Revalidate product page
        revalidatePath(`/product/${existingReview[0].productId}`)

        return {
            success: true,
            data: updatedReview,
        }
    } catch (error) {
        // console.error("Update review error:", error)
        return {
            success: false,
            error: "Failed to update review",
        }
    }
}

/*/////////////////////////////////////////////

 * Delete a review

 */////////////////////////////////////////////
export async function deleteReview(reviewId: number): Promise<ReviewResponse> {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user?.id) {
            return {
                success: false,
                error: "You must be logged in to delete a review",
            }
        }

        const dbAvailable = await isDatabaseAvailable()
        if (!dbAvailable) {
            return {
                success: false,
                error: "Database not available",
            }
        }

        const { db } = await import("@/lib/db")
        const { reviews } = await import("@/lib/db/schema")
        const { eq, and } = await import("drizzle-orm")

        // Check if review exists and belongs to user
        const existingReview = await db
            .select()
            .from(reviews)
            .where(
                and(
                    eq(reviews.id, reviewId),
                    eq(reviews.userId, session.user.id)
                )
            )
            .limit(1)

        if (existingReview.length === 0) {
            return {
                success: false,
                error: "Review not found or you don't have permission to delete it",
            }
        }

        // Delete review
        await db.delete(reviews).where(eq(reviews.id, reviewId))

        // Revalidate product page
        revalidatePath(`/product/${existingReview[0].productId}`)

        return {
            success: true,
            data: { id: reviewId },
        }
    } catch (error) {
        // console.error("Delete review error:", error)
        return {
            success: false,
            error: "Failed to delete review",
        }
    }
}

/**
 * Get all reviews for dashboard management
 */
export async function getAllReviews(search: string = ""): Promise<ReviewsResponse> {
    try {
        const dbAvailable = await isDatabaseAvailable()
        if (!dbAvailable) {
            return {
                success: false,
                error: "Database not available",
            }
        }

        const { db } = await import("@/lib/db")
        const { reviews, users, products } = await import("@/lib/db/schema")
        const { desc, ilike, or, eq } = await import("drizzle-orm")

        // Build the base query
        const baseQuery = db
            .select({
                id: reviews.id,
                productId: reviews.productId,
                userId: reviews.userId,
                rating: reviews.rating,
                comment: reviews.comment,
                createdAt: reviews.createdAt,
                product: {
                    nameEn: products.nameEn,
                    nameAr: products.nameAr,
                },
                user: {
                    username: users.username,
                    email: users.email,
                    image: users.image,
                },
            })
            .from(reviews)
            .leftJoin(users, eq(reviews.userId, users.id))
            .leftJoin(products, eq(reviews.productId, products.id))

        // Add search filter if provided
        let allReviews
        if (search) {
            allReviews = await baseQuery
                .where(
                    or(
                        ilike(products.nameEn, `%${search}%`),
                        ilike(products.nameAr, `%${search}%`),
                        ilike(users.username, `%${search}%`),
                        ilike(users.email, `%${search}%`),
                        ilike(reviews.comment, `%${search}%`)
                    )
                )
                .orderBy(desc(reviews.createdAt))
        } else {
            allReviews = await baseQuery.orderBy(desc(reviews.createdAt))
        }

        return {
            success: true,
            data: allReviews,
            totalReviews: allReviews.length,
        }
    } catch (error) {
        // console.error("Get all reviews error:", error)
        return {
            success: false,
            error: "Failed to fetch reviews",
        }
    }
}

/**
 * Get a single review by ID for dashboard
 */
export async function getReviewById(reviewId: number): Promise<ReviewResponse> {
    try {
        const dbAvailable = await isDatabaseAvailable()
        if (!dbAvailable) {
            return {
                success: false,
                error: "Database not available",
            }
        }

        const { db } = await import("@/lib/db")
        const { reviews, users, products } = await import("@/lib/db/schema")
        const { eq } = await import("drizzle-orm")

        // Get review with user and product information
        const result = await db
            .select({
                id: reviews.id,
                productId: reviews.productId,
                userId: reviews.userId,
                rating: reviews.rating,
                comment: reviews.comment,
                createdAt: reviews.createdAt,
                product: {
                    nameEn: products.nameEn,
                    nameAr: products.nameAr,
                },
                user: {
                    username: users.username,
                    email: users.email,
                    image: users.image,
                },
            })
            .from(reviews)
            .leftJoin(users, eq(reviews.userId, users.id))
            .leftJoin(products, eq(reviews.productId, products.id))
            .where(eq(reviews.id, reviewId))
            .limit(1)

        if (result.length === 0) {
            return {
                success: false,
                error: "Review not found",
            }
        }

        return {
            success: true,
            data: result[0],
        }
    } catch (error) {
        // console.error("Get review by ID error:", error)
        return {
            success: false,
            error: "Failed to fetch review",
        }
    }
}

/**
 * Delete a review (Admin function)
 */
export async function deleteReviewAdmin(reviewId: number): Promise<ReviewResponse> {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user?.id) {
            return {
                success: false,
                error: "You must be logged in to delete a review",
            }
        }

        // Check if user is admin (you might want to add role check here)
        // For now, we'll allow any authenticated user to delete reviews in dashboard

        const dbAvailable = await isDatabaseAvailable()
        if (!dbAvailable) {
            return {
                success: false,
                error: "Database not available",
            }
        }

        const { db } = await import("@/lib/db")
        const { reviews } = await import("@/lib/db/schema")
        const { eq } = await import("drizzle-orm")

        // Check if review exists
        const existingReview = await db
            .select()
            .from(reviews)
            .where(eq(reviews.id, reviewId))
            .limit(1)

        if (existingReview.length === 0) {
            return {
                success: false,
                error: "Review not found",
            }
        }

        // Delete review
        await db.delete(reviews).where(eq(reviews.id, reviewId))

        // Revalidate pages
        revalidatePath(`/product/${existingReview[0].productId}`)
        revalidatePath("/dashboard/reviews")

        return {
            success: true,
            data: { id: reviewId },
        }
    } catch (error) {
        // console.error("Delete review admin error:", error)
        return {
            success: false,
            error: "Failed to delete review",
        }
    }
}

/**
 * Vote on a review (helpful/not helpful)
 */
export async function voteOnReview(
    reviewId: number,
    voteType: 'helpful' | 'not_helpful'
): Promise<ReviewResponse> {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user?.id) {
            return {
                success: false,
                error: "You must be logged in to vote",
            }
        }

        const dbAvailable = await isDatabaseAvailable()
        if (!dbAvailable) {
            return {
                success: false,
                error: "Database not available",
            }
        }

        const { db } = await import("@/lib/db")
        const { reviewVotes, reviews } = await import("@/lib/db/schema")
        const { eq, and, sql } = await import("drizzle-orm")

        // Check if user already voted on this review
        const existingVote = await db
            .select()
            .from(reviewVotes)
            .where(
                and(
                    eq(reviewVotes.reviewId, reviewId),
                    eq(reviewVotes.userId, session.user.id)
                )
            )
            .limit(1)

        if (existingVote.length > 0) {
            // Update existing vote if different
            if (existingVote[0].voteType !== voteType) {
                await db
                    .update(reviewVotes)
                    .set({ voteType })
                    .where(eq(reviewVotes.id, existingVote[0].id))
            }
        } else {
            // Insert new vote
            await db.insert(reviewVotes).values({
                reviewId,
                userId: session.user.id,
                voteType,
            })
        }

        // Update counters in reviews table
        const helpfulCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(reviewVotes)
            .where(
                and(
                    eq(reviewVotes.reviewId, reviewId),
                    eq(reviewVotes.voteType, 'helpful')
                )
            )

        const notHelpfulCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(reviewVotes)
            .where(
                and(
                    eq(reviewVotes.reviewId, reviewId),
                    eq(reviewVotes.voteType, 'not_helpful')
                )
            )

        await db
            .update(reviews)
            .set({
                helpfulCount: helpfulCount[0]?.count || 0,
                notHelpfulCount: notHelpfulCount[0]?.count || 0,
            })
            .where(eq(reviews.id, reviewId))

        return {
            success: true,
            data: { voteType },
        }
    } catch (error) {
        return {
            success: false,
            error: "Failed to vote on review",
        }
    }
}

/**
 * Get filtered reviews
 */
export async function getFilteredProductReviews(
    productId: number,
    filters: {
        rating?: number
        sortBy?: 'newest' | 'oldest' | 'helpful'
        verifiedOnly?: boolean
    } = {}
): Promise<FilteredReviewsResponse> {
    try {
        const dbAvailable = await isDatabaseAvailable()
        if (!dbAvailable) {
            return {
                success: false,
                error: "Database not available",
            }
        }

        const { db } = await import("@/lib/db")
        const { reviews, users } = await import("@/lib/db/schema")
        const { eq, desc, asc, and, avg, count } = await import("drizzle-orm")

        let whereConditions: any[] = [eq(reviews.productId, productId)]

        // Apply filters
        if (filters.rating) {
            whereConditions.push(eq(reviews.rating, filters.rating))
        }
        if (filters.verifiedOnly) {
            whereConditions.push(eq(reviews.verifiedPurchase, true))
        }

        // Build base query
        let baseQuery = db
            .select({
                id: reviews.id,
                rating: reviews.rating,
                comment: reviews.comment,
                verifiedPurchase: reviews.verifiedPurchase,
                helpfulCount: reviews.helpfulCount,
                notHelpfulCount: reviews.notHelpfulCount,
                createdAt: reviews.createdAt,
                user: {
                    id: users.id,
                    username: users.username,
                    email: users.email,
                    image: users.image,
                },
            })
            .from(reviews)
            .leftJoin(users, eq(reviews.userId, users.id))
            .where(and(...whereConditions))

        // Apply sorting and execute query
        let filteredReviews
        if (filters.sortBy === 'oldest') {
            filteredReviews = await baseQuery.orderBy(asc(reviews.createdAt))
        } else if (filters.sortBy === 'helpful') {
            filteredReviews = await baseQuery.orderBy(desc(reviews.helpfulCount))
        } else {
            // Default: newest first
            filteredReviews = await baseQuery.orderBy(desc(reviews.createdAt))
        }

        // Calculate average rating
        const stats = await db
            .select({
                avgRating: avg(reviews.rating),
                totalReviews: count(),
            })
            .from(reviews)
            .where(eq(reviews.productId, productId))

        const averageRating = stats[0]?.avgRating ? Number(stats[0].avgRating) : 0
        const totalReviews = stats[0]?.totalReviews || 0

        return {
            success: true,
            data: filteredReviews,
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews,
            filters,
        }
    } catch (error) {
        return {
            success: false,
            error: "Failed to fetch filtered reviews",
        }
    }
}

/**
 * Add seller response to a review
 */
export async function addSellerResponse(
    reviewId: number,
    response: string
): Promise<ReviewResponse> {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user?.id) {
            return {
                success: false,
                error: "You must be logged in to respond",
            }
        }

        // TODO: Add role check for seller/admin permissions

        const dbAvailable = await isDatabaseAvailable()
        if (!dbAvailable) {
            return {
                success: false,
                error: "Database not available",
            }
        }

        const { db } = await import("@/lib/db")
        const { sellerResponses } = await import("@/lib/db/schema")
        const { eq } = await import("drizzle-orm")

        // Check if response already exists
        const existingResponse = await db
            .select()
            .from(sellerResponses)
            .where(eq(sellerResponses.reviewId, reviewId))
            .limit(1)

        if (existingResponse.length > 0) {
            // Update existing response
            const [updatedResponse] = await db
                .update(sellerResponses)
                .set({
                    response,
                    sellerId: session.user.id,
                })
                .where(eq(sellerResponses.id, existingResponse[0].id))
                .returning()

            return {
                success: true,
                data: updatedResponse,
            }
        } else {
            // Create new response
            const [newResponse] = await db
                .insert(sellerResponses)
                .values({
                    reviewId,
                    sellerId: session.user.id,
                    response,
                })
                .returning()

            return {
                success: true,
                data: newResponse,
            }
        }
    } catch (error) {
        return {
            success: false,
            error: "Failed to add seller response",
        }
    }
}

/**
 * Check if user can write a review (has purchased and hasn't reviewed yet)
 */
export async function canUserWriteReview(
    productId: number
): Promise<ReviewResponse> {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user?.id) {
            return {
                success: true,
                data: { 
                    canWrite: false, 
                    reason: "not_authenticated",
                    message: "You must be logged in to write a review"
                },
            }
        }

        const dbAvailable = await isDatabaseAvailable()
        if (!dbAvailable) {
            return {
                success: false,
                error: "Database not available",
            }
        }

        const { db } = await import("@/lib/db")
        const { reviews } = await import("@/lib/db/schema")
        const { eq, and } = await import("drizzle-orm")

        // Check if user already reviewed this product
        const existingReview = await db
            .select()
            .from(reviews)
            .where(
                and(
                    eq(reviews.productId, productId),
                    eq(reviews.userId, session.user.id)
                )
            )
            .limit(1)

        if (existingReview.length > 0) {
            return {
                success: true,
                data: {
                    canWrite: false,
                    reason: "already_reviewed",
                    message: "You have already reviewed this product",
                    existingReview: existingReview[0]
                },
            }
        }

        // Check if user has purchased the product
        const hasPurchased = await checkPurchaseVerification(session.user.id, productId)
        
        if (!hasPurchased) {
            return {
                success: true,
                data: {
                    canWrite: false,
                    reason: "not_purchased",
                    message: "You must purchase this product before you can write a review"
                },
            }
        }

        return {
            success: true,
            data: {
                canWrite: true,
                reason: "eligible",
                message: "You can write a review for this product"
            },
        }
    } catch (error) {
        return {
            success: false,
            error: "Failed to check review eligibility",
        }
    }
}

/**
 * Check if user has reviewed a product
 */
export async function hasUserReviewedProduct(
    productId: number
): Promise<ReviewResponse> {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user?.id) {
            return {
                success: true,
                data: { hasReviewed: false },
            }
        }

        const dbAvailable = await isDatabaseAvailable()
        if (!dbAvailable) {
            return {
                success: false,
                error: "Database not available",
            }
        }

        const { db } = await import("@/lib/db")
        const { reviews } = await import("@/lib/db/schema")
        const { eq, and } = await import("drizzle-orm")

        const existingReview = await db
            .select()
            .from(reviews)
            .where(
                and(
                    eq(reviews.productId, productId),
                    eq(reviews.userId, session.user.id)
                )
            )
            .limit(1)

        return {
            success: true,
            data: {
                hasReviewed: existingReview.length > 0,
                review: existingReview[0] || null,
            },
        }
    } catch (error) {
        // console.error("Check user review error:", error)
        return {
            success: false,
            error: "Failed to check review status",
        }
    }
}
