"use client"

import { useState } from "react"
import { MessageSquare, Send, Edit2, Save, X } from "lucide-react"
import { Button } from "@/components/shadcnUI/button"
import { Card, CardContent } from "@/components/shadcnUI/card"
import { Textarea } from "@/components/shadcnUI/textarea"
import { Badge } from "@/components/shadcnUI/badge"
import { addSellerResponse } from "@/lib/actions/reviews"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface SellerResponseProps {
  reviewId: number
  existingResponse?: {
    id: number
    response: string
    createdAt: Date
    seller: {
      username: string | null
      email: string
    }
  } | null
  currentUserId?: number
  isAdmin?: boolean
  dir: "rtl" | "ltr"
  className?: string
}

export function SellerResponse({
  reviewId,
  existingResponse,
  currentUserId,
  isAdmin = false,
  dir,
  className
}: SellerResponseProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [responseText, setResponseText] = useState(existingResponse?.response || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Only admins or sellers can respond
  const canRespond = currentUserId && isAdmin

  const handleSubmit = async () => {
    if (!responseText.trim()) {
      toast.error(dir === "rtl" ? "الرجاء كتابة رد" : "Please enter a response")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await addSellerResponse(reviewId, responseText.trim())
      
      if (result.success) {
        toast.success(
          existingResponse
            ? (dir === "rtl" ? "تم تحديث الرد بنجاح" : "Response updated successfully")
            : (dir === "rtl" ? "تم إضافة الرد بنجاح" : "Response added successfully")
        )
        setIsEditing(false)
        // In a real app, you'd want to refresh the data or update the parent component
      } else {
        toast.error(result.error || (dir === "rtl" ? "فشل في حفظ الرد" : "Failed to save response"))
      }
    } catch (error) {
      toast.error(dir === "rtl" ? "حدث خطأ" : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setResponseText(existingResponse?.response || "")
    setIsEditing(false)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(dir === "rtl" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className={cn("mt-4", className)}>
      {existingResponse && !isEditing ? (
        // Display existing response
        <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {dir === "rtl" ? "رد البائع" : "Seller Response"}
                </Badge>
              </div>
              {canRespond && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <p className="text-gray-700 text-sm leading-relaxed mb-3" dir={dir}>
              {existingResponse.response}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {dir === "rtl" ? "بواسطة" : "By"}{" "}
                {existingResponse.seller.username || existingResponse.seller.email.split("@")[0]}
              </span>
              <span>{formatDate(existingResponse.createdAt)}</span>
            </div>
          </CardContent>
        </Card>
      ) : canRespond ? (
        // Add/Edit response form
        <Card className="border-dashed border-2 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">
                {existingResponse
                  ? (dir === "rtl" ? "تعديل رد البائع" : "Edit Seller Response")
                  : (dir === "rtl" ? "إضافة رد البائع" : "Add Seller Response")
                }
              </span>
            </div>
            
            <Textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder={
                dir === "rtl"
                  ? "اكتب ردك على هذا التقييم..."
                  : "Write your response to this review..."
              }
              className="mb-3"
              rows={3}
              dir={dir}
            />
            
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !responseText.trim()}
                className="flex items-center gap-2"
                size="sm"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-3 w-3" />
                )}
                {dir === "rtl" ? "حفظ الرد" : "Save Response"}
              </Button>
              
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  <X className="h-3 w-3 me-1" />
                  {dir === "rtl" ? "إلغاء" : "Cancel"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
