"use client"

import { cn } from "@/lib/utils"
import { UserCheck } from "lucide-react"

interface SignUpHeaderProps {
  dir: "ltr" | "rtl"
}

export function SignUpHeader({ dir }: SignUpHeaderProps) {
  return (
    <div className="text-center">
      <div className={cn("mx-auto h-12 w-12 text-amber-800 bg-amber-50 rounded-full",
        " flex items-center justify-center mb-4 " ,
         "border border-amber-600")}>
        <UserCheck className="h-6 w-6 " />
      </div>
      <h2 className="text-3xl font-bold text-gray-900">
        {dir === "rtl" ? "إنشاء حساب جديد" : "Create New Account"}
      </h2>
      <p className="mt-2 text-sm text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-800">
        {dir === "rtl" 
          ? "انضم إلينا اليوم واستمتع بتجربة تسوق رائعة" 
          : "Join us today and enjoy a great shopping experience"
        }
      </p>

    </div>
  )
}
