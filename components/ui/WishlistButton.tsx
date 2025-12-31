"use client"

import { useMemo } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/shadcnUI/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/stores'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useWishlist } from '@/hooks/useWishlist'

interface WishlistButtonProps {
  productId: number | string
  dir: string
  lang?: string
  className?: string
  iconClassName?: string
  onClick?: (e: React.MouseEvent) => void
  // ✅ Product data for adding to wishlist (required for guests)
  product?: {
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

/**
 * Reusable Wishlist Button Component
 * ✨ Now using the unified useWishlist hook for better UX
 */
const WishlistButton = ({ 
  productId, 
  dir, 
  lang = 'en',
  className,
  iconClassName,
  onClick,
  product
}: WishlistButtonProps) => {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  // ✅ Use unified wishlist hook - items needed to trigger re-render
  const { items, isInWishlist, isLoading, removeItem, addItem } = useWishlist()
  
  // Check if product is in wishlist - useMemo ensures re-calculation when items change
  const isInWishlistState = useMemo(() => {
    return isInWishlist(Number(productId))
  }, [items, productId, isInWishlist])

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Call custom onClick if provided
    if (onClick) {
      onClick(e)
    }

    if (!productId) return

    try {
      // ✅ Works for BOTH guests and logged-in users
      // - Guests: saved to localStorage
      // - Logged-in: saved to DB + localStorage
      // - On login: automatic merge
      
      if (isInWishlistState) {
        // Remove from wishlist
        await removeItem(Number(productId))
      } else {
        // Add to wishlist
        if (!product) {
          console.error('WishlistButton: Product data is required to add to wishlist')
          toast({
            title: dir === 'rtl' ? 'خطأ' : 'Error',
            description: dir === 'rtl'
              ? 'يجب توفير بيانات المنتج'
              : 'Product data required',
            variant: "destructive"
          })
          return
        }
        
        await addItem({
          productId: Number(productId),
          product
        })
      }
    } catch (error) {
      // Errors are handled by the hook and displayed via toast
      console.error('Error toggling wishlist:', error)
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggleWishlist}
      disabled={isLoading}
      title={dir === "rtl" 
        ? (isInWishlistState ? "إزالة من المفضلة" : "أضف للمفضلة") 
        : (isInWishlistState ? "Remove from Wishlist" : "Add to Wishlist")
      }
      className={cn(
        "transition-all duration-200",
        isInWishlistState 
          ? "bg-rose-50 border-rose-300 hover:bg-rose-100 shadow-lg" 
          : "hover:bg-red-50 hover:border-red-300",
        className
      )}
    >
      <Heart 
        className={cn(
          "h-4 w-4 transition-all duration-200",
          isInWishlistState ? "fill-rose-500 text-rose-500 " : "text-gray-600",
          iconClassName
        )} 
      />
    </Button>
  )
}

export default WishlistButton
