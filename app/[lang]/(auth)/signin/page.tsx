"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useI18nStore } from "@/lib/stores/i18n-store"
import { useAuth } from "@/lib/stores"
import { LanguageToggle } from "@/components/shared/language-toggle"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { SignInHeader, SignInForm, SignInSkeleton } from "./_components"

export default function SignInPage() {
  const { t, dir } = useI18nStore()
  const params = useParams()
  const lang = (params?.lang as string) || (dir === "rtl" ? "ar" : "en")
  const { user, isLoading: authLoading } = useAuth()
  const { status } = useSession()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user && status === "authenticated") {
      console.log("✅ User already logged in, redirecting...")
      router.replace(`/${lang}`)
    }
  }, [user, authLoading, status, router, lang])

  // Show form after initial load check (prevent infinite loading)
  useEffect(() => {
    // If not loading and no user, show form after short delay
    if (!authLoading && !user && status !== "authenticated") {
      const timer = setTimeout(() => {
        console.log("✅ No user found, showing sign-in form")
        setShowForm(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [authLoading, user, status])

  // Show skeleton while checking auth status (with timeout protection)
  if ((authLoading || status === "loading") && !showForm) {
    return <SignInSkeleton dir={dir} />
  }

  // If user is already logged in, show skeleton with redirect
  if (user) {
    return <SignInSkeleton dir={dir} />
  } 

  return (
    <div className="min-h-screen relative container mx-auto flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Language Toggle */}
      <div className={cn("absolute top-4", dir === "rtl" ? "left-4" : "right-4")}>
        <LanguageToggle />
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <SignInHeader dir={dir} />

        {/* Form */}
        <SignInForm dir={dir} lang={lang} t={t} />
      </div>
    </div>
  )
}
