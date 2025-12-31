"use server"

import { db } from "@/lib/db/index"
import { cart, cartItems, coupons, users, products } from "@/lib/db/schema"
import { eq, and, inArray } from "drizzle-orm"
import { 
    validateQuantity, 
    calculateCartTotal,
    toNumber 
} from "@/lib/utils/pricing"


// /////////////////////////////////////////////////////////////////////////
///////                                                              ///////
///////  إنشاء كارت جديد للمستخدم                                  ///////
///////                                                              ///////
// /////////////////////////////////////////////////////////////////////////
export async function createCart(userId: number) {
    try {
        
        // First verify the user exists
        const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
        if (!user) {
            return { success: false, error: "User not found" }
        }

        const [newCart] = await db
            .insert(cart)
            .values({
                userId,
                totalAmount: "0",
            })
            .returning()
        
        return { success: true, data: newCart }
    } catch (error) {
        return { success: false, error: "Failed to create cart" }
    }
}

// //////////////////////////////////////////////////////////////////////////
///////                                                               ///////
///////  جلب الكارت مع العناصر والمنتجات                           ///////
///////                                                              ///////
// /////////////////////////////////////////////////////////////////////////
export async function getCartFull(userId: number) {
    try {
        console.log("🔍 getCartFull: Fetching cart for userId:", userId)
        
        const result = await db.query.cart.findFirst({
            where: eq(cart.userId, userId),
            with: {
                items: {
                    with: {
                        product: true,
                    },
                },
                coupon: true,
            },
        })

        console.log("📊 getCartFull result:", {
            found: !!result,
            cartId: result?.id,
            itemsCount: result?.items?.length || 0,
            totalAmount: result?.totalAmount
        })
        
        if (result?.items) {
            console.log("📋 Cart items details:", result.items.map(item => ({
                id: item.id,
                productId: item.productId,
                productName: item.product?.nameEn,
                quantity: item.quantity
            })))
        }
        
        if (!result) {
            console.log("⚠️ getCartFull: Cart not found for user")
            return { success: true, data: null, message: "Cart not found" }
        }

        // ✅ Add stock status to items
        const itemsWithStockStatus = result.items.map(item => {
            const stock = item.product.quantityInStock ?? 0
            return {
                ...item,
                isOutOfStock: stock <= 0,
                isLowStock: stock > 0 && stock < item.quantity,
                availableQuantity: stock,
            }
        })

        console.log("✅ getCartFull: Returning cart with", result.items?.length || 0, "items")
        return { 
            success: true, 
            data: {
                ...result,
                items: itemsWithStockStatus
            }
        }
    } catch (error) {
        console.error("❌ getCartFull error:", error)
        return { success: false, error: "Failed to fetch cart" }
    }
}

// //////////////////////////////////////////////////////////////////////////
///////                                                               ///////
///////  إضافة منتج إلى كارت                                        ///////
///////                                                               ///////
// //////////////////////////////////////////////////////////////////////////
export async function addToCartAction(userId: number, productId: number, quantity: number) {
    try {
        // 🔒 Use transaction for atomic operations
        const result = await db.transaction(async (tx) => {
            // التحقق من وجود المستخدم أولاً
            const user = await tx.query.users.findFirst({ where: eq(users.id, userId) });
            if (!user) {
                throw new Error("User not found");
            }

            // التحقق من وجود المنتج
            const product = await tx.query.products.findFirst({ where: eq(products.id, productId) });
            if (!product) {
                throw new Error("Product not found");
            }

            // ✅ Check if product has stock info
            const productStock = product.quantityInStock ?? 0

            // ✅ Validate quantity
            const validation = validateQuantity(quantity, productStock)
            if (!validation.valid) {
                throw new Error(validation.error ?? "Invalid quantity");
            }

            // ✅ Check stock availability
            if (productStock < quantity) {
                throw new Error(`Only ${productStock} items available in stock`);
            }

            // شوف هل فيه كارت موجود ولا لأ
            let [userCart] = await tx.select().from(cart).where(eq(cart.userId, userId));

            if (!userCart) {
                // Create new cart within transaction
                [userCart] = await tx
                    .insert(cart)
                    .values({
                        userId,
                        totalAmount: "0",
                    })
                    .returning();
            }

            // شوف المنتج موجود قبل كده في cart_items
            let [existing] = await tx
                .select()
                .from(cartItems)
                .where(
                    and(eq(cartItems.cartId, userCart.id), eq(cartItems.productId, productId))
                );

            let item;
            if (existing) {
                const newQuantity = existing.quantity + quantity;
                
                // ✅ Validate total quantity after adding
                if (newQuantity > productStock) {
                    throw new Error(`Cannot add ${quantity} more. Only ${productStock - existing.quantity} available`);
                }
                
                [item] = await tx
                    .update(cartItems)
                    .set({ 
                        quantity: newQuantity,
                        updatedAt: new Date()
                    })
                    .where(eq(cartItems.id, existing.id))
                    .returning();
            } else {
                [item] = await tx
                    .insert(cartItems)
                    .values({
                        cartId: userCart.id,
                        productId,
                        quantity,
                    })
                    .returning();
            }

            // ✅ Recalculate cart total within transaction
            await recalcCartTotalTx(tx, userCart.id)

            return { item, cartId: userCart.id };
        });

        return { success: true, data: result.item };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to add item to cart";
        console.error("❌ addToCartAction error:", errorMessage);
        return { success: false, error: errorMessage };
    }
}



