
"use client"
import React, { useEffect, useState } from 'react'
import { Badge } from '../../../../../components/shadcnUI/badge'
import { Button } from '../../../../../components/shadcnUI/button'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Separator } from '../../../../../components/shadcnUI/separator'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/lib/stores'
import { CartItem } from "@/types/cart" // ✅ Use types/cart which has stock fields
import CartQuantity from './CartQuantity'
import { useCart } from '@/hooks/useCart'
import { calculateProductPrice } from '@/lib/utils/pricing'

type CartItemProps = {
    user: { id: number } | null
    dir: string
    cart: { success: boolean; data: { items: CartItem[] } } | any
    dictionary?: any
}

const CartItems = ({ user, dir, cart, dictionary }: CartItemProps) => {

    const [isUpdating, setIsUpdating] = useState<number | null>(null)
    const { items: localItems } = useCartStore()
    const { removeItem } = useCart()
    
    // 🔄 NEW LOGIC: Use DB cart for logged-in users, localStorage for guests
    const items = user?.id && cart?.success && cart?.data?.items 
        ? cart.data.items 
        : localItems

    const handleRemoveItem = async (cartItemId: number) => {
        setIsUpdating(cartItemId)
        try {
            // 🎯 useCart hook يتعامل مع الزوار والمستخدمين تلقائياً
            await removeItem(cartItemId)
        } catch (error) {
            console.error('Error removing item:', error)
        } finally {
            setIsUpdating(null)
        }
    }


    return (
        <>
            {items.map((item : CartItem, index : number) => {
                // ✅ Use centralized pricing utility
                const finalPrice = calculateProductPrice(item.product)
                const itemPrice = Number(item.product.price || 0)
                const discountValue = Number(item.product.discountValue || 0)

                // ✅ Use server-provided stock status if available
                const isOutOfStock = item.isOutOfStock ?? (item.product.quantityInStock <= 0)
                const isLowStock = item.isLowStock ?? false
                const availableQty = item.availableQuantity ?? item.product.quantityInStock
                const isUpdatingThis = isUpdating === item.id

                return (
                    <div key={item.id}>
                        <div className={cn(
                            "flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4",
                            dir === "rtl" && "sm:space-x-reverse"
                        )}>
                            {/* Product Image & Info */}
                            <div className="flex items-center gap-3 w-full sm:w-auto sm:flex-1">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    {item.product.images?.[0] ? (
                                        <img
                                            src={item.product.images[0]}
                                            alt={dir === "rtl" ? item.product.nameAr : item.product.nameEn}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                            <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                                        {dir === "rtl" ? item.product.nameAr : item.product.nameEn}
                                    </h3>
                                    <div className={cn("flex items-center gap-2 mt-1 flex-wrap", dir === "rtl" && "space-x-reverse")}>
                                        <span className="font-bold text-primary text-sm sm:text-base">${finalPrice.toFixed(2)}</span>
                                        {item.product.discountType !== 'none' && discountValue > 0 && (
                                            <span className="text-xs sm:text-sm text-gray-500 line-through">${itemPrice.toFixed(2)}</span>
                                        )}
                                        {/* ✅ Stock status badges */}
                                        {isOutOfStock && (
                                            <Badge variant="destructive" className="text-[10px] sm:text-xs">
                                                {dir === "rtl" ? "نفذت الكمية" : "Out of Stock"}
                                            </Badge>
                                        )}
                                        {!isOutOfStock && isLowStock && (
                                            <Badge variant="secondary" className="text-[10px] sm:text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                                                {dir === "rtl" ? `متوفر ${availableQty} فقط` : `Only ${availableQty} left`}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quantity & Actions */}
                            <div className="flex items-center justify-between w-full sm:w-auto gap-3 sm:gap-4">
                                <CartQuantity
                                    item={item}
                                    dir={dir}
                                />
                                <div className={cn("text-right flex items-center gap-2", dir === "rtl" && "flex-row-reverse")}>
                                    <p className="font-bold text-sm sm:text-base">${(finalPrice * item.quantity).toFixed(2)}</p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveItem(item.id)}
                                        disabled={isUpdatingThis}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                        {index < cart.data.items.length - 1 && <Separator className="mt-4" />}
                    </div>
                )
            })}
        </>
    )
}

export default CartItems