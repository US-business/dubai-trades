import Image from "next/image"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "@/components/shadcnUI/button"
import { Card, CardContent } from "@/components/shadcnUI/card"
import { Badge } from "@/components/shadcnUI/badge"
import { cn } from "@/lib/utils"
import { calculateProductPrice } from "@/lib/utils/pricing"
import type { Dictionary } from "@/lib/i18n/dictionary-types"
import type { WishlistItem } from "./types"

interface WishlistItemCardProps {
  item: WishlistItem
  dir: "ltr" | "rtl"
  dictionary: Dictionary
  loading: boolean
  removing: boolean
  onMoveToCart: (productId: number) => void
  onRemove: (productId: number) => void
}

export default function WishlistItemCard({
  item,
  dir,
  dictionary,
  loading,
  removing,
  onMoveToCart,
  onRemove,
}: WishlistItemCardProps) {
  const finalPrice = item.product.isPriceActive ? calculateProductPrice(item.product) : null
  const hasDiscount = item.product.discountType !== "none" && item.product.discountValue
  const isOutOfStock = (item.product.quantityInStock ?? 0) <= 0

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: dir === "rtl" ? "جديد" : "New", variant: "default" as const },
      best_seller: { label: dir === "rtl" ? "الأكثر مبيعاً" : "Best Seller", variant: "secondary" as const },
      on_sale: { label: dir === "rtl" ? "تخفيض" : "On Sale", variant: "destructive" as const },
      coming_soon: { label: dir === "rtl" ? "قريباً" : "Coming Soon", variant: "outline" as const },
    }
    return statusConfig[status as keyof typeof statusConfig] || null
  }

  const statusBadge = item.product.status ? getStatusBadge(item.product.status) : null

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", isOutOfStock && "opacity-60")}>
      <CardContent className="p-0">
        <div className={cn("flex flex-col sm:flex-row gap-4 p-4", dir === "rtl" && "sm:flex-row-reverse")}>
          {/* Product Image */}
          <div className="relative w-full sm:w-32 h-48 sm:h-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
            {item.product.images && item.product.images.length > 0 ? (
              <Image
                src={item.product.images[0]}
                alt={dir === "rtl" ? item.product.nameAr : item.product.nameEn}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 128px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Heart className="w-12 h-12 text-gray-300" />
              </div>
            )}
            {statusBadge && (
              <Badge className="absolute top-2 left-2" variant={statusBadge.variant}>
                {statusBadge.label}
              </Badge>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <h3 className={cn("font-semibold text-base sm:text-lg mb-1 break-words", dir === "rtl" && "text-right")}>
                  {dir === "rtl" ? item.product.nameAr : item.product.nameEn}
                </h3>
                
                {item.product.category && (
                  <p className={cn("text-sm text-muted-foreground mb-2", dir === "rtl" && "text-right")}>
                    {dir === "rtl" ? item.product.category.nameAr : item.product.category.nameEn}
                  </p>
                )}

                {/* Price */}
                {item.product.isPriceActive && finalPrice !== null && (
                  <div className={cn("flex items-center gap-2 mb-3", dir === "rtl" && "flex-row-reverse justify-end")}>
                    <span className="text-xl font-bold text-primary">
                      ${finalPrice.toFixed(2)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${parseFloat(item.product.price!).toFixed(2)}
                      </span>
                    )}
                  </div>
                )}

                {/* Stock Status */}
                {isOutOfStock && (
                  <Badge variant="destructive" className="mb-2">
                    {dictionary.cart.outOfStock}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className={cn("flex flex-wrap gap-2 mt-auto", dir === "rtl" && "flex-row-reverse")}>
                <Button
                  onClick={() => onMoveToCart(item.productId)}
                  disabled={loading || isOutOfStock}
                  className="flex-1 sm:flex-none"
                  size="sm"
                >
                  <ShoppingCart className={cn("h-4 w-4", dir === "rtl" ? "ml-2" : "mr-2")} />
                  {loading
                    ? (dir === "rtl" ? "جاري الإضافة..." : "Adding...")
                    : dictionary.wishlist.moveToCart}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemove(item.productId)}
                  disabled={removing}
                  className="flex-1 sm:flex-none"
                >
                  <Trash2 className={cn("h-4 w-4", dir === "rtl" ? "ml-2" : "mr-2")} />
                  {removing
                    ? (dir === "rtl" ? "جاري الحذف..." : "Removing...")
                    : dictionary.common.delete}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