// //////////////////////////////////////////////////////////////////////////
///////                                                               ///////
///////  تحديث كمية منتج معين                                        ///////
///////                                                               ///////
// //////////////////////////////////////////////////////////////////////////
export async function updateCartItem(cartItemId: number, qty: number) {
    try {
        // 🔒 Use transaction for atomic operations
        const result = await db.transaction(async (tx) => {
            // ✅ Get item with product info first
            const item = await tx.query.cartItems.findFirst({
                where: eq(cartItems.id, cartItemId),
                with: { product: true }
            })

            if (!item) {
                throw new Error("Cart item not found")
            }

            const productStock = item.product.quantityInStock ?? 0

            // ✅ Validate quantity
            const validation = validateQuantity(qty, productStock)
            if (!validation.valid) {
                throw new Error(validation.error ?? "Invalid quantity")
            }

            // ✅ Check stock availability
            if (productStock < qty) {
                throw new Error(`Only ${productStock} items available in stock`)
            }

            const [updated] = await tx
                .update(cartItems)
                .set({ 
                    quantity: qty,
                    updatedAt: new Date()
                })
                .where(eq(cartItems.id, cartItemId))
                .returning()

            // ✅ Recalculate cart total within transaction
            await recalcCartTotalTx(tx, updated.cartId)

            return { cartId: updated.cartId, itemId: updated.id }
        })

        return { success: true, data: result }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to update cart item"
        console.error("❌ updateCartItem error:", errorMessage)
        return { success: false, error: errorMessage }
    }
}

// //////////////////////////////////////////////////////////////////////////
///////                                                               ///////
///////  إزالة منتج من الكارت                                        ///////
///////                                                               ///////
// //////////////////////////////////////////////////////////////////////////
export async function removeCartItem(cartItemId: number) {
    try {
        // 🔒 Use transaction for atomic operations
        const result = await db.transaction(async (tx) => {
            // Fetch the item first to get cartId reliably
            const existing = await tx.query.cartItems.findFirst({
                where: eq(cartItems.id, cartItemId),
            })

            if (!existing) {
                throw new Error("Cart item not found")
            }

            await tx
                .delete(cartItems)
                .where(eq(cartItems.id, cartItemId))

            // ✅ Recalculate cart total within transaction
            await recalcCartTotalTx(tx, existing.cartId)

            return { cartId: existing.cartId }
        })

        return { success: true, data: result }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to remove cart item"
        console.error("❌ removeCartItem error:", errorMessage)
        return { success: false, error: errorMessage }
    }
}

