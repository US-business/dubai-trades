"use client"

import { useCartStore } from "@/lib/stores/cart-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcnUI/card"
import { Separator } from "@/components/shadcnUI/separator"
import { cn } from "@/lib/utils"
import BackLink from "@/components/shared/BackLink"
import { EmptyCart } from "./EmptyCart"
import { CartItem } from "./CartItem"
import { CartSummary } from "./CartSummary"

interface GuestCartViewProps {
  dir: "rtl" | "ltr"
  dictionary: any
}

export default function GuestCartView({ dir, dictionary }: GuestCartViewProps) {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore()
  const totalPrice = getTotalPrice()

  if (items.length === 0) {
    return <EmptyCart dir={dir} dictionary={dictionary} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-8 max-w-7xl">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="w-full lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-lg sm:text-xl", dir === "rtl" && "sm:flex-row-reverse")}>
                  <span>
                    {dictionary.cart.title} ({items.length} {dictionary.cart.items})
                  </span>
                  <BackLink dir={dir} className="w-full sm:w-auto" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                {items.map((item, index) => (
                  <CartItem 
                    key={item.id}
                    item={item}
                    dir={dir}
                    onRemove={removeItem}
                    onUpdateQuantity={updateQuantity}
                    showSeparator={index < items.length - 1}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="w-full">
            <CartSummary 
              dir={dir} 
              totalPrice={totalPrice} 
              dictionary={dictionary} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}
