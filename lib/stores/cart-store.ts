import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calculateProductPrice, calculateCartTotal, toNumber } from '@/lib/utils/pricing'

export interface CartItem {
  id: number
  productId: number
  quantity: number
  coupon?: {
    id: number
    code: string
    discountType: 'fixed' | 'percentage' | 'none'
    discountValue: string | null
  }
  product: {
    id: number
    nameEn: string
    nameAr: string 
    price: string | null
    images: string[]
    quantityInStock: number
    discountType: 'fixed' | 'percentage' | 'none'
    discountValue: string | null
  }
}

export interface Coupon {
  id: number
  code: string
  discountType: 'fixed' | 'percentage' | 'none'
  discountValue: string | null
  isActive: boolean | null
}

export interface CartState {
  items: CartItem[]
  isLoading: boolean
  error: string | null
  openCart: boolean
  subtotal: number
  quantityToCart: number
  isMerging: boolean // 🛡️ Protection flag during merge
  isSyncing: boolean // 🆕 Protection flag during sync
  lastSyncTimestamp: number | null // 🆕 Track last sync to avoid duplicate syncs
  appliedCoupon: Coupon | null // ✅ Coupon state
  
  // Actions
  setQuantityToCart: (quantity: number) => void
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (cartItemId: number) => void
  updateQuantity: (cartItemId: number, quantity: number) => void
  clearCart: () => void
  clearCartForUserSwitch: () => void
  setItems: (items: CartItem[], force?: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setMerging: (merging: boolean) => void // 🛡️ Set merge flag
  setSyncing: (syncing: boolean) => void // 🆕 Set sync flag
  setAppliedCoupon: (coupon: Coupon | null) => void // ✅ Set coupon
  
  // 🆕 Hybrid cart methods
  syncWithServer: (userId: number) => Promise<void>
  getLocalCartItems: () => CartItem[]
  
  // Computed values
  getTotalItems: () => number
  getTotalPrice: (includeCoupon?: boolean) => number // ✅ Updated signature
  getItemById: (cartItemId: number) => CartItem | undefined
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      openCart: false,
      subtotal: 0,
      quantityToCart: 1,
      isMerging: false, // 🛡️ Initialize merge flag
      isSyncing: false, // 🆕 Initialize sync flag
      lastSyncTimestamp: null, // 🆕 Initialize last sync timestamp
      appliedCoupon: null, // ✅ Initialize coupon
      
      setQuantityToCart: (quantity: number) => {
        set({ quantityToCart: quantity })
      },
      setMerging: (merging: boolean) => {
        console.log("🛡️ Merge flag set to:", merging)
        set({ isMerging: merging })
      },
      setSyncing: (syncing: boolean) => {
        console.log("🔄 Sync flag set to:", syncing)
        set({ isSyncing: syncing })
      },
      setAppliedCoupon: (coupon: Coupon | null) => {
        console.log("🎟️ Coupon applied:", coupon?.code || "none")
        set({ appliedCoupon: coupon })
      },
      addItem: (newItem) => {
        const items = get().items
        const existingItem = items.find(item => item.productId === newItem.productId)
        
        if (existingItem) {
          // Update quantity if item already exists
          set({
            items: items.map(item =>
              item.productId === newItem.productId
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            )
          })
        } else {
          // Add new item with temporary ID (will be replaced with server ID)
          const tempId = Date.now() + Math.random() // Generate unique temporary ID
          set({
            items: [...items, { ...newItem, id: Number(tempId) }]
          })
        }
      },

      removeItem: (cartItemId) => { 
        set({
          items: get().items.filter(item => item.id !== cartItemId)
        })
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId)
          return
        }
        
