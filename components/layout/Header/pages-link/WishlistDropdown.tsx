"use client"
import React from 'react'

import { Button } from '@/components/shadcnUI/button'
import { Badge } from '@/components/shadcnUI/badge'
import { Separator } from '@/components/shadcnUI/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/shadcnUI/dropdown-menu'
import { useWishlistStore } from '@/lib/stores'
import { Heart, ShoppingBag, Trash2, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import type { WishlistItem } from '@/lib/stores/wishlist-store'
import { useI18nStore } from '@/lib/stores/i18n-store'
import { removeFromWishlist } from '@/lib/actions/wishlist'
import { useCart } from '@/hooks/useCart'
import { toast } from '@/hooks/use-toast'

type WishlistDropdownProps = {
  user: { id: number } | null
  wishlist: { success: boolean; data: { items: WishlistItem[] } } | any
  dictionary: any
  dir: "rtl" | "ltr"
}

const WishlistDropdown = ({ user, wishlist, dictionary, dir }: WishlistDropdownProps) => {
  const router = useRouter()
  const { items: localItems } = useWishlistStore()
  const { addItem: addToCart } = useCart()
  
  // 🔄 Use DB wishlist for logged-in users, localStorage for guests
  // ⚠️ IMPORTANT: Don't override localStorage for guests
  const items = user?.id && wishlist?.success && Array.isArray(wishlist?.data?.items)
    ? wishlist.data.items.map((item: any): WishlistItem => ({
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
    : localItems // Guests always use localStorage
  
  const totalItems = items.length

  const handleViewWishlist = () => {
    router.push('/wishList')
  }

  const handleRemoveItem = async (item: WishlistItem) => {
    if (user?.id) {
      // Logged-in user: remove from DB
      const result = await removeFromWishlist(user.id, item.productId)
      if (result.success) {
        toast({
          title: dir === "rtl" ? "تمت الإزالة" : "Removed",
          description: dir === "rtl" ? "تم إزالة المنتج من قائمة الأمنيات" : "Product removed from wishlist",
        })
        router.refresh()
      } else {
        toast({
          variant: "destructive",
          title: dir === "rtl" ? "خطأ" : "Error",
          description: result.error || (dir === "rtl" ? "فشلت العملية" : "Failed to remove"),
        })
      }
    } else {
      // Guest: remove from localStorage by productId
      const { removeItem } = useWishlistStore.getState()
      removeItem(item.productId)
      toast({
        title: dir === "rtl" ? "تمت الإزالة" : "Removed",
        description: dir === "rtl" ? "تم إزالة المنتج من قائمة الأمنيات" : "Product removed from wishlist",
      })
    }
  }

  const handleAddToCart = async (item: WishlistItem) => {
    try {
      // 🎯 useCart hook يتعامل مع الزوار والمستخدمين تلقائياً
      await addToCart({
        productId: item.productId,
        quantity: 1,
        product: item.product
      })
      // ✅ Toast يتم عرضه تلقائياً من useCart
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("hover:bg-accent transition-colors relative cursor-pointer", "bg-slate-600 text-slate-50 hover:text-slate-900 hover:bg-slate-200 rounded")}
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
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className={cn("w-80 p-0", dir === "rtl" && "mr-4")}
        align={dir === "rtl" ? "start" : "end"}
        sideOffset={5}
      >
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-3">
            {dir === "rtl" ? "قائمة الأمنيات" : "Wishlist"}
            {totalItems > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({totalItems}) {dir === "rtl" ? "منتج" : "items"}
              </span>
            )}
          </h3>

          {items.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {dir === "rtl" ? "قائمة الأمنيات فارغة" : "Wishlist is empty"}
              </p>
            </div>
          ) : (
            <>
              <div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item: WishlistItem) => (
                    <div key={item.id} className="flex items-start space-x-3 gap-2">
                      <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        {item.product.images?.[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={dir === "rtl" ? item.product.nameAr : item.product.nameEn}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate mb-1">
                          {dir === "rtl" ? item.product.nameAr : item.product.nameEn}
                        </h4>
                        <p className="text-sm font-semibold text-primary mb-2">
                          EGP {Number(item.product.price).toFixed(2)}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => handleAddToCart(item)}
                          >
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            {dir === "rtl" ? "أضف للسلة" : "Add to cart"}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveItem(item)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          <Separator className="my-3" />

          <div className="space-y-3">
            <Button
              variant="default"
              size="sm"
              onClick={handleViewWishlist}
              className="w-full"
            >
              {dir === "rtl" ? "عرض قائمة الأمنيات" : "View Wishlist"}
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default WishlistDropdown
