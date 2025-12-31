import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcnUI/card'
import { Button } from '@/components/shadcnUI/button'
import { Badge } from '@/components/shadcnUI/badge'
import { Alert, AlertDescription } from '@/components/shadcnUI/alert'
import { Separator } from '@/components/shadcnUI/separator'
import { Package, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { type OrderSummaryProps } from './types'
import { type CartItem } from "@/lib/stores/cart-store"

export function OrderSummary({
    dir,
    items,
    subtotal,
    couponDiscount,
    appliedCoupon,
    shipping,
    shippingMethod,
    total
}: OrderSummaryProps) {
    return (
        <Card className="lg:sticky lg:top-4">
            <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    {dir === 'rtl' ? 'ملخص الطلب' : 'Order Summary'}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                    {dir === 'rtl' ? 'مراجعة العناصر والأسعار' : 'Review your items and pricing'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
                {/* Items List */}
                <div className="space-y-3 sm:space-y-4 max-h-64 overflow-y-auto">
                    {items.map((item: CartItem) => {
                        const itemPrice = Number(item.product.price)
                        const discountValue = Number(item.product.discountValue || 0)
                        let finalPrice = itemPrice || 0

                        // Apply discount
                        if (item.product.discountType === 'percentage') {
                            finalPrice = itemPrice - (itemPrice * discountValue) / 100
                        } else if (item.product.discountType === 'fixed') {
                            finalPrice = itemPrice - discountValue
                        }
                        finalPrice = Math.max(0, finalPrice)

                        return (
                            <div key={item.id} className={cn(
                                "flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg",
                                dir === "rtl" && "flex-row-reverse"
                            )}>
                                <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 border border-gray-200 rounded-lg overflow-hidden">
                                    <Image
                                        src={item.product?.images[0] ?? '/placeholder.jpg'}
                                        alt={item.product?.nameEn ?? 'product'}
                                        width={64}
                                        height={64}
                                        className="w-full h-full object-center object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 truncate text-xs sm:text-sm">
                                        {dir === "rtl" ? item.product.nameAr : item.product.nameEn}
                                    </h3>
                                    <div className={cn(
                                        "flex items-center justify-between mt-1 gap-2",
                                        dir === "rtl" && "flex-row-reverse"
                                    )}>
                                        <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0.5">
                                            x{item.quantity}
                                        </Badge>
                                        <span className="font-bold text-primary text-xs sm:text-sm">
                                            EGP {finalPrice.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2 sm:space-y-3">
                    <div className={cn("flex justify-between text-xs sm:text-sm", dir === "rtl" && "flex-row-reverse")}>
                        <span className="text-gray-600">{dir === "rtl" ? "المجموع الفرعي" : "Subtotal"}</span>
                        <span className="font-medium">EGP {subtotal.toFixed(2)}</span>
                    </div>

                    {appliedCoupon && (
                        <div className={cn("flex justify-between text-xs sm:text-sm text-green-600", dir === "rtl" && "flex-row-reverse")}>
                            <span className="flex items-center gap-1 flex-wrap">
                                {dir === "rtl" ? "خصم" : "Discount"}
                                <Badge variant="outline" className="text-[10px] sm:text-xs text-green-600 border-green-200">
                                    {appliedCoupon.code}
                                </Badge>
                            </span>
                            <span className="font-medium whitespace-nowrap">-EGP {couponDiscount.toFixed(2)}</span>
                        </div>
                    )}

                    <div className={cn("flex justify-between text-xs sm:text-sm", dir === "rtl" && "flex-row-reverse")}>
                        <span className="text-gray-600 flex items-center gap-1">
                            <Truck className="w-3 h-3 sm:w-4 sm:h-4" />
                            {dir === "rtl" ? "الشحن" : "Shipping"}
                        </span>
                        <span className="font-medium">
                            {shippingMethod === 'contact'
                                ? <Badge variant="secondary" className="text-[10px] sm:text-xs">{dir === 'rtl' ? 'سيحدد لاحقًا' : 'TBD'}</Badge>
                                : `EGP ${shipping.toFixed(2)}`
                            }
                        </span>
                    </div>

                    <Separator />

                    <div className={cn("flex justify-between text-base sm:text-lg font-bold", dir === "rtl" && "flex-row-reverse")}>
                        <span>{dir === "rtl" ? "المجموع" : "Total"}</span>
                        <span className="text-primary">EGP {total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Out of Stock Alert */}
                {items.some((item) => item.product.quantityInStock <= 0) && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-600 text-sm text-center">
                            {dir === "rtl"
                                ? "يرجى إزالة العناصر غير المتوفرة للمتابعة"
                                : "Please remove out-of-stock items to continue"}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Hidden Inputs */}
                <input type="hidden" name="selectedShippingMethod" value={shippingMethod} />
                <input type="hidden" name="appliedCouponCode" value={appliedCoupon?.code ?? ''} />
                <input type="hidden" name="calculatedTotal" value={total.toFixed(2)} />

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="w-full h-10 sm:h-12 text-sm sm:text-base font-medium"
                    disabled={items.some((item) => item.product.quantityInStock <= 0)}
                >
                    <Package className={cn("w-4 h-4", dir === "rtl" ? "ml-2" : "mr-2")} />
                    {dir === 'rtl' ? 'إتمام الطلب' : 'Place Order'}
                </Button>

                {/* Security Notice */}
                <div className="text-center pt-2">
                    <p className="text-[10px] sm:text-xs text-gray-500 flex items-center justify-center gap-1">
                        🔒 {dir === 'rtl' ? 'جميع بياناتك محمية ومشفرة' : 'Your data is protected and encrypted'}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
