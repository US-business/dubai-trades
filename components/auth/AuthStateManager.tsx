"use client"

import { useSession } from "next-auth/react"
import { useEffect, useRef } from "react"
import { useAuthStore } from "@/lib/stores"

export function AuthStateManager({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const { setNextAuthUser, reset } = useAuthStore()
  
  // 🛡️ Prevent multiple calls for same user
  const lastProcessedUserIdRef = useRef<number | null>(null)

  useEffect(() => {
    console.log("🔄 AuthStateManager: Session status changed:", { 
      status, 
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      lastProcessedUserId: lastProcessedUserIdRef.current
    })
    
    if (status === "loading") {
      return
    }

    if (status === "authenticated" && session?.user) {
      const currentUserId = session.user.id ?? null
      
      // 🛡️ Skip if we already processed this user (and user has ID)
      if (currentUserId && lastProcessedUserIdRef.current === currentUserId) {
        console.log("⏭️ AuthStateManager: User already processed, skipping")
        return
      }
      
      console.log("✅ NextAuth session found, setting user:", {
        email: session.user.email,
        id: session.user.id,
        hasId: !!session.user.id
      })
      
      // 🔒 Mark as processing BEFORE async call (only if user has ID)
      if (currentUserId) {
        lastProcessedUserIdRef.current = currentUserId
      }
      
      setNextAuthUser(session.user)
    } else if (status === "unauthenticated") {
      // Reset the ref when user logs out
      lastProcessedUserIdRef.current = null
    }
  }, [session, status, setNextAuthUser, reset])

  return <>{children}</>
}