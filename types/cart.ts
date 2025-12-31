export type CartItem = {
   id: number
   productId: number
   quantity: number
   // ✅ Stock status fields (added by server)
   isOutOfStock?: boolean
   isLowStock?: boolean
   availableQuantity?: number
   // ✅ Coupon field (optional)
   coupon?: {
      id: number
      code: string
      discountType: 'fixed' | 'percentage' | 'none'
      discountValue: string | null
   }
   product: {
      id: number
      nameEn: string
      nameAr: string
      price: string | null
      images: string[]
      quantityInStock: number
      discountType: 'fixed' | 'percentage' | 'none'
      discountValue: string | null
   }
}