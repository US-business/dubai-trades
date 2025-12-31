import { CardHeader, CardTitle } from "@/components/shadcnUI/card"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import BackLink from "@/components/shared/BackLink"
import type { Dictionary } from "@/lib/i18n/dictionary-types"

interface WishlistHeaderProps {
  dir: "rtl" | "ltr"
  dictionary: Dictionary
  totalItems: number
}

export default function WishlistHeader({ dir, dictionary, totalItems }: WishlistHeaderProps) {
  return (
    <CardHeader className="p-4 sm:p-6">
      <CardTitle className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-lg sm:text-xl", dir === "rtl" && "sm:flex-row-reverse")}>
        <span className="flex items-center gap-2">
          <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-red-500" />
          {dictionary.wishlist.title} ({totalItems} {dictionary.wishlist.items})
        </span>
        <BackLink dir={dir} className="w-full sm:w-auto" />
      </CardTitle>
    </CardHeader>
  )
}
