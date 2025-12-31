/**
 * Unified Cart Hook - Single Source of Truth
 * Simplifies cart management across guest and authenticated users
 * Created: 2025-11-07
 */

import { useCartStore, type CartItem } from '@/lib/stores/cart-store'
import { useAuth, useI18nStore } from '@/lib/stores'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useState, useCallback } from 'react'

export interface UseCartReturn {
  // State
  items: CartItem[]
  totalItems: number
  totalPrice: number
  isLoading: boolean
  error: string | null
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>
  updateItemQuantity: (cartItemId: number, quantity: number) => Promise<void>
  removeItem: (cartItemId: number) => Promise<void>
  clearCart: () => Promise<void>
  
  // Utilities
  getItemById: (cartItemId: number) => CartItem | undefined
  refresh: () => void
}

/**
 * Unified cart hook that handles both guest and authenticated users
 */
export function useCart(): UseCartReturn {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const { dir } = useI18nStore()
  
  const { 
    items: localItems, 
    getTotalItems,
    getTotalPrice,
    error,
    addItem: addItemLocal,
    updateQuantity: updateQuantityLocal,
    removeItem: removeItemLocal,
    clearCart: clearCartLocal,
    getItemById
  } = useCartStore()

  /**
   * Add item to cart (works for both guest and logged-in users)
   */
  const addItem = useCallback(async (item: Omit<CartItem, 'id'>) => {
    setIsLoading(true)
    try {
      // 🆕 Add to localStorage first (optimistic update)
      addItemLocal(item)
      
      // 🔄 If user is logged in, sync to database
      if (user?.id) {
        // Dynamic import to avoid bundling server code in client
        const { addToCartAction } = await import('@/lib/actions/cart')
        const result = await addToCartAction(user.id, item.productId, item.quantity)
        
        if (!result.success) {
          // Rollback on error
          removeItemLocal(item.productId)
          throw new Error(result.error || dir === "rtl" ? "فشل في إضافة العنصر" : "Failed to add item")
        }
        
        // Soft refresh to sync with DB
        router.refresh()
      }
      
      toast({
        title: dir === "rtl" ? "تم إضافة العنصر" : "Added to Cart",
        description: dir === "rtl" ? `${item.quantity} تم إضافة العنصر إلى السلة` : `${item.quantity} item(s) added to your cart`,
        variant: "default"
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : dir === "rtl" ? "فشل في إضافة العنصر" : "Failed to add item"
      toast({
        title: dir === "rtl" ? "خطأ" : "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, addItemLocal, removeItemLocal, router, toast])

  /**
   * Update item quantity (works for both guest and logged-in users)
   */
  const updateItemQuantity = useCallback(async (cartItemId: number, quantity: number) => {
    setIsLoading(true)
    try {
      const previousItem = getItemById(cartItemId)
      
      // Optimistic update
      updateQuantityLocal(cartItemId, quantity)
      
      // Sync to database if logged in
      if (user?.id) {
        // Dynamic import to avoid bundling server code in client
        const { updateCartItem } = await import('@/lib/actions/cart')
        const result = await updateCartItem(cartItemId, quantity)
        
        if (!result.success) {
          // Rollback on error
          if (previousItem) {
            updateQuantityLocal(cartItemId, previousItem.quantity)
          }
          throw new Error(result.error || dir === "rtl" ? "فشل في تحديث العنصر" : "Failed to update quantity")
        }
        
        router.refresh()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : dir === "rtl" ? "فشل في تحديث العنصر" : "Failed to update quantity"
      toast({
        title: dir === "rtl" ? "خطأ" : "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, updateQuantityLocal, getItemById, router, toast])

  /**
   * Remove item from cart (works for both guest and logged-in users)
   */
  const removeItem = useCallback(async (cartItemId: number) => {
    setIsLoading(true)
    try {
      const previousItem = getItemById(cartItemId)
      
      // Optimistic update
      removeItemLocal(cartItemId)
      
      // Sync to database if logged in
      if (user?.id) {
        // Dynamic import to avoid bundling server code in client
        const { removeCartItem } = await import('@/lib/actions/cart')
        const result = await removeCartItem(cartItemId)
        
        if (!result.success) {
          // Rollback on error
          if (previousItem) {
            addItemLocal({
              productId: previousItem.productId,
              quantity: previousItem.quantity,
              product: previousItem.product
            })
          }
          throw new Error(result.error || dir === "rtl" ? "فشل في إزالة العنصر" : "Failed to remove item")
        }
        
        router.refresh()
      }
      
      toast({
        title: dir === "rtl" ? "تم إزالة العنصر" : "Removed",
        description: dir === "rtl" ? "تم إزالة العنصر من السلة" : "Item removed from cart",
        variant: "default"
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : dir === "rtl" ? "فشل في إزالة العنصر" : "Failed to remove item"
      toast({
        title: dir === "rtl" ? "خطأ" : "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, removeItemLocal, addItemLocal, getItemById, router, toast])

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(async () => {
    setIsLoading(true)
    try {
      clearCartLocal()
      
      // Sync to database if logged in
      if (user?.id) {
        // Dynamic import to avoid bundling server code in client
        const { getCartFull, clearCart: clearCartAction } = await import('@/lib/actions/cart')
        
        // Get user's cart from server
        const cartResult = await getCartFull(user.id)
        
        if (cartResult.success && cartResult.data) {
          await clearCartAction(cartResult.data.id)
        }
        
        router.refresh()
      }
    } catch (error) {
      console.error(dir === "rtl" ? "فشل في إزالة العنصر" : "Failed to remove item", error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, clearCartLocal, router])

  /**
   * Refresh cart from server (logged-in users only)
   */
  const refresh = useCallback(() => {
    if (user?.id) {
      router.refresh()
    }
  }, [user?.id, router])

  return {
    items: localItems,
    totalItems: getTotalItems(),
    totalPrice: getTotalPrice(false), // Without coupon
    isLoading,
    error,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    getItemById,
    refresh
  }
}
