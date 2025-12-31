"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Sparkles, ShoppingBag } from "lucide-react";

interface BannerProps {
  dir?: "rtl" | "ltr";
  position?: "left" | "right";
  image?: string;
  titleEn?: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  href?: string;
  lang?: string;
  color?: string;
  color2?: string;
  color3?: string;
}

export default function Banner({
  dir = "ltr",
  position = "right",
  image = "https://res.cloudinary.com/dvpp7fsht/image/upload/v1761937026/magg_qqreh5.png",
  titleEn = "Shop now for kitchen tools",
  titleAr = "تسوق الآن لأدوات المطبخ",
  descriptionEn = "Discover our exclusive collection",
  descriptionAr = "اكتشف مجموعتنا الحصرية من المنتجات",
  href,
  lang = "en",
  color = "amber",
  color2 = "orange",
  color3 = "rose",
}: BannerProps) {
  const BannerContent = () => (
    <>
      {/* Background Image on Side */}
      <div
        className={cn(
          "absolute lg:inset-y-0 lg:w-1/2 w-full h-full lg:flex lg:justify-center lg:items-center overflow-hidden",
          position === "right" ? "right-0 " : "left-0 ",
        )}
      >
        <div className={cn("relative lg:w-1/2 w-4/5 h-full", "")}>
          <Image
            src={image}
            alt="Banner Background"
            fill
            className={cn("object-cover object-center", "")}
            priority
          />
        </div>
        <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-amber-50 via-transparent to-transparent "></div>
      </div>
      {/* Gradient Overlay to blend with background */}
      <div
        className={cn(
          "absolute inset-0",
          position === "right"
            ? "bg-gradient-to-l from-transparent via-amber-50/80 to-amber-50"
            : "bg-gradient-to-r from-transparent via-amber-50/80 to-amber-50"
        )}
      />

      {/* Content Side */}
      <div
        className={cn(
          "relative z-10 flex items-center justify-center w-full lg:w-1/2 px-12 sm:px-8 lg:px-24",
        )}
      >
        <div
          className={cn(
            "text-center lg:text-left max-w-md",
            position === "left" && "lg:text-right"
          )}
        >
          {/* Icon */}
          <div
            className={cn(
              "inline-flex items-center justify-center w-16 h-16 mb-4",
              "bg-amber-400/20 rounded-full backdrop-blur-sm",
              "border-2 border-amber-400/50"
            )}
          >
            <ShoppingBag className="w-8 h-8 text-amber-600" />
          </div>

          {/* Text Content - Can be customized */}
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {dir === "rtl" ? titleAr : titleEn}
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            {dir === "rtl" ? descriptionAr : descriptionEn}
          </p>
        </div>
      </div>

      {/* Decorative Background Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            "absolute w-[300px] h-[300px] bg-gradient-to-br from-amber-300/20 to-fuchsia-500/20",
            "rounded-full blur-3xl",
            position === "right"
              ? "top-0 left-1/2 translate-x-1/4 -translate-y-1/2"
              : "top-0 right-1/2 -translate-x-1/4 -translate-y-1/2"
          )}
        ></div>
        <div
          className={cn(
            "absolute w-[200px] h-[200px] bg-gradient-to-br from-rose-300/20 to-pink-300/20",
            "rounded-full blur-3xl",
            position === "right" ? "bottom-0 left-20" : "bottom-0 right-20"
          )}
        ></div>
      </div>

      {/* Sparkle Icons */}
      <Sparkles
        className={cn(
          "absolute top-6 w-6 h-6 text-amber-400/70 animate-pulse",
          position === "right" ? "left-10" : "right-10"
        )}
      />
      <Sparkles
        className={cn(
          "absolute bottom-5 w-5 h-5 text-amber-400/70 animate-pulse",
          position === "right" ? "left-30" : "right-30"
        )}
      />

      {/* Floating Particles/Dots Effect */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-4 h-4 bg-white rounded-full animate-pulse top-[10%] left-[15%] animation-delay-1500" />
        <div className="absolute w-8 h-8 bg-white rounded-full animate-pulse top-[25%] left-[35%] animation-delay-2500" />
        <div className="absolute w-4 h-4 bg-white rounded-full animate-pulse top-[40%] left-[55%] animation-delay-3500" />
        <div className="absolute w-4 h-4 bg-white rounded-full animate-pulse top-[60%] left-[25%] animation-delay-1500" />
        <div className="absolute w-4 h-4 bg-white rounded-full animate-pulse top-[75%] left-[45%] animation-delay-2000" />
        <div className="absolute w-9 h-9 bg-white rounded-full animate-pulse top-[85%] left-[65%] animation-delay-7500" />
        <div className="absolute w-4 h-4 bg-white rounded-full animate-pulse top-[35%] right-[40%] animation-delay-3000" />
        <div className="absolute w-8 h-8 bg-white rounded-full animate-pulse top-[55%] right-[60%] animation-delay-7500" />
        <div className="absolute w-4 h-4 bg-white rounded-full animate-pulse top-[70%] right-[30%] animation-delay-1500" />
      </div> */}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "relative flex items-center w-full h-[250px] lg:h-[300px] overflow-hidden rounded-3xl",
          `bg-gradient-to-br from-${color}-50 via-${color2}-50 to-${color3}-50`,
          "border-2 border-slate-200/70",
          "transition-transform duration-300 hover:scale-[1.02] cursor-pointer"
        )}
        // style={{
        //   backgroundImage: `url(${image})`,
        //   backgroundSize: "cover",
        //   backgroundPosition: "center",
        // }}
      >
        <BannerContent />
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-center w-full h-[250px] lg:h-[300px] overflow-hidden rounded-3xl",
        `bg-gradient-to-br from-${color}-50 via-${color2}-50 to-${color3}-50`,
        "border-2 border-slate-200/70 "
        // " shadow-[0_20px_80px_-20px_rgba(251,191,36,0.4)]"
      )}
      // style={{
      //   backgroundImage: `url(${image})`,
      //   backgroundSize: "cover",
      //   backgroundPosition: "center",
      // }}
    >
      <BannerContent />
    </div>
  );
}
