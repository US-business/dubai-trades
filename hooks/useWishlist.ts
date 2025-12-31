/**
 * 🔄 REBUILT Wishlist Hook - Clean & Simple
 * 
 * Logic:
 * - Guest: add/remove → localStorage only
 * - Logged-in: add/remove → DB only (no localStorage)
 * - Items always come from store (populated correctly for each case)
 */

import { useWishlistStore, type WishlistItem } from '@/lib/stores/wishlist-store'
import { useAuth } from '@/lib/stores'
import { addToWishlist, removeFromWishlist, clearWishlist as clearWishlistAction } from '@/lib/actions/wishlist'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useState, useCallback } from 'react'

export interface UseWishlistReturn {
  items: WishlistItem[]
  totalItems: number
  isLoading: boolean
  error: string | null
  movingToCart: number | null
  
  addItem: (item: Omit<WishlistItem, 'id'>) => Promise<void>
  removeItem: (productId: number) => Promise<void>
  clearWishlist: () => Promise<void>
  moveToCart: (productId: number) => Promise<void>
  isInWishlist: (productId: number) => boolean
}

export function useWishlist(): UseWishlistReturn {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [movingToCart, setMovingToCart] = useState<number | null>(null)
  
  const { 
    items, 
    getTotalItems,
    error,
    addItem: addItemLocal,
    removeItem: removeItemLocal,
    clearWishlist: clearWishlistLocal,
    isInWishlist: isInWishlistLocal
  } = useWishlistStore()

  // ✅ Add item
  const addItem = useCallback(async (item: Omit<WishlistItem, 'id'>) => {
    setIsLoading(true)
    try {
      if (user?.id) {
        // Logged-in: add to DB
        const result = await addToWishlist(user.id, item.productId)
        
        if (!result.success) {
          throw new Error(result.error || "Failed to add item")
        }
        
        router.refresh()
      } else {
        // Guest: add to localStorage
        addItemLocal(item)
      }
      
      toast({
        title: "Added to Wishlist",
        description: "Product added successfully",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, addItemLocal, router, toast])

  // ✅ Remove item
  const removeItem = useCallback(async (productId: number) => {
    setIsLoading(true)
    try {
      if (user?.id) {
        // Logged-in: remove from DB
        const result = await removeFromWishlist(user.id, productId)
        
        if (!result.success) {
          throw new Error(result.error || "Failed to remove item")
        }
        
        router.refresh()
      } else {
        // Guest: remove from localStorage
        removeItemLocal(productId)
      }
      
      toast({
        title: "Removed",
        description: "Item removed from wishlist",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove item",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, removeItemLocal, router, toast])

  // ✅ Clear wishlist
  const clearWishlist = useCallback(async () => {
    setIsLoading(true)
    try {
      if (user?.id) {
        await clearWishlistAction(user.id)
        router.refresh()
      } else {
        clearWishlistLocal()
      }
    } catch (error) {
      console.error('Failed to clear wishlist:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, clearWishlistLocal, router])

  // ✅ Move item to cart
  const moveToCart = useCallback(async (productId: number) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in",
        variant: "destructive"
      })
      return
    }

    setMovingToCart(productId)
    try {
      // Add to cart
      const { addToCartAction } = await import('@/lib/actions/cart')
      const cartResult = await addToCartAction(user.id, productId, 1)
      
      if (!cartResult.success) {
        throw new Error(cartResult.error || "Failed to add to cart")
      }
      
      // Remove from wishlist
      const wishlistResult = await removeFromWishlist(user.id, productId)
      
      if (!wishlistResult.success) {
        throw new Error(wishlistResult.error || "Failed to remove from wishlist")
      }
      
      router.refresh()
      
      toast({
        title: "Success",
        description: "Product moved to cart",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to move item",
        variant: "destructive"
      })
    } finally {
      setMovingToCart(null)
    }
  }, [user?.id, router, toast])

  return {
    items,
    totalItems: getTotalItems(),
    isLoading,
    error,
    movingToCart,
    addItem,
    removeItem,
    clearWishlist,
    moveToCart,
    isInWishlist: isInWishlistLocal
  }
}
