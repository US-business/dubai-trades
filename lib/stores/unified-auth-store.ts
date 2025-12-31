"use client"

import { create } from 'zustand'
import { signOut as nextAuthSignOut } from "next-auth/react"
import { useCartStore } from '@/lib/stores/cart-store'
import { useWishlistStore } from '@/lib/stores/wishlist-store'
import { cartMergeLock } from '@/lib/utils/cart-merge-lock'
import { wishlistMergeLock } from '@/lib/utils/wishlist-merge-lock'
import { getWishlistFull, clearWishlist as clearWishlistAction } from '@/lib/actions/wishlist'
import { mergeGuestCartWithUserCart, getCartFull } from '@/lib/actions/cart'

interface User {
  id: number
  username: string
  email: string
  role: "super_admin" | "viewer" | "user"
  createdAt: Date | null
  image?: string | null
  provider?: string
  name?: string | null
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isSuperAdmin: boolean
  isViewer: boolean
  isUser: boolean
  authType: 'nextauth' | null
  // Actions
  setNextAuthUser: (sessionUser: any) => Promise<void>
  signOut: () => Promise<void>
  reset: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isLoading: false,
  isSuperAdmin: false,
  isViewer: false,
  isUser: false,
  authType: 'nextauth',

  // Set NextAuth user
  setNextAuthUser: async (sessionUser: any) => {
    console.log("📥 setNextAuthUser called with:", {
      hasSessionUser: !!sessionUser,
      userId: sessionUser?.id,
      email: sessionUser?.email
    })
    
    if (!sessionUser) {
      console.log("⚠️ No session user provided")
      return
    }
    
    if (!sessionUser.id) {
      console.log("⚠️ Session user has no ID!")
      return
    }

    const { user: currentUser } = get()

    const nextAuthUser: User = {
      id: sessionUser.id,
      username: sessionUser.username || sessionUser.name || sessionUser.email?.split('@')[0] || "",
      email: sessionUser.email,
      role: sessionUser.role || "user",
      createdAt: new Date(),
      image: sessionUser.image,
      name: sessionUser.name,
      provider: 'google'
    }
    
    console.log("👤 Created nextAuthUser:", {
      id: nextAuthUser.id,
      email: nextAuthUser.email,
      hasCurrentUser: !!currentUser
    })

    // Clear cart if different user
    if (currentUser && currentUser.email !== nextAuthUser.email) {
      // console.log("🔄 Account switching detected")
      try {
        useCartStore.getState().clearCartForUserSwitch()
        // Clear merge flag for new user
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`cart_merged_${nextAuthUser.id}`)
        }
      } catch (error) {
        // console.error("Error clearing cart:", error)
      }
    }

    // 🆕 Merge guest cart and wishlist (run independently)
    if (nextAuthUser.id) {
      // Run cart and wishlist merges in parallel but handle errors independently
      const mergePromises = []
      
      // Cart merge
      const cartMergePromise = (async () => {
        try {
          // 🔒 Try to acquire merge lock
          const lockAcquired = await cartMergeLock.acquire(nextAuthUser.id)
          if (lockAcquired) {
            // Check if cart was already merged for this user
            const mergeKey = `cart_merged_${nextAuthUser.id}`
            const alreadyMerged = typeof window !== 'undefined' ? localStorage.getItem(mergeKey) : null
        
        console.log("🔍 Merge status:", { 
          userId: nextAuthUser.id, 
          alreadyMerged: !!alreadyMerged,
          mergeKey
        })
        
        console.log("🔍 [CART] Merge decision:", {
          alreadyMerged: !!alreadyMerged,
          mergeKey,
          willMerge: !alreadyMerged
        })
        
        if (!alreadyMerged) {
          // 🛡️ CRITICAL: Set merge flag IMMEDIATELY to prevent double merge
          if (typeof window !== 'undefined') {
            localStorage.setItem(mergeKey, 'pending')
            console.log("🔒 Merge flag set to 'pending' to prevent race conditions")
          }
          const cartStore = useCartStore.getState()
          cartStore.setMerging(true)
          console.log("🛡️ Merge protection ENABLED")
          
          // 🆕 Get guest items from localStorage directly (no backup mechanism)
          const guestItems = cartStore.getLocalCartItems()
          
          console.log("🔄 Checking for guest cart items:", guestItems?.length || 0)
          console.log("📋 Guest items details:", guestItems)
          
          if (guestItems && guestItems.length > 0) {
            console.log("✅ Merging", guestItems.length, "guest cart items with user cart...")
            
            // Call the merge function (already imported at top)
            
            // Prepare guest cart items for merge (only productId and quantity)
            const guestCartData = guestItems.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity
            }))
            
            
            const mergeResult = await mergeGuestCartWithUserCart(nextAuthUser.id, guestCartData)
            
            if (mergeResult.success) {
              console.log("✅ Guest cart merged successfully to DB!")
              
              // 🧹 CRITICAL: Clear localStorage cart completely for logged-in users
              console.log("🧹 Clearing localStorage cart permanently (logged-in users use DB only)...")
              
              // 🔒 MUST remove cart-storage FIRST before clearCart to prevent Zustand from re-persisting
              if (typeof window !== 'undefined') {
                // Clear the persisted state completely FIRST
                localStorage.removeItem('cart-storage')
                console.log("✅ Zustand cart-storage cleared from localStorage (BEFORE clearCart)")
                
                // Mark as merged (change from 'pending' to 'true')
                localStorage.setItem(mergeKey, 'true')
                console.log("✅ Merge completed and marked as 'true'")
              }
              
              // NOW clear the cart state (won't be persisted since we removed storage)
              cartStore.clearCart()
            } else {
              console.error("❌ Merge failed:", mergeResult.error)
              // Remove pending flag on failure
              if (typeof window !== 'undefined') {
                localStorage.removeItem(mergeKey)
              }
            }
          } else {
            console.log("ℹ️ No guest items to merge")
            
            // 🧹 Clear localStorage cart even if no items (for logged-in users)
            if (typeof window !== 'undefined') {
              localStorage.removeItem('cart-storage')
              console.log("✅ cart-storage cleared (no guest items)")
              
              // Mark as merged even if no items (to prevent future checks)
              localStorage.setItem(mergeKey, 'true')
            }
            
            // Clear cart state and sync to get any existing server cart
            cartStore.clearCart()
            await cartStore.syncWithServer(nextAuthUser.id)
          }
          
          // 🛡️ CRITICAL: Disable merge protection after completion
          cartStore.setMerging(false)
          console.log("🛡️ Merge protection DISABLED")
          
          // 🔓 Release merge lock
          cartMergeLock.release(nextAuthUser.id)
        } else {
          console.log("ℹ️ Cart already merged for this user (flag:", alreadyMerged, "), syncing...")
          
          // 🧹 Ensure localStorage is cleared for logged-in users
          if (typeof window !== 'undefined') {
            const existingStorage = localStorage.getItem('cart-storage')
            if (existingStorage) {
              localStorage.removeItem('cart-storage')
              console.log("✅ cart-storage cleared (user already merged)")
            }
          }
          
          // Just sync with server
          await useCartStore.getState().syncWithServer(nextAuthUser.id)
          
          // 🔓 Release merge lock
          cartMergeLock.release(nextAuthUser.id)
        }
        } else {
          console.log("⚠️ Could not acquire cart merge lock - skipping cart merge")
        }
      } catch (error) {
        console.error("❌ Error merging guest cart:", error)
        // 🛡️ Ensure merge flag is disabled even on error
        try {
          useCartStore.getState().setMerging(false)
          console.log("🛡️ Merge protection DISABLED (after error)")
          // Remove pending flag on error
          if (typeof window !== 'undefined') {
            const mergeKey = `cart_merged_${nextAuthUser.id}`
            localStorage.removeItem(mergeKey)
          }
          // 🔓 Release merge lock
          cartMergeLock.release(nextAuthUser.id)
        } catch (e) {
          console.error("Failed to cleanup after merge error:", e)
        }
      }
      })()
      
      mergePromises.push(cartMergePromise)
      
      // ✅ Wishlist merge (direct server action call - like Cart)
      const wishlistMergePromise = (async () => {
        try {
          const lockAcquired = await wishlistMergeLock.acquire(nextAuthUser.id)
          
          if (!lockAcquired) {
            console.log("⚠️ Could not acquire wishlist merge lock")
            return
          }

          const wishlistStore = useWishlistStore.getState()
          const guestItems = wishlistStore.getLocalItems()
          
          if (guestItems && guestItems.length > 0) {
            console.log(`🔄 Merging ${guestItems.length} wishlist items...`)
            
            // Prepare guest data (only productId)
            const guestWishlistData = guestItems.map(item => ({
              productId: item.productId
            }))
            
            // ✅ Direct server action call (same as Cart)
            const { mergeGuestWishlistWithUserWishlist } = await import('@/lib/actions/wishlist')
            const result = await mergeGuestWishlistWithUserWishlist(nextAuthUser.id, guestWishlistData)
            
            if (result.success) {
              console.log(`✅ Wishlist merged: ${result.data?.added} items added`)
            } else {
              console.error(`❌ Wishlist merge failed: ${result.error}`)
            }
          }
          
          // Clear localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('wishlist-storage')
          }
          
          wishlistStore.clearWishlist()
          wishlistMergeLock.release(nextAuthUser.id)
        } catch (error) {
          console.error("❌ Wishlist merge error:", error)
          wishlistMergeLock.release(nextAuthUser.id)
        }
      })()
      
      mergePromises.push(wishlistMergePromise)
      
      // Wait for both merges to complete (or fail) independently
      const results = await Promise.allSettled(mergePromises)
      
      results.forEach((result, index) => {
        const mergeName = index === 0 ? 'Cart' : 'Wishlist'
        if (result.status === 'fulfilled') {
          console.log(`✅ ${mergeName} merge completed`)
        } else {
          console.error(`❌ ${mergeName} merge failed:`, result.reason)
        }
      })
    }

    // console.log("📝 Setting NextAuth user:", nextAuthUser.email)
    set({
      user: nextAuthUser,
      isSuperAdmin: nextAuthUser.role === "super_admin",
      isViewer: nextAuthUser.role === "viewer",
      isUser: nextAuthUser.role === "user",
      isLoading: false,
      authType: 'nextauth'
    })
  },

  

  // Sign out
  signOut: async () => {
    console.log("🚪 Signing out...")

    try {
      // 📦 IMPORTANT: Transfer cart from DB to localStorage before logout
      const currentUser = get().user
      if (currentUser?.id) {
        console.log("📦 Transferring cart from DB to localStorage...")
        
        const cartStore = useCartStore.getState()
        
        // Fetch cart from DB (already imported at top)
        const dbCart = await getCartFull(currentUser.id)
        
        if (dbCart?.success && dbCart?.data && Array.isArray(dbCart.data.items) && dbCart.data.items.length > 0) {
          // Convert DB cart items to localStorage format
          const localItems = dbCart.data.items.map((item: any) => ({
            id: Number(item.id),
            productId: Number(item.productId),
            quantity: Number(item.quantity),
            coupon: item.coupon,
            product: {
              id: Number(item.product.id),
              nameEn: String(item.product.nameEn),
              nameAr: String(item.product.nameAr),
              price: String(item.product.price),
              images: item.product.images || [],
              quantityInStock: Number(item.product.quantityInStock || 0),
              discountType: (item.product.discountType || 'none') as 'fixed' | 'percentage' | 'none',
              discountValue: item.product.discountValue ? String(item.product.discountValue) : null
            }
          }))
          
          // Save to localStorage
          cartStore.setItems(localItems)
          console.log(`✅ ${localItems.length} items transferred to localStorage`)
        } else {
          console.log("ℹ️ No items in DB cart to transfer")
          cartStore.clearCart()
        }
        
        // Clear all cart merge flags
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`cart_merged_${currentUser.id}`)
          console.log("✅ Cart merge flags cleared")
        }
      }

      // ✅ Transfer wishlist from DB to localStorage before logout
      if (currentUser?.id) {
        console.log("📦 Transferring wishlist from DB to localStorage...")
        
        const wishlistStore = useWishlistStore.getState()
        const dbWishlist = await getWishlistFull(currentUser.id)
        
        if (dbWishlist?.success && dbWishlist.data && Array.isArray(dbWishlist.data.items) && dbWishlist.data.items.length > 0) {
          const localWishlistItems = dbWishlist.data.items.map((item: any) => ({
            id: Number(item.id),
            productId: Number(item.productId),
            product: {
              id: Number(item.product.id),
              nameEn: String(item.product.nameEn),
              nameAr: String(item.product.nameAr),
              price: String(item.product.price),
              images: item.product.images || [],
              quantityInStock: Number(item.product.quantityInStock || 0),
              discountType: (item.product.discountType || 'none') as 'fixed' | 'percentage' | 'none',
              discountValue: item.product.discountValue ? String(item.product.discountValue) : null
            }
          }))
          
          wishlistStore.setItems(localWishlistItems)
          console.log(`✅ ${localWishlistItems.length} wishlist items transferred to localStorage`)
        } else {
          wishlistStore.clearWishlist()
        }
      }
      
      // Reset auth state
      get().reset()

      // Sign out from NextAuth with proper redirect
      await nextAuthSignOut({ 
        callbackUrl: '/',
        redirect: true  // ← Let NextAuth handle redirect properly
      })
    } catch (error) {
      console.error("❌ Error signing out:", error)
      // Reset anyway
      get().reset()
      // Fallback: force redirect
      window.location.href = '/'
    }
  },

  // Reset state
  reset: () => {
    console.log("🔄 Resetting auth state")
    set({
      user: null,
      isSuperAdmin: false,
      isViewer: false,
      isUser: false,
      isLoading: false,
      authType: 'nextauth'
    })

    // Clear cart and reset merge flag
    try {
      const cartStore = useCartStore.getState()
      // Ensure merge flag is off
      cartStore.setMerging(false)
      // Clear cart items
      cartStore.clearCartForUserSwitch()
      
      console.log("✅ Cart cleared for user switch")
    } catch (error) {
      console.error("❌ Error clearing cart on reset:", error)
    }

    // Clear wishlist
    try {
      const wishlistStore = useWishlistStore.getState()
      wishlistStore.clearWishlist()
      console.log("✅ Wishlist cleared for user switch")
    } catch (error) {
      console.error("❌ Error clearing wishlist on reset:", error)
    }

    // Clear all merge keys from localStorage
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        // Remove all cart and wishlist merge keys
        if (key.startsWith('cart_merged_') || key.startsWith('wishlist_merged_')) {
          localStorage.removeItem(key)
          console.log(`🧹 Removed merge key: ${key}`)
        }
      })
    }
  }
}))

// Convenience hook
export const useAuth = () => {
  const store = useAuthStore()
  
  return {
    ...store,
    isAuthenticated: !!store.user,
    isNextAuth: store.authType === 'nextauth',
    isCustomAuth: false,
    userId: store.user?.id,
    userEmail: store.user?.email,
    userName: store.user?.name || store.user?.username,
    userRole: store.user?.role,
    userImage: store.user?.image,
    userProvider: store.user?.provider
  }
}

export type { User, AuthState }