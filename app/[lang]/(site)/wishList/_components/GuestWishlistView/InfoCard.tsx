import { Card, CardContent } from "@/components/shadcnUI/card"
import { Heart, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"

interface InfoCardProps {
  dir: "rtl" | "ltr"
}

export default function InfoCard({ dir }: InfoCardProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
        <div className={cn("space-y-3 sm:space-y-4", dir === "rtl" && "text-right")}>
          <div className={cn("flex items-start gap-2 sm:gap-3", dir === "rtl" && "flex-row-reverse")}>
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1 text-sm sm:text-base">
                {dir === "rtl" ? "احفظ مفضلاتك" : "Save Your Favorites"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {dir === "rtl"
                  ? "احتفظ بالمنتجات التي تعجبك لشرائها لاحقاً"
                  : "Keep the products you love for later purchase"}
              </p>
            </div>
          </div>

          <div className={cn("flex items-start gap-2 sm:gap-3", dir === "rtl" && "flex-row-reverse")}>
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1 text-sm sm:text-base">
                {dir === "rtl" ? "أضف للسلة بسهولة" : "Easy Add to Cart"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {dir === "rtl"
                  ? "انقل المنتجات من المفضلة إلى السلة بضغطة واحدة"
                  : "Move products from wishlist to cart with one click"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