// ////////////////////////////////////////////////////////////////////////////////
///////                                                                      ///////
///////  تطبيق كوبون على الكارت                                               ///////
///////                                                                      ///////
// ////////////////////////////////////////////////////////////////////////////////
export async function applyCouponAction(cartId: number, code: string) {
    try {
        
        const coupon = await db.query.coupons.findFirst({ where: eq(coupons.code, code.toUpperCase()) })
        if (!coupon || !coupon.isActive) {
            return { success: false, error: "Invalid or inactive coupon" }
        }

        // Validate coupon validity window
        const now = new Date()
        const startsOk = !coupon.validFrom || new Date(coupon.validFrom as unknown as string | Date) <= now
        const endsOk = !coupon.validTo || now <= new Date(coupon.validTo as unknown as string | Date)
        if (!startsOk || !endsOk) {
            return { success: false, error: "Coupon is expired or not yet valid" }
        }

        
        const [updatedCart] = await db.update(cart).set({ couponId: coupon.id }).where(eq(cart.id, cartId)).returning()
        
        return await recalcCartTotal(cartId)
    } catch (error) {
        // console.error("Error applying coupon:", error)
        return { success: false, error: "Failed to apply coupon" }
    }
}

// //////////////////////////////////////////////////////////////////////////
///////                                                               ///////
///////  إلغاء الكوبون                                                ///////
///////                                                               ///////
// //////////////////////////////////////////////////////////////////////////
export async function removeCouponAction(cartId: number) {
    try {
        await db.update(cart).set({ couponId: null }).where(eq(cart.id, cartId))
        return await recalcCartTotal(cartId)
    } catch (error) {
        // console.error("Error removing coupon:", error)
        return { success: false, error: "Failed to remove coupon" }
    }
}

// /////////////////////////////////////////////////////////////////////////////////
///////                                                                      ///////
///////  حذف الكارت بالكامل                                                ///////
///////                                                                     ///////
// ////////////////////////////////////////////////////////////////////////////////   
export async function clearCart(cartId: number) {
    try {
        // 🔒 Use transaction for atomic operations
        await db.transaction(async (tx) => {
            await tx.delete(cartItems).where(eq(cartItems.cartId, cartId))
            await tx.update(cart).set({ totalAmount: "0", couponId: null }).where(eq(cart.id, cartId))
        })
        return { success: true }
    } catch (error) {
        console.error("❌ clearCart error:", error)
        return { success: false, error: "Failed to clear cart" }
    }
}

// ////////////////////////////////////////////////////////////////////////////////
///////                                                                      ///////
///////  دالة مساعدة لإعادة حساب إجمالي الكارت (with transaction support)  ///////
///////                                                                      ///////
// ////////////////////////////////////////////////////////////////////////////////
async function recalcCartTotalTx(tx: any, cartId: number) {
    console.log("🧮 Recalculating cart total for cartId:", cartId)
    
    const items = await tx.query.cartItems.findMany({
        where: eq(cartItems.cartId, cartId),
        with: { product: true },
    })
    
    console.log("📊 Found", items.length, "items in cart")

    // Get cart with coupon
    const cartData = await tx.query.cart.findFirst({
        where: eq(cart.id, cartId),
        with: { coupon: true },
    })

    // ✅ Use centralized pricing utility
    const { total } = calculateCartTotal(
        items.map((item: any) => ({
            product: item.product,
            quantity: item.quantity
        })),
        cartData?.coupon || null
    )

    // Drizzle decimal columns expect string inputs
    const totalStr = String(total.toFixed(2))
    console.log("💰 Cart total calculated:", totalStr)
    
    await tx.update(cart).set({ totalAmount: totalStr }).where(eq(cart.id, cartId))
    console.log("✅ Cart total updated in DB")
    
    return { success: true, data: { cartId, total, items } }
}

// 🟢 دالة مساعدة لإعادة حساب إجمالي الكارت (legacy - without transaction)
async function recalcCartTotal(cartId: number) {
    return db.transaction(async (tx) => {
        return await recalcCartTotalTx(tx, cartId)
    })
}

