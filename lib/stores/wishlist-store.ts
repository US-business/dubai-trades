/**
 * 🔄 REBUILT Wishlist Store - Clean Architecture
 * 
 * Simple and predictable:
 * - Guest users: localStorage only
 * - Logged-in users: DB only (no localStorage)
 * - On login: merge guest → DB, then clear localStorage
 * - On logout: transfer DB → localStorage
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
    id: number
    productId: number
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

export interface WishlistState {
    items: WishlistItem[]
    isLoading: boolean
    error: string | null

    // Core Actions
    addItem: (item: Omit<WishlistItem, 'id'>) => void
    removeItem: (productId: number) => void
    clearWishlist: () => void
    setItems: (items: WishlistItem[]) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void

    // Helpers
    getLocalItems: () => WishlistItem[]
    getTotalItems: () => number
    isInWishlist: (productId: number) => boolean
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],
            isLoading: false,
            error: null,

            // ✅ Add item (guest only - logged-in users use DB directly)
            addItem: (newItem) => {
                const items = get().items
                const exists = items.some(item => item.productId === newItem.productId)

                if (!exists) {
                    const tempId = Date.now() + Math.random()
                    set({ items: [...items, { ...newItem, id: Number(tempId) }] })
                }
            },

            // ✅ Remove item by productId
            removeItem: (productId) => {
                set({ items: get().items.filter(item => item.productId !== productId) })
            },

            // ✅ Clear all items
            clearWishlist: () => {
                set({ items: [], error: null })
            },

            // ✅ Set items (used for logout transfer)
            setItems: (items) => {
                set({ items })
            },

            setLoading: (loading) => {
                set({ isLoading: loading })
            },

            setError: (error) => {
                set({ error })
            },

            // ✅ Get localStorage items (for merge on login)
            getLocalItems: () => {
                if (typeof window === 'undefined') return []

                try {
                    const stored = localStorage.getItem('wishlist-storage')
                    if (!stored) return []

                    const parsed = JSON.parse(stored)
                    const items = parsed?.state?.items || []

                    return items.filter((item: any) => 
                        item && typeof item.productId === 'number' && item.product
                    )
                } catch (error) {
                    console.error('Error reading wishlist from localStorage:', error)
                    return []
                }
            },

            getTotalItems: () => {
                return get().items.length
            },

            isInWishlist: (productId) => {
                return get().items.some(item => item.productId === productId)
            }
        }),
        {
            name: 'wishlist-storage'
        }
    )
)
