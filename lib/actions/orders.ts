"use server";

import { db } from "@/lib/db";
import { orders, orderItems, products, cart, cartItems, users, orderNotes } from "@/lib/db/schema";
import { eq, or, ilike, inArray, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type CartItem } from "@/types/cart";
import { sendOrderConfirmationEmail } from "@/lib/email/email-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";



// ////////////////////////////////////////////////////////////////////////////////
///////                                                                      ///////
///////  جلب تفاصيل الطلب بالكامل                                         ///////
///////                                                                      ///////
// ////////////////////////////////////////////////////////////////////////////////
export async function getOrderById(id: string) {
  try {
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return null;
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        user: true,
        coupon: true,
        items: {
          with: {
            product: true,
          },
        },
        notes: {
          with: {
            user: true
          }
        }
      },
    });

    return order;
  } catch (error) {
    // console.error(`Failed to fetch order with id ${id}:`, error);
    return null;
  }
}

// ////////////////////////////////////////////////////////////////////////////////
///////                                                                      ///////
///////  جلب جميع الطلبات                                                   ///////
///////                                                                      ///////
// ////////////////////////////////////////////////////////////////////////////////
export async function getOrders() {
  try {
    const allOrders = await db.query.orders.findMany({
      with: {
        user: true,
        coupon: true,
      },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    });
    return allOrders;
  } catch (error) {
    // console.error("Failed to fetch all orders:", error);
    return [];
  }
}

// ////////////////////////////////////////////////////////////////////////////////
///////                                                                      ///////
///////  البحث في الطلبات                                                   ///////
///////                                                                      ///////
// ////////////////////////////////////////////////////////////////////////////////
export async function searchOrders(query: string) {
  try {
    const userIds = await db.select({ id: users.id }).from(users).where(or(
        ilike(users.username, `%${query}%`),
        ilike(users.email, `%${query}%`)
    ));
    const matchingUserIds = userIds.map(u => u.id);

    const whereClauses = [
        ilike(orders.status, `%${query}%`)
    ];

    if (matchingUserIds.length > 0) {
        whereClauses.push(inArray(orders.userId, matchingUserIds));
    }

    if (!isNaN(parseInt(query))) {
        whereClauses.push(eq(orders.id, parseInt(query)));
    }

    const searchResults = await db.query.orders.findMany({
      with: {
        user: true,
        coupon: true,
      },
      where: or(...whereClauses),
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    });
    return searchResults;
  } catch (error) {
    // console.error("Failed to search orders:", error);
    return [];
  }
}

// ////////////////////////////////////////////////////////////////////////////////
///////                                                                      ///////
///////  جلب جميع الطلبات لمستخدم معين                                     ///////
///////                                                                      ///////
// ////////////////////////////////////////////////////////////////////////////////
export async function getUserOrders(userId: number) {
  try {
    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, userId),
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    });

    return userOrders;
  } catch (error) {
    // console.error("Failed to fetch user orders:", error);
    return [];
  }
}

// ////////////////////////////////////////////////////////////////////////////////
///////                                                                      ///////
///////  تحديث حالة الطلب                                                   ///////
///////                                                                      ///////
// ////////////////////////////////////////////////////////////////////////////////
export async function updateOrderStatus(id: number, status: "pending" | "processing" | "shipped" | "delivered" | "cancelled") {
  try {
    const [updatedOrder] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    if (updatedOrder) {
      revalidatePath("/dashboard/orders");
      revalidatePath(`/dashboard/orders/${id}`);
      return { success: true, data: updatedOrder };
    }
    return { success: false, error: "Order not found" };
  } catch (error) {
    // console.error("Error updating order status:", error);
    return { success: false, error: "Failed to update order status" };
  }
}

// ////////////////////////////////////////////////////////////////////////////////
///////                                                                      ///////
///////  حذف الطلب                                                        ///////
///////                                                                      ///////
// ////////////////////////////////////////////////////////////////////////////////
export async function deleteOrder(id: number) {
  try {
    const [deletedOrder] = await db.delete(orders).where(eq(orders.id, id)).returning();
    if (deletedOrder) {
      revalidatePath("/dashboard/orders");
      return { success: true };
    }
    return { success: false, error: "Order not found" };
  } catch (error) {
    // console.error("Error deleting order:", error);
    return { success: false, error: "Failed to delete order" };
  }
}

