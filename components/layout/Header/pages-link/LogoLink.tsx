"use client"
import React from 'react'
import Image from 'next/image'
import { useRouter } from "next/navigation"
import { cn } from '@/lib/utils'
import Logo from '@/components/ui/SVG/Logo'


type LogoProps = {
   dir: "ltr" | "rtl"
}

const LogoLink = ({ dir }: LogoProps) => {
   const router = useRouter()

   const handleLogoClick = () => {
      router.push("/")
   }

   return (
      <>
         {/* Logo */}
         <div className={cn("flex flex-col cursor-pointer hover:opacity-80 transition-opacity",
            "text-slate-200", dir === "rtl" ? "items-end" : "")} onClick={handleLogoClick} >
            <div className={cn("flex gap-2 w-full", "border-b border-amber-500",
               dir === "rtl" ? "flex-row-reverse" : ""
            )}>
               <span className={cn("font-bold text-lg hidden sm:inline-block",
                  "first-letter:text-amber-500"
               )}>Dubai</span>
               <Logo className='-rotate-45 text-amber-600' />
            </div>
            <span className={cn("font-bold text-lg hidden sm:inline-block",
               "tracking-widest",
               "first-letter:text-amber-500"
            )}>Trades</span>
         </div>
      </>
   )
}

export default LogoLink