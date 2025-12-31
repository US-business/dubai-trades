"use client"

import Link from "next/link"
import Image from "next/image"
import { ProductProps, ProductStatus } from "@/types/product"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/shadcnUI/button"
import { Badge } from "@/components/shadcnUI/badge"
import { cn } from "@/lib/utils"
import { Card } from "../../shadcnUI/card"
import { useEffect, useState } from "react"
import { getProductReviews } from "@/lib/actions/reviews"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/stores"
import { useCart } from "@/hooks/useCart"
import { useToast } from "@/hooks/use-toast"
import {
   ProductStatusBanner,
   ProductStatusBadge,
   ProductDiscountBadge,
   ProductImage,
   ProductReviews,
   ProductPrice,
   ProductActions
} from './_components'

interface ProductCardProps {
   product: ProductProps
   dir: string
   lang?: string
   hiddenButtonCart?: boolean
   className?: string
   translations?: {
      addToCart?: string
      outOfStock?: string
      reviews?: string
      bestSeller?: string
      new?: string
      comingSoon?: string
      onSale?: string
      addedToCart?: string
      itemsAdded?: string
      error?: string
      failedToAdd?: string
      loginRequired?: string
   }
}

const ProductCard = ({
   product,
   dir,
   lang = 'en',
   hiddenButtonCart = false,
   className,
   translations
}: ProductCardProps) => {
   const [averageRating, setAverageRating] = useState<number>(0)
   const [totalReviews, setTotalReviews] = useState<number>(0)
   const [isLoadingReviews, setIsLoadingReviews] = useState(true)
   const [isAddingToCart, setIsAddingToCart] = useState(false)

   const { user } = useAuth()
   const router = useRouter()
   const { addItem } = useCart()
   const { toast } = useToast()

   // Load reviews from database
   useEffect(() => {
      const loadReviews = async () => {
         if (!product.id) {
            setIsLoadingReviews(false)
            return
         }

         try {
            const response = await getProductReviews(product.id)
            if (response.success) {
               setAverageRating(response.averageRating || 0)
               setTotalReviews(response.totalReviews || 0)
            }
         } catch (error) {
            // console.error('Error loading reviews:', error)
         } finally {
            setIsLoadingReviews(false)
         }
      }

      loadReviews()
   }, [product.id])

   const price = Number(product?.price) || 0
   const discountValue = Number(product?.discountValue) || 0

   const hasDiscount: boolean =
      product?.discountType !== "none" && discountValue > 0

   const discountedPrice: number = hasDiscount
      ? price - (product.discountType === "fixed"
         ? discountValue
         : (price * discountValue) / 100)
      : price


   const handleAddToCart = async () => {
      if (!product?.id) {
         return
      }

      setIsAddingToCart(true)
      try {
         // 🎯 استخدام useCart hook الموحد - يتعامل مع الزوار والمستخدمين تلقائياً
         await addItem({
            productId: Number(product.id),
            quantity: 1,
            coupon: {
               id: 0,
               code: "",
               discountType: 'none',
               discountValue: "0"
            },
            product: {
               id: Number(product.id),
               nameEn: product.nameEn,
               nameAr: product.nameAr,
               price: String(product.price ?? 0),
               images: product.images ?? [],
               quantityInStock: Number(product.quantityInStock ?? 0),
               discountType: (product.discountType ?? 'none') as 'fixed' | 'percentage' | 'none',
               discountValue: product.discountValue != null ? String(product.discountValue) : null
            }
         })
         
         // ✅ الـ hook يتعامل مع Toast تلقائياً
      } catch (error) {
         // ✅ الخطأ تم التعامل معه في الـ hook
         console.error('Error adding to cart:', error)
      } finally {
         setIsAddingToCart(false)
      }
   }

   const productName = dir === 'rtl' ? product.nameAr : product.nameEn
   const currencySymbol = dir === 'rtl' ? 'ج.م' : 'EGP'

   return (
      <Card className={cn(
         "group relative w-full h-full overflow-hidden flex flex-col gap-2 p-4 rounded-xl border shadow-sm transition-all hover:shadow-lg hover:border-amber-500/30 select-none",
         className
      )}>
         {/* Out of Stock Banner */}
         <ProductStatusBanner
            isVisible={!product.quantityInStock}
            text={translations?.outOfStock || (dir === 'rtl' ? 'نفذت الكمية' : 'Out of Stock')}
         />

         {/* Status Badge */}
         <ProductStatusBadge
            status={product.status || 'normal'}
            isVisible={product.quantityInStock && product.status && product.status !== 'normal'}
            dir={dir}
            translations={translations}
            product={product}
            hiddenButtonCart={hiddenButtonCart}
            lang={lang}
         />

         {/* Discount Badge */}
         <ProductDiscountBadge
            hasDiscount={product.quantityInStock && hasDiscount}
            discountType={product.discountType || 'none'}
            discountValue={discountValue}
            currencySymbol={currencySymbol}
            dir={dir}
         />

         {/* Product Image */}
         <ProductImage
            productId={Number(product.id)}
            images={product.images}
            imageAlt={product.imageAlt}
            productName={productName}
            lang={lang}
         />

         {/* Product Info */}
         <div className="flex flex-col gap-2 flex-1">
            {/* Product Name */}
            <h3 className="font-semibold text-base line-clamp-1  hover:text-amber-600 transition-colors">
               <Link href={`/${lang}/products/${product.id}`}>
                  {productName}
               </Link>
            </h3>

            {/* Reviews */}
            <ProductReviews
               averageRating={averageRating}
               totalReviews={totalReviews}
               isLoading={isLoadingReviews}
            />

            {/* Price */}
            <ProductPrice
               price={price}
               discountedPrice={discountedPrice}
               currencySymbol={currencySymbol}
               hasDiscount={hasDiscount}
               dir={dir}
               quantityInStock={product.quantityInStock}
            />

            {/* Actions */}
            <ProductActions
               isVisible={!hiddenButtonCart && product.quantityInStock > 0}
               isAddingToCart={isAddingToCart}
               onAddToCart={handleAddToCart}
               addToCartText={translations?.addToCart || (dir === 'rtl' ? 'أضف إلى السلة' : 'Add to Cart')}
               addingText={dir === 'rtl' ? 'جاري الإضافة...' : 'Adding...'}
               dir={dir}
               productId={Number(product.id)}
               lang={lang}
               product={{
                  id: Number(product.id),
                  nameEn: product.nameEn,
                  nameAr: product.nameAr,
                  price: String(product.price ?? 0),
                  images: product.images ?? [],
                  quantityInStock: Number(product.quantityInStock ?? 0),
                  discountType: (product.discountType ?? 'none') as 'fixed' | 'percentage' | 'none',
                  discountValue: product.discountValue != null ? String(product.discountValue) : null
               }}
            />
         </div>
      </Card>
   )
}

export default ProductCard
