import { create } from 'zustand'
import { getCurrentUser } from "@/lib/auth/actions"
import { signOut as nextAuthSignOut } from "next-auth/react"
import { useAuthStore as useUnifiedAuthStore } from "./unified-auth-store"

interface User {
  id: number
  username: string
  email: string
  role: "super_admin" | "viewer" | "user"
  createdAt: Date | null
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isSuperAdmin: boolean
  isViewer: boolean
  isUser: boolean
  loadUser: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isSuperAdmin: false,
  isViewer: false,
  isUser: false,

  loadUser: async () => {
    try {
      set({ isLoading: true })
      const currentUser = await getCurrentUser()
      set({ 
        user: currentUser,
        isSuperAdmin: currentUser?.role === "super_admin",
        isViewer: currentUser?.role === "viewer",
        isUser: currentUser?.role === "user",
        isLoading: false 
      })
    } catch (error) {
      // console.error("Error loading user:", error)
      set({ 
        user: null,
        isSuperAdmin: false,
        isViewer: false,
        isUser: false,
        isLoading: false 
      })
    }
  },

  signOut: async () => {
    try {
      // 🔥 Call unified auth store FIRST to handle cart/wishlist transfer
      await useUnifiedAuthStore.getState().signOut()
      
      // Then handle NextAuth signout
      await nextAuthSignOut({ redirect: false })
      
      set({ 
        user: null,
        isSuperAdmin: false,
        isViewer: false,
        isUser: false 
      })
    } catch (error) {
      // console.error("Error signing out:", error)
    }
  }
}))