// ////////////////////////////////////////////////////////////////////////////////
///////                                                                      ///////
///////  إنشاء طلب جديد من كارت                                            ///////
///////                                                                      ///////
// ////////////////////////////////////////////////////////////////////////////////
export async function createOrderFromCart(
  userId: number,
  shippingAddress: string,
  shippingMethod: string,
  shippingCost: number,
  paymentType: string,
  paymentStatus: string,
  cartItemsData: CartItem[],
  subtotal: number,
  discountAmount: number,
  totalAmount: number,
  couponId: number | null
) {
  try {
    // 🔒 Use transaction for atomic order creation with stock validation
    const newOrder = await db.transaction(async (tx) => {
      // ✅ 1. Re-validate stock availability before creating order
      const productIds = cartItemsData.map(item => item.productId)
      const productsToCheck = await tx.query.products.findMany({
        where: inArray(products.id, productIds)
      })
      
      // Create a map for quick lookup
      const productsMap = new Map(productsToCheck.map(p => [p.id, p]))
      
      // Validate each item
      const outOfStockItems: string[] = []
      for (const item of cartItemsData) {
        const product = productsMap.get(item.productId)
        if (!product) {
          throw new Error(`Product ${item.productId} not found`)
        }
        
        const availableStock = product.quantityInStock ?? 0
        if (availableStock < item.quantity) {
          outOfStockItems.push(
            `${product.nameEn} (requested: ${item.quantity}, available: ${availableStock})`
          )
        }
      }
      
      // ✅ Fail if any items are out of stock
      if (outOfStockItems.length > 0) {
        throw new Error(
          `The following items are out of stock: ${outOfStockItems.join(', ')}`
        )
      }
      
      // 2. Create the order
      const [order] = await tx
        .insert(orders)
        .values({
          userId,
          shippingAddress,
          shippingMethod,
          shippingCost: String(shippingCost),
          discountAmount: String(discountAmount),
          couponId,
          subtotal: String(subtotal),
          totalAmount: String(totalAmount),
          status: "pending",
          paymentType,
          paymentStatus,
        })
        .returning();

      // 3. Create order items
      const orderItemsValues = cartItemsData.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price!,
      }));

      await tx.insert(orderItems).values(orderItemsValues);

      // 4. Update product stock atomically
      for (const item of cartItemsData) {
        const product = productsMap.get(item.productId)!
        const currentStock = product.quantityInStock ?? 0
        const newStock = Math.max(0, currentStock - item.quantity)
        
        await tx
          .update(products)
          .set({ quantityInStock: newStock })
          .where(eq(products.id, item.productId))
      }

      // 5. Clear user's cart
      const userCart = await tx.query.cart.findFirst({
        where: eq(cart.userId, userId),
      });

      if (userCart) {
        await tx.delete(cartItems).where(eq(cartItems.cartId, userCart.id));
        await tx.update(cart).set({ totalAmount: "0", couponId: null }).where(eq(cart.id, userCart.id))
      }
      
      return order
    })

    // 5. Send order confirmation email (don't block order creation if email fails)
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (user?.email) {
        const lang = 'en' as 'ar' | 'en'; // You can pass this as parameter if needed
        const orderDate = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');
        
        const emailItems = cartItemsData.map((item) => ({
          name: item.product.nameEn || 'Product',
          quantity: item.quantity,
          price: parseFloat(item.product.price || '0'),
        }));

        await sendOrderConfirmationEmail(
          user.email,
          {
            userName: user.username || 'Customer',
            orderNumber: `${newOrder.id}`,
            orderDate,
            items: emailItems,
            totalAmount,
            shippingAddress,
          },
          lang as 'ar' | 'en'
        );
      }
    } catch (emailError) {
      // console.error("Failed to send order confirmation email:", emailError);
      // Continue even if email fails
    }

    // 6. Revalidate paths
    revalidatePath("/dashboard/orders");
    revalidatePath(`/orders/${newOrder.id}`);
    revalidatePath("/cart");
    // Revalidate product pages
    const productIds = cartItemsData.map((item) => item.productId);
    productIds.forEach(id => revalidatePath(`/products/${id}`));


    return { success: true, data: newOrder };
  } catch (error) {
    // console.error("Error creating order from cart:", error);
    return { success: false, error: "Failed to create order from cart" };
  }
}

