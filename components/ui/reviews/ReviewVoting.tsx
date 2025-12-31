"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react"
import { Button } from "@/components/shadcnUI/button"
import { voteOnReview } from "@/lib/actions/reviews"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ReviewVotingProps {
  reviewId: number
  initialHelpfulCount: number
  initialNotHelpfulCount: number
  currentUserId?: number
  reviewUserId: number
  dir: "rtl" | "ltr"
  className?: string
}

export function ReviewVoting({
  reviewId,
  initialHelpfulCount,
  initialNotHelpfulCount,
  currentUserId,
  reviewUserId,
  dir,
  className
}: ReviewVotingProps) {
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount)
  const [notHelpfulCount, setNotHelpfulCount] = useState(initialNotHelpfulCount)
  const [userVote, setUserVote] = useState<'helpful' | 'not_helpful' | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Don't show voting for own review or if not logged in
  const canVote = currentUserId && currentUserId !== reviewUserId

  const handleVote = async (voteType: 'helpful' | 'not_helpful') => {
    if (!canVote) {
      toast.error(dir === "rtl" ? "يجب تسجيل الدخول للتصويت" : "Please sign in to vote")
      return
    }

    setIsLoading(true)
    try {
      const result = await voteOnReview(reviewId, voteType)
      
      if (result.success) {
        // Update local state based on vote change
        if (userVote === voteType) {
          // User clicked same vote - remove vote
          setUserVote(null)
          if (voteType === 'helpful') {
            setHelpfulCount(prev => Math.max(0, prev - 1))
          } else {
            setNotHelpfulCount(prev => Math.max(0, prev - 1))
          }
        } else {
          // User clicked different vote or first time voting
          if (userVote === 'helpful' && voteType === 'not_helpful') {
            setHelpfulCount(prev => Math.max(0, prev - 1))
            setNotHelpfulCount(prev => prev + 1)
          } else if (userVote === 'not_helpful' && voteType === 'helpful') {
            setNotHelpfulCount(prev => Math.max(0, prev - 1))
            setHelpfulCount(prev => prev + 1)
          } else if (!userVote) {
            // First time voting
            if (voteType === 'helpful') {
              setHelpfulCount(prev => prev + 1)
            } else {
              setNotHelpfulCount(prev => prev + 1)
            }
          }
          setUserVote(voteType)
        }

        toast.success(dir === "rtl" ? "تم التصويت بنجاح" : "Vote recorded successfully")
      } else {
        toast.error(result.error || (dir === "rtl" ? "فشل في التصويت" : "Failed to vote"))
      }
    } catch (error) {
      toast.error(dir === "rtl" ? "حدث خطأ" : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!canVote) {
    return (
      <div className={cn("flex items-center gap-4 text-sm text-gray-500", className)}>
        <div className="flex items-center gap-1">
          <ThumbsUp className="h-4 w-4" />
          <span>{helpfulCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <ThumbsDown className="h-4 w-4" />
          <span>{notHelpfulCount}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-gray-600 me-2">
        {dir === "rtl" ? "هل كان هذا التقييم مفيداً؟" : "Was this review helpful?"}
      </span>

      <Button
        variant={userVote === 'helpful' ? "default" : "outline"}
        size="sm"
        onClick={() => handleVote('helpful')}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-1 text-xs",
          userVote === 'helpful' && "bg-green-600 hover:bg-green-700"
        )}
      >
        {isLoading && userVote === 'helpful' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <ThumbsUp className="h-3 w-3" />
        )}
        <span>{dir === "rtl" ? "مفيد" : "Helpful"}</span>
        <span className="font-semibold">({helpfulCount})</span>
      </Button>

      <Button
        variant={userVote === 'not_helpful' ? "default" : "outline"}
        size="sm"
        onClick={() => handleVote('not_helpful')}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-1 text-xs",
          userVote === 'not_helpful' && "bg-red-600 hover:bg-red-700"
        )}
      >
        {isLoading && userVote === 'not_helpful' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <ThumbsDown className="h-3 w-3" />
        )}
        <span>{dir === "rtl" ? "غير مفيد" : "Not Helpful"}</span>
        <span className="font-semibold">({notHelpfulCount})</span>
      </Button>
    </div>
  )
}
