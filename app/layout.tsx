import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"

import "./globals.css"
import { cn } from "@/lib/utils"
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister"
import { companyInfo } from "@/lib/config/company-info"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "متجرك الإلكتروني - E-commerce Store",
    template: "%s | متجرك الإلكتروني"
  },
  description: "متجر إلكتروني شامل يوفر مجموعة متنوعة من المنتجات عالية الجودة مع خدمة توصيل سريعة ودعم عملاء ممتاز. تسوق الآن واستمتع بأفضل الأسعار والعروض الحصرية.",
  keywords: ["متجر إلكتروني", "تسوق أونلاين", "منتجات", "عروض", "تخفيضات", "توصيل سريع", "e-commerce", "online shopping"],
  authors: [{ name: companyInfo.nameEn }],
  creator: companyInfo.nameEn,
  publisher: companyInfo.nameEn,
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://dubai-trades.vercel.app'),
  alternates: {
    canonical: '/',
    languages: {
      'ar': '/ar',
      'en': '/en',
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    alternateLocale: ["en_US"],
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://dubai-trades.vercel.app',
    siteName: "متجرك الإلكتروني",
    title: "متجرك الإلكتروني - تسوق أفضل المنتجات",
    description: "متجر إلكتروني شامل يوفر مجموعة متنوعة من المنتجات عالية الجودة",
    images: [{
      url: "/opengraph-image",
      width: 1200,
      height: 630,
      alt: "متجرك الإلكتروني",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "متجرك الإلكتروني - تسوق أفضل المنتجات",
    description: "متجر إلكتروني شامل يوفر مجموعة متنوعة من المنتجات عالية الجودة",
    images: ["/twitter-image"],
    creator: "@yourtwitterhandle",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'your-google-verification-code', // أضف عند الحصول عليه
    // yandex: 'your-yandex-verification-code',
  },
  category: 'e-commerce',
}

export const viewport: Viewport = {
  themeColor: "#111827",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cn(inter.className)}>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}