// ////////////////////////////////////////////////////////////////////////////////
///////                                                                      ///////
///////  إنشاء طلب جديد من صفحة الشحن                                        ///////
///////                                                                      ///////
// ////////////////////////////////////////////////////////////////////////////////
export async function placeOrderFromCheckout(
  context: {
    userId: number | undefined;
    cartItemsData: CartItem[];
    subtotal: number;
    discountAmount: number;
    couponId: number | null;
  },
  formData: FormData
) {
  const { userId, cartItemsData, subtotal, discountAmount, couponId } = context;

  if (!userId) {
    return { success: false, error: "User not authenticated" };
  }

  const shippingAddressFields = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    address: formData.get("address") as string,
    apartment: formData.get("apartment") as string,
    city: formData.get("city") as string,
    governorate: formData.get("governorate") as string,
    postalCode: formData.get("postalCode") as string,
  };

  const shippingAddress = Object.values(shippingAddressFields).filter(Boolean).join(', ');

  const shippingMethod = formData.get("selectedShippingMethod") as string;
  const paymentType = formData.get("paymentMethod") as string;
  const paymentStatus = "pending";
  const shippingCost = shippingMethod === 'express' ? 200 : 0;
  const totalAmount = subtotal - discountAmount + shippingCost;


  try {
    const res = await createOrderFromCart(
      userId,
      shippingAddress,
      shippingMethod,
      shippingCost,
      paymentType,
      paymentStatus,
      cartItemsData,
      subtotal,
      discountAmount,
      totalAmount,
      couponId
    );
    
    if (res.success) revalidatePath("/order-success")

    return { success: true, data: res.data }
  } catch (error) {
    // console.error("Error placing order from checkout:", error);
    return { success: false, error: "Failed to place order from checkout" };
  }
}

// ////////////////////////////////////////////////////////////////////////////////
///////                                                                      ///////
///////  جلب ملاحظات الطلب                                                   ///////
///////                                                                      ///////
// ////////////////////////////////////////////////////////////////////////////////
export async function getOrderNotes(orderId: number) {
  try {
    const notes = await db.query.orderNotes.findMany({
      where: eq(orderNotes.orderId, orderId),
      with: {
        user: true,
      },
      orderBy: [desc(orderNotes.createdAt)],
    });
    return notes;
  } catch (error) {
    // console.error(`Failed to fetch notes for order ${orderId}:`, error);
    return [];
  }
}

// ////////////////////////////////////////////////////////////////////////////////
///////                                                                      ///////
///////  إضافة ملاحظة للطلب                                                 ///////
///////                                                                      ///////
// ////////////////////////////////////////////////////////////////////////////////
export async function addOrderNote(orderId: number, note: string, userId: number) {
  try {
    const [newNote] = await db.insert(orderNotes).values({
      orderId,
      note,
      userId,
    }).returning();

    revalidatePath(`/dashboard/orders/${orderId}`);

    return { success: true, data: newNote };
  } catch (error) {
    // console.error("Error adding order note:", error);
    return { success: false, error: "Failed to add note." };
  }
}

// ////////////////////////////////////////////////////////////////////////////////
///////                                                                      ///////
///////  تحديث حالة الدفع                                                    ///////
///////                                                                      ///////
// ////////////////////////////////////////////////////////////////////////////////
export async function updatePaymentStatus(orderId: number, paymentStatus: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // التحقق من وجود الطلب
    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!existingOrder) {
      return { success: false, error: "Order not found" };
    }

    // تحديث حالة الدفع
    const [updatedOrder] = await db
      .update(orders)
      .set({ 
        paymentStatus,
        updatedAt: new Date() 
      })
      .where(eq(orders.id, orderId))
      .returning();

    // إضافة ملاحظة تلقائية عن تغيير حالة الدفع
    const statusMessages = {
      pending: "Payment status set to pending",
      paid: "Payment confirmed - Order paid successfully", 
      failed: "Payment failed - Order payment unsuccessful",
      refunded: "Payment refunded - Amount returned to customer"
    };

    if (session.user.id) {
      await addOrderNote(
        orderId, 
        statusMessages[paymentStatus as keyof typeof statusMessages] || `Payment status updated to: ${paymentStatus}`,
        session.user.id
      );
    }

    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);

    return { success: true, data: updatedOrder };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return { success: false, error: "Failed to update payment status" };
  }
}