"use client"

import { useWishlist } from "@/hooks/useWishlist"
import { Card, CardContent } from "@/components/shadcnUI/card"
import type { Dictionary } from "@/lib/i18n/dictionary-types"
import EmptyWishlistView from "./EmptyWishlistView"
import WishlistHeader from "./WishlistHeader"
import WishlistItem from "./WishlistItem"
import InfoCard from "./InfoCard"
import SignInPromptCard from "./SignInPromptCard"

interface GuestWishlistViewProps {
  dir: "rtl" | "ltr"
  dictionary: Dictionary
}

export default function GuestWishlistView({ dir, dictionary }: GuestWishlistViewProps) {
  const { items, removeItem, totalItems } = useWishlist()

  // Empty wishlist
  if (totalItems === 0) {
    return <EmptyWishlistView dir={dir} dictionary={dictionary} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-8 max-w-7xl">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Wishlist Items */}
          <div className="w-full lg:col-span-2 space-y-4">
            <Card>
              <WishlistHeader 
                dir={dir} 
                dictionary={dictionary} 
                totalItems={totalItems} 
              />
              <CardContent className="space-y-4 p-4 sm:p-6">
                {items.map((item, index) => (
                  <WishlistItem
                    key={item.id}
                    item={item}
                    dir={dir}
                    dictionary={dictionary}
                    onRemove={removeItem}
                    showSeparator={index < items.length - 1}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="w-full space-y-4 sm:space-y-6">
            <InfoCard dir={dir} />
            <SignInPromptCard dir={dir} dictionary={dictionary} />
          </div>
        </div>
      </div>
    </div>
  )
}
