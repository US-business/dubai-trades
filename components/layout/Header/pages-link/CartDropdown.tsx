"use client"
import React, { useEffect, useRef } from 'react'

import { Button } from '@/components/shadcnUI/button'
import { Badge } from '@/components/shadcnUI/badge'
import { Separator } from '@/components/shadcnUI/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/shadcnUI/dropdown-menu'
import { useCartStore } from '@/lib/stores'
import { ShoppingCart, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import CartQuantity from '@/app/[lang]/(site)/cart/_components/CartQuantity'
import type { CartItem } from '@/types/cart' // ✅ Use types/cart
import { useI18nStore } from '@/lib/stores/i18n-store'

type CartDropdownProps = {
  user: { id: number } | null
  cart: { success: boolean; data: { items: CartItem[] } } | any
  dictionary : any
  dir : "rtl" | "ltr"
}

const CartDropdown = ({ user, cart, dictionary , dir }: CartDropdownProps) => {
  const router = useRouter()
  const { items: localItems, getTotalItems, getTotalPrice } = useCartStore()
  
  // 🔄 NEW LOGIC: Use DB cart for logged-in users, localStorage for guests
  const items = user?.id && cart?.success && cart?.data?.items 
    ? cart.data.items.map((item: any): CartItem => ({
        id: Number(item.id),
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        coupon: item.coupon,
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
    : localItems // Guests use localStorage
  
  const totalItems = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum: number, item: CartItem) => {
    const price = Number(item.product.price || 0)
    return sum + (price * item.quantity)
  }, 0)

  const handleViewCart = () => {
    // الزوار يمكنهم رؤية صفحة العربة
    router.push('/cart')
  }

  const handleCheckout = () => {
    // التحقق من المستخدم يحدث في صفحة Checkout نفسها
    router.push('/checkout')
  }

  // Show cart even if user is null (will show empty cart)
  // This prevents the cart from disappearing during auth state changes

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("hover:bg-accent transition-colors relative cursor-pointer" , "bg-slate-600 text-slate-50  hover:text-slate-900 hover:bg-slate-200 rounded")}
          title={dictionary.cart.title}
        >
          <ShoppingCart className="h-5 w-5" />
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
            {dictionary.common.cart}
            {totalItems > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ( {totalItems} ) {dictionary.cart.items}
              </span>
            )}
          </h3>

          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {dictionary.common.emptyCart}
              </p>
            </div>
          ) : (
            <>
              <div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item: CartItem) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
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
                        <h4 className="text-sm font-medium truncate">
                          {dir === "rtl" ? item.product.nameAr : item.product.nameEn}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          EGP{Number(item.product.price).toFixed(2)}
                        </p>
                      </div>

                      <CartQuantity item={item} dir={dir} showDelete />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          <Separator className="my-3" />

          <div className="space-y-3">
            <div className={cn("flex justify-between font-semibold")}>
              <span>{dictionary.common.total}</span>
              <span>EGP{totalPrice.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewCart}
                className="w-full"
              >
                {dictionary.cart.title}
              </Button>
              <Button
                size="sm"
                className="w-full"
                onClick={handleCheckout}
                disabled={items.length === 0}
              >
                {dictionary.checkout.title}
              </Button>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CartDropdown