"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/shadcnUI/button"
import { useI18nStore } from "@/lib/stores/i18n-store"
import { cn } from "@/lib/utils"

interface FacebookSignInButtonProps {
  isLoading?: boolean
  disabled?: boolean
  callbackUrl?: string
}

export function FacebookSignInButton({ 
  isLoading = false, 
  disabled = false,
  callbackUrl
}: FacebookSignInButtonProps) {
  const { dir } = useI18nStore()

  const resolvedCallbackUrl = callbackUrl ?? (dir === "rtl" ? "/ar" : "/en")

  const handleFacebookSignIn = () => {
    signIn("facebook", { 
      callbackUrl: resolvedCallbackUrl,
      redirect: true 
    })
  }

  return (
    <Button
      type="button"
      onClick={handleFacebookSignIn}
      disabled={disabled || isLoading}
      className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166FE5] text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
    >
      {/* Facebook Icon SVG */}
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
      <span className={cn("font-medium", dir === "rtl" && "font-arabic")}>
        {dir === "rtl" ? "تسجيل الدخول بـ Facebook" : "Continue with Facebook"}
      </span>
    </Button>
  )
}