// //////////////////////////////////////////////////////////////////////////////
///////                                                                   ///////
///////  دمج عربة الزائر مع عربة المستخدم المسجل                      ///////
///////                                                                  ///////
// /////////////////////////////////////////////////////////////////////////////
export async function mergeGuestCartWithUserCart(
    userId: number, 
    guestCartItems: { productId: number; quantity: number }[]
) {
    try {
        console.log('🔀 Starting merge for user:', userId, 'with', guestCartItems.length, 'items')
        
        if (!guestCartItems || guestCartItems.length === 0) {
            console.log('ℹ️ No guest cart items to merge')
            return { success: true, message: "No guest cart items to merge" }
        }

        // 🔒 Use transaction for atomic merge operation
        const result = await db.transaction(async (tx) => {
            // التحقق من وجود المستخدم
            const user = await tx.query.users.findFirst({ where: eq(users.id, userId) })
            if (!user) {
                console.log('❌ User not found:', userId)
                throw new Error("User not found")
            }

            console.log('✅ User found:', user.email)

            // البحث عن عربة المستخدم أو إنشاء واحدة جديدة
            const existingCart = await tx.select().from(cart).where(eq(cart.userId, userId))
            
            let userCart
            if (!existingCart || existingCart.length === 0) {
                console.log('📦 Creating new cart for user')
                const [newCart] = await tx
                    .insert(cart)
                    .values({
                        userId,
                        totalAmount: "0",
                    })
                    .returning();
                userCart = newCart
                console.log('✅ Cart created with ID:', userCart.id)
            } else {
                userCart = existingCart[0]
                console.log('✅ Found existing cart with ID:', userCart.id)
            }

            // ✅ Batch: Fetch all products at once (Fix N+1 query problem)
            const productIds = guestCartItems.map(item => item.productId)
            console.log('🔍 Fetching products in batch:', productIds)
            
            const allProducts = await tx.query.products.findMany({
                where: inArray(products.id, productIds)
            })
            
            // Create a map for O(1) lookup
            const productsMap = new Map(allProducts.map((p: any) => [p.id, p]))
            console.log(`✅ Found ${allProducts.length}/${productIds.length} products`)

            // ✅ Batch: Fetch all existing cart items at once
            const existingItems = await tx.query.cartItems.findMany({
                where: and(
                    eq(cartItems.cartId, userCart.id),
                    inArray(cartItems.productId, productIds)
                )
            })
            
            // Create a map for O(1) lookup
            const existingMap = new Map(existingItems.map((item: any) => [item.productId, item]))
            console.log(`✅ Found ${existingItems.length} existing items in cart`)

            // ✅ Prepare batch operations with stock validation
            const toInsert: Array<typeof cartItems.$inferInsert> = []
            const toUpdate: Array<{ id: number; quantity: number }> = []
            
            for (const guestItem of guestCartItems) {
                const product = productsMap.get(guestItem.productId)
                
                if (!product) {
                    console.log('⚠️ Product not found, skipping:', guestItem.productId)
                    continue
                }

                // ✅ Validate stock availability
                const productStock = product.quantityInStock ?? 0
                const existing = existingMap.get(guestItem.productId)
                const finalQuantity = existing 
                    ? existing.quantity + guestItem.quantity 
                    : guestItem.quantity

                if (finalQuantity > productStock) {
                    console.log(`⚠️ Not enough stock for product ${guestItem.productId}. Requested: ${finalQuantity}, Available: ${productStock}`)
                    // Skip or use available stock
                    continue
                }

                if (existing) {
                    // Prepare update
                    toUpdate.push({
                        id: existing.id,
                        quantity: finalQuantity
                    })
                } else {
                    // Prepare insert
                    toInsert.push({
                        cartId: userCart.id,
                        productId: guestItem.productId,
                        quantity: guestItem.quantity,
                    })
                }
            }

            // ✅ Execute batch operations within transaction
            if (toInsert.length > 0) {
                await tx.insert(cartItems).values(toInsert)
                console.log(`✅ Inserted ${toInsert.length} new items`)
            }

            if (toUpdate.length > 0) {
                // Update in batch
                for (const item of toUpdate) {
                    await tx.update(cartItems)
                        .set({ 
                            quantity: item.quantity,
                            updatedAt: new Date()
                        })
                        .where(eq(cartItems.id, item.id))
                }
                console.log(`✅ Updated ${toUpdate.length} existing items`)
            }

            console.log('✅ Merge complete:', { 
                added: toInsert.length, 
                updated: toUpdate.length 
            })

            // إعادة حساب إجمالي العربة within transaction
            console.log('🧮 Recalculating cart total...')
            await recalcCartTotalTx(tx, userCart.id)

            return { cartId: userCart.id, added: toInsert.length, updated: toUpdate.length }
        })

        console.log('✅ Guest cart merged successfully!')
        return { success: true, message: "Guest cart merged successfully", data: result }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to merge guest cart"
        console.error("❌ mergeGuestCartWithUserCart error:", errorMessage)
        return { success: false, error: errorMessage }
    }
}
