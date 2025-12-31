"use client"
import { Badge } from '@/components/shadcnUI/badge'
import { Button } from '@/components/shadcnUI/button'
import { useI18nStore, useWishlistStore, useAuth } from '@/lib/stores'
import { cn } from '@/lib/utils'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import type { WishlistItem } from '@/lib/stores/wishlist-store'

type WishListLinkProps = {
   wishlist?: { success: boolean; data?: { items: any[] }; error?: string } | null
}

const WishListLink = ({ wishlist }: WishListLinkProps) => {
   const router = useRouter()
   const { user } = useAuth()
   const { t, dir } = useI18nStore()
   const { getTotalItems, setItems, items: localItems } = useWishlistStore()
   
   // ✅ For logged-in users: sync server data with store
   // ✅ For guests: use localStorage items only
   useEffect(() => {
      // Only update store for logged-in users with server data
      if (user?.id && wishlist?.success && Array.isArray(wishlist?.data?.items)) {
         const mapped: WishlistItem[] = wishlist.data.items.map((item: any): WishlistItem => ({
            id: Number(item.id),
            productId: Number(item.productId),
            product: {
               id: Number(item.product?.id),
               nameEn: String(item.product?.nameEn ?? ""),
               nameAr: String(item.product?.nameAr ?? ""),
               price: item.product?.price != null ? String(item.product.price) : null,
               images: Array.isArray(item.product?.images) ? item.product.images : [],
               quantityInStock: Number(item.product?.quantityInStock ?? 0),
               discountType: (item.product?.discountType as 'fixed' | 'percentage' | 'none') ?? 'none',
               discountValue: item.product?.discountValue != null ? String(item.product.discountValue) : null,
            },
         }))
         setItems(mapped)
      }
      // Don't touch localStorage for guests - they manage their own items
   }, [user?.id, wishlist?.success, wishlist?.data?.items, setItems])
   
   const totalItems = getTotalItems()

   const handleWishlistClick = () => {
      router.push("/wishList")
   }

   return (
      <>
         <Button
            variant="ghost"
            size="icon"
            onClick={handleWishlistClick}
            className={cn("relative hover:bg-accent transition-colors cursor-pointer",
               "bg-slate-600 text-slate-50  hover:text-slate-900 hover:bg-slate-200 rounded")}
            title={dir === "rtl" ? "قائمة الأمنيات" : "Wishlist"}
         >
            <Heart className="h-5 w-5" />

            {totalItems > 0 && (
               <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs text-white"
               >
                  {totalItems}
               </Badge>
            )}
         </Button>
      </>
   )
}

export default WishListLink