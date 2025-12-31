export interface WishlistItem {
  id: number
  productId: number
  product: {
    id: number
    nameEn: string
    nameAr: string
    slug: string
    price: string | null
    isPriceActive: boolean | null
    images: string[]
    quantityInStock: number | null
    discountType: "fixed" | "percentage" | "none"
    discountValue: string | null
    status: string | null
    category?: {
      nameEn: string
      nameAr: string
    } | null
  }
}
