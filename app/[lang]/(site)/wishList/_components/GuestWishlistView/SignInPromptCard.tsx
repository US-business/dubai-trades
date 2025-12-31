import { Card, CardContent } from "@/components/shadcnUI/card"
import { Button } from "@/components/shadcnUI/button"
import { useRouter } from "next/navigation"
import type { Dictionary } from "@/lib/i18n/dictionary-types"

interface SignInPromptCardProps {
  dir: "rtl" | "ltr"
  dictionary: Dictionary
}

export default function SignInPromptCard({ dir, dictionary }: SignInPromptCardProps) {
  const router = useRouter()

  return (
    <Card>
      <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-center space-y-2 sm:space-y-3">
          <p className="text-blue-900 font-medium text-xs sm:text-sm">
            {dir === "rtl"
              ? "💡 سجل دخولك لحفظ قائمة الأمنيات والحصول على مزايا إضافية!"
              : "💡 Sign in to save your wishlist and get extra benefits!"}
          </p>
          <Button
            onClick={() => router.push('/signin')}
            className="w-full h-9 sm:h-10 text-sm sm:text-base"
          >
            {dictionary.common.login}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
