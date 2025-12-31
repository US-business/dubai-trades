import type { MetadataRoute } from 'next'
import { companyInfo } from '@/lib/config/company-info'

export default function manifest(): MetadataRoute.Manifest {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return {
    name: companyInfo.nameAr,
    short_name: companyInfo.shortNameAr,
    description:
      'متجر إلكتروني شامل يوفر مجموعة متنوعة من المنتجات عالية الجودة مع خدمة توصيل سريعة ودعم عملاء ممتاز.',
    lang: 'ar',
    start_url: '/ar',
    scope: '/',
    id: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#111827',
    dir: 'rtl',
    categories: ['shopping', 'ecommerce'],
    icons: [
      {
        src: '/icon-192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'المنتجات',
        url: '/ar/products',
        description: 'تصفح جميع المنتجات',
      },
      {
        name: 'العروض',
        url: '/ar/offers',
        description: 'اكتشف العروض والتخفيضات',
      },
    ],
    screenshots: [
      {
        src: `${appUrl}/opengraph-image.png`,
        sizes: '1200x630',
        type: 'image/png',
        form_factor: 'wide',
      },
    ],
  }
}
