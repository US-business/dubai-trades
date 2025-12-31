"use client"
import { Button } from '@/components/shadcnUI/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcnUI/card'
import { Separator } from '@/components/shadcnUI/separator'
import { useCartStore } from '@/lib/stores'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { type CartItem } from "@/types/cart" // ✅ Use types/cart
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { Coupon, useCouponsStore } from '@/lib/stores/coupons-store'
import AppliedCoupon from './AppliedCoupon'
import { calculateCouponDiscount } from '@/lib/utils/pricing'


type OrderSummaryProps = {
   cart: any
   couponsDB?: Coupon[]
   dir: string
   currentCoupon?: Coupon | null
   cartId: number
   dictionary?: any
}

const OrderSummary = ({ cart, couponsDB, dir, currentCoupon, cartId, dictionary }: OrderSummaryProps) => {

   const { items, getTotalPrice, setAppliedCoupon, appliedCoupon: storeCoupon } = useCartStore()
   const { coupons } = useCouponsStore()
   const router = useRouter()
   
   // ✅ Sync coupon from server to store
   useEffect(() => {
      if (currentCoupon) {
         setAppliedCoupon({
            id: currentCoupon.id,
            code: currentCoupon.code,
            discountType: currentCoupon.discountType,
            discountValue: currentCoupon.discountValue,
            isActive: currentCoupon.isActive ?? true
         })
      }
   }, [currentCoupon, setAppliedCoupon])

   // Use the current coupon from the database, fallback to store
   const appliedCoupon = currentCoupon || storeCoupon || coupons[0]

   // ✅ Calculate subtotal (without coupon)
   const subtotal = getTotalPrice(false)

   // ✅ Calculate coupon discount using centralized utility
   const couponDiscount = calculateCouponDiscount(subtotal, appliedCoupon)

   // ✅ Calculate total (with coupon applied)
   const total = Math.max(subtotal - couponDiscount, 0)

   if (cart.length === 0) {
      return null
   }


   return (
      <>
         {/* Order Summary */}
         <div className="space-y-4 sm:space-y-6">
            {/* Applied Coupon */}
            <AppliedCoupon coupons={couponsDB ?? []} dir={dir} cartId={cartId} currentCoupon={currentCoupon} />

            {/* Order Summary */}
            <Card className="lg:sticky lg:top-4">
               <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">{dictionary?.cart?.orderSummary || "Order Summary"}</CardTitle>
               </CardHeader>
               <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  <div className={cn("flex justify-between text-sm sm:text-base", dir === "rtl" && "flex-row-reverse")}>
                     <span>{dictionary?.cart?.subtotal || "Subtotal"}</span>
                     <span>EGP{subtotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                     <div className={cn("flex justify-between text-green-600 text-sm sm:text-base", dir === "rtl" && "flex-row-reverse")}>
                        <span className="flex items-center gap-1 flex-wrap">
                           {dictionary?.cart?.discount || "Discount"} ({appliedCoupon.code})
                        </span>
                        <span className="whitespace-nowrap">-EGP{couponDiscount.toFixed(2)}</span>
                     </div>
                  )}
                  <Separator />
                  <div className={cn("flex justify-between text-base sm:text-lg font-bold", dir === "rtl" && "flex-row-reverse")}>
                     <span>{dictionary?.cart?.total || "Total"}</span>
                     <span>EGP{total.toFixed(2)}</span>
                  </div>
                  <Button
                     onClick={() => router.push("/checkout")}
                     className="w-full h-10 sm:h-12 text-sm sm:text-base"
                     size="lg"
                     disabled={items.some((item) => item.product.quantityInStock <= 0)}
                  >
                     {dictionary?.cart?.checkout || "Proceed to Checkout"}
                     <ArrowRight className={cn("w-4 h-4", dir === "rtl" ? "mr-2 rotate-180" : "ml-2")} />
                  </Button>
                  {items.some((item) => item.product.quantityInStock <= 0) && (
                     <p className="text-xs sm:text-sm text-red-600 text-center">
                        {dictionary?.cart?.removeOutOfStockItems || "Please remove out-of-stock items to continue"}
                     </p>
                  )}
               </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
               <CardContent className="p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 text-center">
                     {dictionary?.cart?.acceptedPaymentMethods || "Accepted Payment Methods"}
                  </p>
                  <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
                     <div className="w-10 h-7 sm:w-12 sm:h-8 bg-blue-600 rounded flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">
                        VISA
                     </div>
                     <div className="w-10 h-7 sm:w-12 sm:h-8 bg-red-600 rounded flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">
                        MC
                     </div>
                     <div className="w-10 h-7 sm:w-12 sm:h-8 bg-blue-500 rounded flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">
                        AMEX
                     </div>
                     <div className="w-10 h-7 sm:w-12 sm:h-8 bg-blue-700 rounded flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">
                        PP
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>
      </>
   )
}

export default OrderSummary