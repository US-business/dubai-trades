"use client"

import { useState } from "react"
import type { Dictionary } from "@/lib/i18n/dictionary-types"
import WishlistItemCard from "./WishlistItemCard"
import RemoveConfirmationDialog from "./RemoveConfirmationDialog"
import { useWishlist } from "@/hooks/useWishlist"
import type { WishlistItem } from "./types"

interface WishlistItemsProps {
  items: WishlistItem[]
  userId: number
  dir: "ltr" | "rtl"
  dictionary: Dictionary
}

export default function WishlistItems({ items, userId, dir, dictionary }: WishlistItemsProps) {
  const [itemToRemove, setItemToRemove] = useState<number | null>(null)
  
  // ✅ Use unified wishlist hook
  const { moveToCart, removeItem, movingToCart, isLoading } = useWishlist()

  const handleRemoveClick = (productId: number) => {
    setItemToRemove(productId)
  }

  const confirmRemove = async () => {
    if (itemToRemove) {
      await removeItem(itemToRemove)
      setItemToRemove(null)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {items.map((item) => (
          <WishlistItemCard
            key={item.id}
            item={item}
            dir={dir}
            dictionary={dictionary}
            loading={movingToCart === item.productId}
            removing={isLoading}
            onMoveToCart={moveToCart}
            onRemove={handleRemoveClick}
          />
        ))}
      </div>

      <RemoveConfirmationDialog
        open={itemToRemove !== null}
        onOpenChange={() => setItemToRemove(null)}
        onConfirm={confirmRemove}
        dir={dir}
        dictionary={dictionary}
      />
    </>
  )
}
