import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { removeFromWishlist } from "@/lib/actions/wishlist"
import { addToCartAction } from "@/lib/actions/cart"

interface UseWishlistActionsProps {
  userId: number
  dir: "ltr" | "rtl"
}

export function useWishlistActions({ userId, dir }: UseWishlistActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<number | null>(null)
  const [removing, setRemoving] = useState<number | null>(null)

  const handleMoveToCart = async (productId: number) => {
    setLoading(productId)
    try {
      // ✅ For logged-in users, add to cart directly
      // This is already optimized - addToCartAction handles DB operations
      const result = await addToCartAction(userId, productId, 1)
      if (result.success) {
        // Remove from wishlist after adding to cart
        await removeFromWishlist(userId, productId)
        
        toast({
          title: dir === "rtl" ? "تمت الإضافة" : "Success",
          description: dir === "rtl" ? "تم نقل المنتج إلى السلة" : "Product moved to cart",
        })
        router.refresh()
      } else {
        toast({
          title: dir === "rtl" ? "خطأ" : "Error",
          description: result.error || (dir === "rtl" ? "فشل نقل المنتج" : "Failed to move product"),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: dir === "rtl" ? "خطأ" : "Error",
        description: dir === "rtl" ? "حدث خطأ غير متوقع" : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleRemove = async (productId: number) => {
    setRemoving(productId)
    try {
      const result = await removeFromWishlist(userId, productId)
      if (result.success) {
        toast({
          title: dir === "rtl" ? "تم الحذف" : "Removed",
          description: dir === "rtl" ? "تم حذف المنتج من قائمة الأمنيات" : "Product removed from wishlist",
        })
        router.refresh()
      } else {
        toast({
          title: dir === "rtl" ? "خطأ" : "Error",
          description: result.error || (dir === "rtl" ? "فشل حذف المنتج" : "Failed to remove product"),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: dir === "rtl" ? "خطأ" : "Error",
        description: dir === "rtl" ? "حدث خطأ غير متوقع" : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setRemoving(null)
    }
  }

  return {
    loading,
    removing,
    handleMoveToCart,
    handleRemove,
  }
}