        set({
          items: get().items.map(item =>
            item.id === cartItemId
              ? { ...item, quantity }
              : item
          )
        })
      },

      clearCart: () => {
        set({ items: [], error: null })
      },

      // Clear cart for user switching
      clearCartForUserSwitch: () => {
        // console.log("🧹 Clearing cart for user switch")
        set({ items: [], error: null, isLoading: false })
      },

      setItems: (items, force = false) => {
        const { isMerging, isSyncing } = get()
        
        // 🛡️ Protection: Don't clear items during merge or sync operation (unless forced)
        if (!force && (isMerging || isSyncing) && (!items || items.length === 0)) {
          console.log("🛡️ BLOCKED: Prevented clearing cart during merge/sync operation")
          return
        }
        
        console.log("📝 Setting items:", items.length, "items", force ? "(forced)" : "")
        set({ items, lastSyncTimestamp: Date.now() })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setError: (error) => {
        set({ error })
      },

      // 🆕 Sync local cart with server cart
      syncWithServer: async (userId: number) => {
        try {
          const { isSyncing, lastSyncTimestamp } = get()
          
          // 🛡️ Prevent duplicate sync within 2 seconds
          if (isSyncing) {
            console.log('⚠️ Sync already in progress, skipping...')
            return
          }
          
          const now = Date.now()
          if (lastSyncTimestamp && (now - lastSyncTimestamp) < 2000) {
            console.log('⚠️ Last sync was too recent, skipping...')
            return
          }
          
          set({ isSyncing: true })
          console.log('🔄 Syncing cart with server for user:', userId)
          
          // 🔍 Check current state before sync
          const currentItems = get().items
          console.log('📋 Current localStorage items before sync:', currentItems.length)
          
          const { getCartFull } = await import('@/lib/actions/cart')
          const serverCart = await getCartFull(userId)
          
          console.log('📦 Server cart response:', {
            success: serverCart?.success,
            itemsCount: serverCart?.data?.items?.length || 0,
            hasData: !!serverCart?.data,
            hasItems: !!serverCart?.data?.items
          })
          
          if (serverCart?.success && Array.isArray(serverCart?.data?.items) && serverCart.data.items.length > 0) {
            const serverItems = serverCart.data.items.map((item: any) => ({
              id: item.id,
              productId: item.productId,
              quantity: item.quantity,
              coupon: item.coupon,
              product: {
                id: item.product.id,
                nameEn: item.product.nameEn,
                nameAr: item.product.nameAr,
                price: String(item.product.price ?? 0),
                images: item.product.images ?? [],
                quantityInStock: Number(item.product.quantityInStock ?? 0),
                discountType: item.product.discountType,
                discountValue: item.product.discountValue != null ? String(item.product.discountValue) : null,
              }
            }))
            console.log('✅ Setting', serverItems.length, 'items to cart store (replacing localStorage)')
            set({ items: serverItems, lastSyncTimestamp: Date.now() })
            console.log('✅ localStorage updated with server cart')
          } else {
            console.log('⚠️ No items found in server cart - keeping current items')
          }
        } catch (error) {
          console.error('❌ Error syncing cart with server:', error)
        } finally {
          set({ isSyncing: false })
        }
      },

      // 🆕 Get current localStorage cart items (for merging on login)
      getLocalCartItems: () => {
        const items = get().items
        console.log('📋 Getting local cart items:', items.length, 'items found')
        return items
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: (includeCoupon = false) => {
        const items = get().items
        const coupon = includeCoupon ? get().appliedCoupon : null
        
        // ✅ Use centralized pricing utility
        const { total } = calculateCartTotal(
          items.map(item => ({
            product: item.product,
            quantity: item.quantity
          })),
          coupon
        )
        
        return total
      },

      getItemById: (cartItemId) => {
        return get().items.find(item => item.id === cartItemId)
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => {
        // 🔒 Don't persist cart items for logged-in users (they use DB)
        // Check if merge is COMPLETED (flag = 'true'), not just pending
        if (typeof window !== 'undefined') {
          const mergeKeys = Object.keys(localStorage).filter(key => 
            key.startsWith('cart_merged_') && localStorage.getItem(key) === 'true'
          )
          if (mergeKeys.length > 0) {
            // Merge completed - user is logged in, don't persist items
            console.log("🔒 Merge completed - skipping cart localStorage persistence")
            return { 
              items: [], // Don't save items for logged-in users
              appliedCoupon: state.appliedCoupon 
            }
          }
        }
        
        // Guest users OR merge in progress - persist normally
        return { 
          items: state.items,
          appliedCoupon: state.appliedCoupon
        }
      }
    }
  )
)