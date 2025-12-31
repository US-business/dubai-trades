"use client"
import { placeOrderFromCheckout } from '@/lib/actions/orders'
import { useCartStore, type CartItem } from "@/lib/stores/cart-store"
import { useCouponsStore } from '@/lib/stores'
import AppliedCoupon from '@/app/[lang]/(site)/cart/_components/AppliedCoupon'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ContactInformation } from './ContactInformation'
import { ShippingAddress } from './ShippingAddress'
import { ShippingMethod } from './ShippingMethod'
import { PaymentMethod } from './PaymentMethod'
import { OrderSummary } from './OrderSummary'
import { type CheckoutContentProps, type ShippingMethodType } from './types'

export default function CheckoutContent({
    dir,
    cart,
    user,
    couponsDB,
    currentCoupon,
    cartId
}: CheckoutContentProps) {
    const { coupons } = useCouponsStore()
    const { getTotalPrice, items } = useCartStore()
    const [shippingMethod, setShippingMethod] = useState<ShippingMethodType>('contact');
    const router = useRouter();
    
    // ✅ Just read from Zustand - don't sync!
    // Header components handle syncing

    const appliedCoupon = cart?.data?.coupon

    const subtotal = getTotalPrice()

    const couponDiscount = appliedCoupon
        ? appliedCoupon.discountType === 'percentage'
            ? (subtotal * Number(appliedCoupon?.discountValue)) / 100
            : Math.min(Number(appliedCoupon.discountValue), subtotal)
        : 0

    const taxableAmount = Math.max(subtotal - couponDiscount, 0)

    // const shipping = shippingMethod === 'basic'
    //     ? (taxableAmount > 50 ? 0 : 9.99)
    //     : 100;
    const shipping = shippingMethod === 'express'
        ? 200
        : 0;
    const total = taxableAmount + shipping



    const handleSubmit = async (formData: FormData) => {
        const form = await placeOrderFromCheckout({
            userId: user?.id,
            cartItemsData: items, // cart items هنا
            subtotal,
            discountAmount: couponDiscount,
            couponId: appliedCoupon?.id ?? null,
        },
            formData
        )
        if(form.success) {
            router.push('/order-success')
        }
    }


    return (
        <form action={handleSubmit}>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-8">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="text-center mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            {dir === 'rtl' ? 'إتمام الطلب' : 'Checkout'}
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                            {dir === 'rtl' ? 'أكمل بياناتك لإنهاء عملية الشراء' : 'Complete your details to finish your purchase'}
                        </p>
                    </div>

                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-x-8 xl:gap-x-12">
                        {/* Main Form */}
                        <div className="w-full lg:col-span-7">
                            <div className="space-y-4 sm:space-y-6">
                                <ContactInformation dir={dir} />
                                <ShippingAddress dir={dir} />
                                <ShippingMethod 
                                    dir={dir} 
                                    shippingMethod={shippingMethod}
                                    onShippingMethodChange={setShippingMethod}
                                />
                                <PaymentMethod dir={dir} />
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="w-full lg:col-span-5">
                            <div className="space-y-4 sm:space-y-6">
                                <AppliedCoupon 
                                    coupons={couponsDB ?? []} 
                                    dir={dir} 
                                    cartId={cartId} 
                                    currentCoupon={currentCoupon} 
                                />
                                <OrderSummary
                                    dir={dir}
                                    items={items}
                                    subtotal={subtotal}
                                    couponDiscount={couponDiscount}
                                    appliedCoupon={appliedCoupon}
                                    shipping={shipping}
                                    shippingMethod={shippingMethod}
                                    total={total}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}
