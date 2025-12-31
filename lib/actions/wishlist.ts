/**
 * 🔄 REBUILT Wishlist Server Actions - Clean & Simple
 * 
 * Core principles:
 * - All actions work with DB only
 * - Simple error handling
 * - Clear transaction boundaries
 */

"use server"

import { db } from "@/lib/db"
import { wishlist, wishlistItems, products, users } from "@/lib/db/schema"
import { eq, and, desc, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// ============================================================================
// Get user's full wishlist with product details
// ============================================================================
export async function getWishlistFull(userId: number) {
  try {
    const userWishlist = await db.query.wishlist.findFirst({
      where: eq(wishlist.userId, userId),
      with: {
        items: {
          with: {
            product: {
              with: {
                category: true,
              },
            },
          },
          orderBy: [desc(wishlistItems.createdAt)],
        },
      },
    })

    if (!userWishlist) {
      return {
        success: true,
        data: {
          id: 0,
          userId,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }
    }

    return {
      success: true,
      data: userWishlist,
    }
  } catch (error) {
    return {
      success: false,
      error: "Failed to fetch wishlist",
    }
  }
}

// ============================================================================
// Add product to wishlist
// ============================================================================
export async function addToWishlist(userId: number, productId: number) {
  try {
    const result = await db.transaction(async (tx) => {
      // Get or create wishlist
      let userWishlist = await tx.query.wishlist.findFirst({
        where: eq(wishlist.userId, userId),
      })

      if (!userWishlist) {
        const [newWishlist] = await tx
          .insert(wishlist)
          .values({ userId })
          .returning()
        userWishlist = newWishlist
      }

      // Check if already exists
      const existingItem = await tx.query.wishlistItems.findFirst({
        where: and(
          eq(wishlistItems.wishlistId, userWishlist.id),
          eq(wishlistItems.productId, productId)
        ),
      })

      if (existingItem) {
        throw new Error("Product already in wishlist")
      }

      // Verify product exists
      const product = await tx.query.products.findFirst({
        where: eq(products.id, productId)
      })

      if (!product) {
        throw new Error("Product not found")
      }

      // Add to wishlist
      const [newItem] = await tx
        .insert(wishlistItems)
        .values({
          wishlistId: userWishlist.id,
          productId,
        })
        .returning()

      // Update timestamp
      await tx
        .update(wishlist)
        .set({ updatedAt: new Date() })
        .where(eq(wishlist.id, userWishlist.id))

      return newItem
    })

    revalidatePath("/wishList")
    revalidatePath("/")

    return {
      success: true,
      data: result,
      message: "Product added to wishlist",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add product",
    }
  }
}

// ============================================================================
// Remove product from wishlist
// ============================================================================
export async function removeFromWishlist(userId: number, productId: number) {
  try {
    await db.transaction(async (tx) => {
      const userWishlist = await tx.query.wishlist.findFirst({
        where: eq(wishlist.userId, userId),
      })

      if (!userWishlist) {
        throw new Error("Wishlist not found")
      }

      await tx
        .delete(wishlistItems)
        .where(
          and(
            eq(wishlistItems.wishlistId, userWishlist.id),
            eq(wishlistItems.productId, productId)
          )
        )

      await tx
        .update(wishlist)
        .set({ updatedAt: new Date() })
        .where(eq(wishlist.id, userWishlist.id))
    })

    revalidatePath("/wishList")
    revalidatePath("/")

    return {
      success: true,
      message: "Product removed from wishlist",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove product",
    }
  }
}

// ============================================================================
// Clear entire wishlist
// ============================================================================
export async function clearWishlist(userId: number) {
  try {
    await db.transaction(async (tx) => {
      const userWishlist = await tx.query.wishlist.findFirst({
        where: eq(wishlist.userId, userId),
      })

      if (!userWishlist) {
        throw new Error("Wishlist not found")
      }

      await tx
        .delete(wishlistItems)
        .where(eq(wishlistItems.wishlistId, userWishlist.id))

      await tx
        .update(wishlist)
        .set({ updatedAt: new Date() })
        .where(eq(wishlist.id, userWishlist.id))
    })

    revalidatePath("/wishList")

    return {
      success: true,
      message: "Wishlist cleared",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to clear wishlist",
    }
  }
}

// ============================================================================
// Move all wishlist items to cart
// ============================================================================
export async function moveWishlistToCart(userId: number) {
  try {
    const result = await db.transaction(async (tx) => {
      // Get wishlist with items
      const userWishlist = await tx.query.wishlist.findFirst({
        where: eq(wishlist.userId, userId),
        with: {
          items: {
            with: { product: true }
          }
        }
      })

      if (!userWishlist || userWishlist.items.length === 0) {
        throw new Error("Wishlist is empty")
      }

      // Get or create cart
      const { cart: cartTable, cartItems } = await import("@/lib/db/schema")
      let userCart = await tx.query.cart.findFirst({
        where: eq(cartTable.userId, userId),
        with: { items: true }
      })

      if (!userCart) {
        const [newCart] = await tx
          .insert(cartTable)
          .values({ userId, totalAmount: "0" })
          .returning()
        userCart = { ...newCart, items: [] }
      }

      // Add items to cart
      let addedCount = 0
      for (const item of userWishlist.items) {
        const existingCartItem = userCart.items?.find(ci => ci.productId === item.productId)

        if (existingCartItem) {
          await tx
            .update(cartItems)
            .set({ quantity: existingCartItem.quantity + 1 })
            .where(eq(cartItems.id, existingCartItem.id))
        } else {
          await tx
            .insert(cartItems)
            .values({
              cartId: userCart.id,
              productId: item.productId,
              quantity: 1
            })
        }
        addedCount++
      }

      // Clear wishlist
      await tx
        .delete(wishlistItems)
        .where(eq(wishlistItems.wishlistId, userWishlist.id))

      await tx
        .update(wishlist)
        .set({ updatedAt: new Date() })
        .where(eq(wishlist.id, userWishlist.id))

      // Update cart total
      const { calculateCartTotal } = await import("@/lib/utils/pricing")
      const updatedCart = await tx.query.cart.findFirst({
        where: eq(cartTable.id, userCart.id),
        with: {
          items: {
            with: { product: true }
          }
        }
      })

      if (updatedCart) {
        const { total } = calculateCartTotal(
          updatedCart.items.map(item => ({
            product: item.product,
            quantity: item.quantity
          }))
        )

        await tx
          .update(cartTable)
          .set({ totalAmount: String(total) })
          .where(eq(cartTable.id, userCart.id))
      }

      return { added: addedCount }
    })

    revalidatePath("/wishList")
    revalidatePath("/cart")

    return {
      success: true,
      message: `${result.added} items moved to cart`,
      data: result
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to move items"
    }
  }
}

// ============================================================================
// Merge guest wishlist with user wishlist (on login)
// ============================================================================
export async function mergeGuestWishlistWithUserWishlist(
  userId: number,
  guestWishlistItems: { productId: number }[]
) {
  try {
    if (!guestWishlistItems || guestWishlistItems.length === 0) {
      return {
        success: true,
        message: "No guest items to merge",
        data: { added: 0, skipped: 0 }
      }
    }

    const result = await db.transaction(async (tx) => {
      // Get or create wishlist
      let userWishlist = await tx.query.wishlist.findFirst({
        where: eq(wishlist.userId, userId),
        with: { items: true }
      })

      if (!userWishlist) {
        const [newWishlist] = await tx
          .insert(wishlist)
          .values({ userId })
          .returning()
        userWishlist = { ...newWishlist, items: [] }
      }

      // Get unique guest product IDs
      const uniqueProductIds = Array.from(new Set(guestWishlistItems.map(i => i.productId)))

      // Check which products exist
      const validProducts = await tx.query.products.findMany({
        where: inArray(products.id, uniqueProductIds)
      })

      const validProductIds = new Set(validProducts.map(p => p.id))
      const existingProductIds = new Set(userWishlist.items?.map(i => i.productId) || [])

      // Filter: valid + not duplicate
      const toInsert = uniqueProductIds.filter(
        pid => validProductIds.has(pid) && !existingProductIds.has(pid)
      )

      // Insert new items
      if (toInsert.length > 0) {
        await tx.insert(wishlistItems).values(
          toInsert.map(pid => ({
            wishlistId: userWishlist.id,
            productId: pid
          }))
        )
      }

      // Update timestamp
      await tx
        .update(wishlist)
        .set({ updatedAt: new Date() })
        .where(eq(wishlist.id, userWishlist.id))

      return {
        added: toInsert.length,
        skipped: uniqueProductIds.length - toInsert.length
      }
    })

    revalidatePath("/wishList")

    return {
      success: true,
      message: `Merged ${result.added} items`,
      data: result
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to merge wishlist"
    }
  }
}
