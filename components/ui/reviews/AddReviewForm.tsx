"use client"

import { useState, useEffect } from "react"
import { StarRating } from "./StarRating"
import { Button } from "@/components/shadcnUI/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcnUI/card"
import { Textarea } from "@/components/shadcnUI/textarea"
import { Label } from "@/components/shadcnUI/label"
import { Alert, AlertDescription } from "@/components/shadcnUI/alert"
import { addReview, canUserWriteReview } from "@/lib/actions/reviews"
import { toast } from "sonner"
import { ShoppingBag, AlertCircle, CheckCircle } from "lucide-react"

interface AddReviewFormProps {
  productId: number
  dir: "rtl" | "ltr"
  onReviewAdded?: () => void
}

export function AddReviewForm({ productId, dir, onReviewAdded }: AddReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [canWriteReview, setCanWriteReview] = useState<{
    canWrite: boolean
    reason: string
    message: string
    isLoading: boolean
  }>({
    canWrite: false,
    reason: "",
    message: "",
    isLoading: true
  })

  // Check if user can write a review when component mounts
  useEffect(() => {
    checkReviewEligibility()
  }, [productId])

  const checkReviewEligibility = async () => {
    try {
      const result = await canUserWriteReview(productId)
      if (result.success && result.data) {
        setCanWriteReview({
          canWrite: result.data.canWrite,
          reason: result.data.reason,
          message: result.data.message,
          isLoading: false
        })
      } else {
        setCanWriteReview({
          canWrite: false,
          reason: "error",
          message: result.error || "فشل في التحقق من إمكانية كتابة المراجعة",
          isLoading: false
        })
      }
    } catch (error) {
      setCanWriteReview({
        canWrite: false,
        reason: "error",
        message: "حدث خطأ أثناء التحقق من إمكانية كتابة المراجعة",
        isLoading: false
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error(dir === "rtl" ? "الرجاء تحديد التقييم" : "Please select a rating")
      return
    }

    setIsLoading(true)
    try {
      const result = await addReview(productId, rating, comment)
      
      if (result.success) {
        toast.success(dir === "rtl" ? "تم إضافة التقييم بنجاح" : "Review added successfully")
        setRating(0)
        setComment("")
        onReviewAdded?.()
      } else {
        toast.error(result.error || (dir === "rtl" ? "فشل إضافة التقييم" : "Failed to add review"))
      }
    } catch (error) {
      toast.error(dir === "rtl" ? "حدث خطأ" : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking eligibility
  if (canWriteReview.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {dir === "rtl" ? "أضف تقييمك" : "Add Your Review"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show message if user cannot write a review
  if (!canWriteReview.canWrite) {
    const getAlertVariant = () => {
      switch (canWriteReview.reason) {
        case "not_purchased":
          return "destructive"
        case "already_reviewed":
          return "default"
        case "not_authenticated":
          return "default"
        default:
          return "destructive"
      }
    }

    const getIcon = () => {
      switch (canWriteReview.reason) {
        case "not_purchased":
          return <ShoppingBag className="h-4 w-4" />
        case "already_reviewed":
          return <CheckCircle className="h-4 w-4" />
        default:
          return <AlertCircle className="h-4 w-4" />
      }
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {dir === "rtl" ? "أضف تقييمك" : "Add Your Review"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant={getAlertVariant()}>
            {getIcon()}
            <AlertDescription className="flex items-center gap-2">
              {canWriteReview.message}
            </AlertDescription>
          </Alert>
          
          {canWriteReview.reason === "not_purchased" && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">
                {dir === "rtl" 
                  ? "لماذا نطلب منك شراء المنتج أولاً؟" 
                  : "Why do we require you to purchase first?"}
              </h4>
              <p className="text-sm text-blue-800">
                {dir === "rtl"
                  ? "نحن نطلب من العملاء شراء المنتج قبل كتابة المراجعات لضمان صحة وجودة التقييمات، وذلك لحماية العملاء الآخرين من المراجعات المضللة."
                  : "We require customers to purchase products before writing reviews to ensure authentic and quality reviews, protecting other customers from misleading feedback."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {dir === "rtl" ? "أضف تقييمك" : "Add Your Review"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Show verified purchase badge */}
        <Alert className="mb-4 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {dir === "rtl" 
              ? "تم التحقق من شرائك لهذا المنتج. يمكنك الآن كتابة مراجعة موثقة." 
              : "Your purchase of this product has been verified. You can now write a verified review."}
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div className="space-y-2">
            <Label>
              {dir === "rtl" ? "التقييم" : "Rating"}
              <span className="text-red-500 ms-1">*</span>
            </Label>
            <StarRating
              rating={rating}
              size="lg"
              interactive
              onRatingChange={setRating}
            />
            {rating > 0 && (
              <p className="text-sm text-gray-600">
                {dir === "rtl" ? `لقد اخترت ${rating} نجوم` : `You selected ${rating} stars`}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              {dir === "rtl" ? "تعليقك (اختياري)" : "Your Comment (Optional)"}
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                dir === "rtl"
                  ? "شارك تجربتك مع هذا المنتج..."
                  : "Share your experience with this product..."
              }
              className="min-h-[120px]"
              dir={dir}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || rating === 0}
            className="w-full"
          >
            {isLoading
              ? dir === "rtl"
                ? "جاري الإضافة..."
                : "Adding..."
              : dir === "rtl"
              ? "إضافة التقييم"
              : "Add Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
