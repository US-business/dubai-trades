"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

interface ProductsBannerProps {
  dir?: "rtl" | "ltr"
  position?: "left" | "right"
}

export default function ProductsBanner({ dir = "ltr", position = "right" }: ProductsBannerProps) {
  return (
    <div className={cn(
      "relative w-full h-[500px] lg:h-[650px] overflow-hidden rounded-3xl",
      "bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50",
      "border-2 border-amber-200/50 shadow-[0_20px_80px_-20px_rgba(251,191,36,0.4)]"
    )}>
      {/* Decorative Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={cn(
          "absolute w-[500px] h-[500px] bg-gradient-to-br from-amber-300/20 to-orange-300/20",
          "rounded-full blur-3xl animate-pulse",
          position === "right" ? "top-0 right-0 translate-x-1/3 -translate-y-1/3" : "top-0 left-0 -translate-x-1/3 -translate-y-1/3"
        )}></div>
        <div className={cn(
          "absolute w-[400px] h-[400px] bg-gradient-to-br from-rose-300/15 to-pink-300/15",
          "rounded-full blur-3xl animate-pulse",
          position === "right" ? "bottom-0 right-10" : "bottom-0 left-10"
        )}></div>
      </div>

      {/* Sparkle Icons */}
      <Sparkles className={cn(
        "absolute top-10 w-8 h-8 text-amber-400/40 animate-pulse",
        position === "right" ? "left-20" : "right-20"
      )} />
      <Sparkles className={cn(
        "absolute bottom-20 w-6 h-6 text-orange-400/40 animate-pulse",
        position === "right" ? "left-40" : "right-40"
      )} />

      {/* Products Grid - Positioned on Right or Left */}
      <div className={cn(
        "absolute inset-0",
        position === "right" ? "right-0" : "left-0"
      )}>
        <div className="relative w-full h-full">
          {/* Product 1 - Large Bag */}
          <div className={cn(
            "absolute group cursor-pointer transition-all duration-500 hover:scale-110 hover:z-50",
            position === "right" ? "top-10 right-10 sm:right-20" : "top-10 left-10 sm:left-20"
          )}>
            <div className={cn(
              "relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48",
              "rounded-2xl overflow-hidden shadow-2xl",
              "transform -rotate-12 group-hover:rotate-0 transition-transform duration-500",
              "ring-4 ring-white/50 group-hover:ring-amber-400/50"
            )}>
              <Image
                src="https://images.unsplash.com/photo-1654064756668-16a32248d391?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjM5fHxraXRjaGVuJTIwYmFja2dyb3VuZHxlbnwwfHwwfHx8Mg%3D%3D&auto=format&fit=crop&q=60&w=500"
                alt="Leather Bag"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Product 2 - T-Shirt */}
          <div className={cn(
            "absolute group cursor-pointer transition-all duration-500 hover:scale-110 hover:z-50",
            position === "right" ? "top-24 sm:top-32 right-52 sm:right-72 lg:right-80" : "top-24 sm:top-32 left-52 sm:left-72 lg:left-80"
          )}>
            <div className={cn(
              "relative w-28 h-28 sm:w-32 sm:h-32 lg:w-40 lg:h-40",
              "rounded-2xl overflow-hidden shadow-2xl",
              "transform rotate-6 group-hover:rotate-0 transition-transform duration-500",
              "ring-4 ring-white/50 group-hover:ring-amber-400/50"
            )}>
              <Image
                src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop"
                alt="T-Shirt"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Product 3 - blue ceramic jug*/}
          <div className={cn(
            "absolute group cursor-pointer transition-all duration-500 hover:scale-110 hover:z-50",
            position === "right" ? "top-46 sm:top-52 right-16 sm:right-32" : "top-46 sm:top-52 left-16 sm:left-32"
          )}>
            <div className={cn(
              "relative w-32 h-32 sm:w-36 sm:h-36 lg:w-44 lg:h-44",
              "rounded-2xl overflow-hidden shadow-2xl",
              "transform rotate-9 group-hover:rotate-0 transition-transform duration-500",
              "ring-4 ring-white/50 group-hover:ring-amber-400/50"
            )}>
              <Image
                src="https://images.unsplash.com/photo-1752769996086-381c77cba3f0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODh8fGl0ZW18ZW58MHx8MHx8fDI%3D&auto=format&fit=crop&q=60&w=500"
                alt=" blue ceramic jug"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Product 4 - Headphones */}
          <div className={cn(
            "absolute group cursor-pointer transition-all duration-500 hover:scale-110 hover:z-50 hidden lg:block",
            position === "right" ? "top-80 lg:top-96 right-72 lg:right-96" : "top-80 lg:top-96 left-72 lg:left-96"
          )}>
            <div className={cn(
              "relative w-28 h-28 lg:w-36 lg:h-36",
              "rounded-2xl overflow-hidden shadow-2xl",
              "transform rotate-12 group-hover:rotate-0 transition-transform duration-500",
              "ring-4 ring-white/50 group-hover:ring-amber-400/50"
            )}>
              <Image
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"
                alt="Headphones"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Product 5 - Smart Watch */}
          <div className={cn(
            "absolute group cursor-pointer transition-all duration-500 hover:scale-110 hover:z-50",
            position === "right" ? "bottom-16 sm:bottom-20 right-40 sm:right-60" : "bottom-16 sm:bottom-20 left-40 sm:left-60"
          )}>
            <div className={cn(
              "relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32",
              "rounded-2xl overflow-hidden shadow-2xl",
              "transform -rotate-3 group-hover:rotate-0 transition-transform duration-500",
              "ring-4 ring-white/50 group-hover:ring-amber-400/50"
            )}>
              <Image
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop"
                alt="Smart Watch"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Product 6 - Coffee Maker */}
          <div className={cn(
            "absolute group cursor-pointer transition-all duration-500 hover:scale-110 hover:z-50 hidden sm:block",
            position === "right" ? "bottom-20 sm:bottom-30 right-12 sm:right-24" : "bottom-20 sm:bottom-30 left-12 sm:left-24"
          )}>
            <div className={cn(
              "relative w-28 h-28 sm:w-32 sm:h-32 lg:w-40 lg:h-40",
              "rounded-2xl overflow-hidden shadow-2xl",
              "transform -rotate-6 group-hover:rotate-0 transition-transform duration-500",
              "ring-4 ring-white/50 group-hover:ring-amber-400/50"
            )}>
              <Image
                src="https://images.unsplash.com/photo-1615486363973-f79d875780cf?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aXRlbXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=500"
                alt="Coffee Maker"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Particles/Dots Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-amber-400/20 rounded-full animate-pulse top-[10%] left-[15%]" />
        <div className="absolute w-2 h-2 bg-amber-400/20 rounded-full animate-pulse top-[25%] left-[35%] animation-delay-500" />
        <div className="absolute w-2 h-2 bg-amber-400/20 rounded-full animate-pulse top-[40%] left-[55%] animation-delay-1000" />
        <div className="absolute w-2 h-2 bg-amber-400/20 rounded-full animate-pulse top-[60%] left-[25%] animation-delay-1500" />
        <div className="absolute w-2 h-2 bg-amber-400/20 rounded-full animate-pulse top-[75%] left-[45%] animation-delay-2000" />
        <div className="absolute w-4 h-4 bg-amber-400/20 rounded-full animate-pulse top-[85%] left-[65%] animation-delay-2500" />
        <div className="absolute w-2 h-2 bg-amber-400/20 rounded-full animate-pulse top-[15%] right-[20%] animation-delay-500" />
        <div className="absolute w-2 h-2 bg-amber-400/20 rounded-full animate-pulse top-[35%] right-[40%] animation-delay-1000" />
        <div className="absolute w-2 h-2 bg-amber-400/20 rounded-full animate-pulse top-[55%] right-[60%] animation-delay-1500" />
        <div className="absolute w-2 h-2 bg-amber-400/20 rounded-full animate-pulse top-[70%] right-[30%] animation-delay-2000" />
      </div>
    </div>
  )
}
