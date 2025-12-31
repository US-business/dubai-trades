"use client";
import React, { useEffect, useRef } from "react";
import { ShoppingCart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/shadcnUI/button";
import { Badge } from "@/components/shadcnUI/badge";
import { Separator } from "@/components/shadcnUI/separator";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/shadcnUI/accordion";
import { useCartStore } from "@/lib/stores";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import CartQuantity from "@/app/[lang]/(site)/cart/_components/CartQuantity";
import type { CartItem } from "@/types/cart"; // ✅ Use types/cart

interface CartAccordionMenuProps {
   user: { id: number } | null;
   cart: { success: boolean; data: { items: CartItem[] } } | any;
   dictionary: any;
   dir: "rtl" | "ltr";
}

const CartAccordionMenu = ({ user, cart, dictionary, dir }: CartAccordionMenuProps) => {
   const router = useRouter();
   const { items, getTotalItems, getTotalPrice, setItems } = useCartStore();
   const totalItems = getTotalItems();
   const totalPrice = getTotalPrice();
   
   // 🆕 Track last synced cart to avoid conflicts
   const lastSyncedCartRef = useRef<string>('')

   useEffect(() => {
      // Only sync when user logs in OR when cart prop actually changes
      if (user && cart?.success && Array.isArray(cart?.data?.items)) {
         // 🛡️ CRITICAL: Don't clear if cart is empty and we have local items
         if (cart.data.items.length === 0 && items.length > 0) {
            console.log("🛡️ CartAccordionMenu: Skipping empty cart - preserving during login")
            return
         }
         
         // 🆕 Check if cart actually changed to avoid re-syncing
         const cartSignature = JSON.stringify(cart.data.items.map((item: any) => ({ 
            id: item.id,
            productId: item.productId, 
            quantity: item.quantity 
         })))
         
         if (cartSignature === lastSyncedCartRef.current) {
            // Cart hasn't changed, skip update
            return
         }
         lastSyncedCartRef.current = cartSignature
         
         // 🆕 For logged-in users, sync with server cart ONLY on mount/login
         const mapped: CartItem[] = (cart.data?.items ?? []).map((item: any): CartItem => ({
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
         console.log("📝 CartAccordionMenu: Initial sync with", mapped.length, "items from server")
         setItems(mapped)
      }
      // 🆕 For guests, items are already in localStorage via zustand persist
      // ⚠️ Optimized deps: only user?.id and cart data reference
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [user?.id, cart])

   const handleViewCart = () => {
      // الزوار يمكنهم رؤية صفحة العربة
      router.push('/cart')
   }

   const handleCheckout = () => {
      // التحقق من المستخدم يحدث في صفحة Checkout نفسها
      router.push('/checkout')
   }

   return (
      <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="cart-menu" className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
            <AccordionTrigger className={cn(
               "flex items-center hover:bg-slate-50 transition-colors",
            )}>
               <div className={cn(
                  "flex items-center justify-center flex-1 gap-2",
               )}>
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-slate-700">{dictionary.cart.title}</span>
                  {totalItems > 0 && (
                     <Badge
                        className="h-5 min-w-[20px] px-1 flex items-center justify-center text-[10px] font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 animate-in fade-in zoom-in"
                     >
                        {totalItems}
                     </Badge>
                  )}
               </div>
            </AccordionTrigger>
            <AccordionContent className="bg-gradient-to-b from-slate-50/50 to-white">
               <div className="p-3">
                  <h3 className={cn(
                     "font-bold text-base mb-3 flex items-center gap-2",
                  )}>
                     <span>{dictionary.common.cart}</span>
                     {totalItems > 0 && (
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                           {totalItems} {dictionary.cart.items}
                        </span>
                     )}
                  </h3>
                  {items.length === 0 ? (
                     <div className="text-center py-8 px-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 mb-4">
                           <ShoppingBag className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 text-sm">
                           {dictionary.common.emptyCart}
                        </p>
                     </div>
                  ) : (
                     <div>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                           {items.map((item) => (
                              <div key={item.id} className={cn(
                                 "flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors",
                              )}>
                                 <div className="relative w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden shadow-sm">
                                    {item.product.images?.[0] ? (
                                       <Image
                                          src={item.product.images[0]}
                                          alt={dir === "rtl" ? item.product.nameAr : item.product.nameEn}
                                          fill
                                          className="object-cover"
                                       />
                                    ) : (
                                       <div className="w-full h-full flex items-center justify-center">
                                          <ShoppingBag className="h-7 w-7 text-slate-300" />
                                       </div>
                                    )}
                                 </div>
                                 <div className={cn(
                                    "flex-1 min-w-0",
                                    dir === "rtl" && "text-right"
                                 )}>
                                    <h4 className="text-sm font-semibold truncate text-slate-700">
                                       {dir === "rtl" ? item.product.nameAr : item.product.nameEn}
                                    </h4>
                                    <p className="text-xs font-medium text-blue-600">
                                       {Number(item.product.price).toFixed(2)} EGP
                                    </p>
                                 </div>
                                 <CartQuantity item={item} dir={dir} showDelete />
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
                  <Separator className="my-4" />
                  <div className="space-y-3">
                     <div className={cn(
                        "flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100",
                     )}>
                        <span className="font-bold text-slate-700">{dictionary.common.total}</span>
                        <span className="font-bold text-lg text-blue-600">{totalPrice.toFixed(2)} EGP</span>
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                        <Button
                           variant="outline"
                           size="sm"
                           onClick={handleViewCart}
                           className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all"
                        >
                           {dictionary.cart.title}
                        </Button>
                        <Button
                           size="sm"
                           className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
                           onClick={handleCheckout}
                           disabled={items.length === 0}
                        >
                           {dictionary.checkout.title}
                        </Button>
                     </div>
                  </div>
               </div>
            </AccordionContent>
         </AccordionItem>
      </Accordion>
   );
};

export default CartAccordionMenu;
