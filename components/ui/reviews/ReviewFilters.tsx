"use client"

import { useState, useEffect } from "react"
import { Star, Filter, Check } from "lucide-react"
import { Button } from "@/components/shadcnUI/button"
import { Card, CardContent } from "@/components/shadcnUI/card"
import { Badge } from "@/components/shadcnUI/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcnUI/select"
import { Checkbox } from "@/components/shadcnUI/checkbox"
import { cn } from "@/lib/utils"

interface ReviewFiltersProps {
  onFiltersChange: (filters: {
    rating?: number
    sortBy?: 'newest' | 'oldest' | 'helpful'
    verifiedOnly?: boolean
  }) => void
  totalReviews?: number
  ratingDistribution?: { rating: number; count: number }[]
  dir: "rtl" | "ltr"
  currentFilters?: {
    rating?: number
    sortBy?: 'newest' | 'oldest' | 'helpful'
    verifiedOnly?: boolean
  }
}

export function ReviewFilters({
  onFiltersChange,
  totalReviews = 0,
  ratingDistribution = [],
  dir,
  currentFilters = {}
}: ReviewFiltersProps) {
  const [selectedRating, setSelectedRating] = useState<number | undefined>(currentFilters.rating)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'helpful'>(currentFilters.sortBy || 'newest')
  const [verifiedOnly, setVerifiedOnly] = useState(currentFilters.verifiedOnly || false)

  // تحديث الحالة عندما تتغير currentFilters
  useEffect(() => {
    setSelectedRating(currentFilters.rating)
    setSortBy(currentFilters.sortBy || 'newest')
    setVerifiedOnly(currentFilters.verifiedOnly || false)
  }, [currentFilters])

  const handleRatingFilter = (rating: number) => {
    const newRating = selectedRating === rating ? undefined : rating
    setSelectedRating(newRating)
    onFiltersChange({
      rating: newRating,
      sortBy,
      verifiedOnly
    })
  }

  const handleSortChange = (newSort: 'newest' | 'oldest' | 'helpful') => {
    setSortBy(newSort)
    onFiltersChange({
      rating: selectedRating,
      sortBy: newSort,
      verifiedOnly
    })
  }

  const handleVerifiedToggle = (checked: boolean) => {
    setVerifiedOnly(checked)
    onFiltersChange({
      rating: selectedRating,
      sortBy,
      verifiedOnly: checked
    })
  }

  const clearFilters = () => {
    setSelectedRating(undefined)
    setSortBy('newest')
    setVerifiedOnly(false)
    onFiltersChange({})
  }

  const hasActiveFilters = selectedRating !== undefined || sortBy !== 'newest' || verifiedOnly

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4" />
          <h3 className={cn("font-semibold", "text-primary hover:text-primary/80",
            "px-4 border-b border-b-primary/35"
          )}>
            {dir === "rtl" ? "تصفية التقييمات" : "Filter Reviews"}
          </h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className={cn("text-sm bg-amber-50 hover:bg-amber-100",
                " text-amber-800 hover:text-amber-900",
                "border-2 border-amber-100 hover:border-amber-200"
              )}
            >
              {dir === "rtl" ? "مسح الفلاتر" : "Clear Filters"}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rating Filter */}
          <div className="space-y-4">
            <label className={cn("text-sm font-medium block",
              "px-4 border-b border-b-primary/35",
              "text-primary hover:text-primary/80"
            )}>
              {dir === "rtl" ? "حسب التقييم" : "By Rating"}
            </label>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution.find(r => r.rating === rating)?.count || 0
                const isSelected = selectedRating === rating
                
                return (
                  <Button
                    key={rating}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleRatingFilter(rating)}
                    className={cn(
                      "w-full justify-between",
                      isSelected && "bg-primary text-primary-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3 w-3",
                              i < rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-300 text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-4">
            <label className={cn("text-sm font-medium block",
              "px-4 border-b border-b-primary/35",
              "text-primary hover:text-primary/80"
            )}>
              {dir === "rtl" ? "ترتيب حسب" : "Sort By"}
            </label>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent >
                <SelectItem value="newest">
                  {dir === "rtl" ? "الأحدث أولاً" : "Newest First"}
                </SelectItem>
                <SelectItem value="oldest">
                  {dir === "rtl" ? "الأقدم أولاً" : "Oldest First"}
                </SelectItem>
                <SelectItem value="helpful">
                  {dir === "rtl" ? "الأكثر فائدة" : "Most Helpful"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Verified Purchase Filter */}
          <div className="space-y-4">
            <label className={cn("text-sm font-medium block",
              "px-4 border-b border-b-primary/35",
              "text-primary hover:text-primary/80")}>
              {dir === "rtl" ? "خيارات إضافية" : "Additional Options"}
            </label>
            <div className={cn("w-fit flex items-center gap-2",
              "p-2 bg-green-100 rounded-md")}>
              <Checkbox
                id="verified-only"
                checked={verifiedOnly}
                onCheckedChange={handleVerifiedToggle}
              />
              <label
                htmlFor="verified-only"
                className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70")}
              >
                {dir === "rtl" ? "عمليات شراء موثقة فقط" : "Verified Purchases Only"}
              </label>
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">
                {dir === "rtl" ? "الفلاتر النشطة:" : "Active filters:"}
              </span>
              {selectedRating && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {selectedRating}
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </Badge>
              )}
              {sortBy !== 'newest' && (
                <Badge variant="secondary">
                  {sortBy === 'oldest' 
                    ? (dir === "rtl" ? "الأقدم" : "Oldest")
                    : (dir === "rtl" ? "الأكثر فائدة" : "Most Helpful")
                  }
                </Badge>
              )}
              {verifiedOnly && (
                <Badge variant="secondary" className={cn("bg-green-100 hover:bg-green-200 text-green-800 px-2")}>
                  {dir === "rtl" ? "موثق فقط" : "Verified Only"}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
