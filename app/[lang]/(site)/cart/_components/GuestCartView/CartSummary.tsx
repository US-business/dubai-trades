import { Button } from "@/components/shadcnUI/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcnUI/card"
import { Separator } from "@/components/shadcnUI/separator"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface CartSummaryProps {
  dir: "rtl" | "ltr"
  totalPrice: number
  dictionary: {
    cart: {
      orderSummary: string
      subtotal: string
    }
    common: {
      total: string
      signIn: string
    }
  }
}

export function CartSummary({ dir, totalPrice, dictionary }: CartSummaryProps) {
  const router = useRouter()
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="lg:sticky lg:top-4">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">{dictionary.cart.orderSummary || "ملخص الطلب"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          <div className={cn("flex justify-between text-sm sm:text-base", dir === "rtl" && "flex-row-reverse")}>
            <span className="text-muted-foreground">{dictionary.cart.subtotal || "المجموع الفرعي"}</span>
            <span className="font-medium">EGP{totalPrice.toFixed(2)}</span>
          </div>
          <Separator />
          <div className={cn("flex justify-between font-bold text-base sm:text-lg", dir === "rtl" && "flex-row-reverse")}>
            <span>{dictionary.common.total || "الإجمالي"}</span>
            <span>EGP{totalPrice.toFixed(2)}</span>
          </div>
          
          {/* Message for guests to sign in */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-center space-y-2 sm:space-y-3">
            <p className="text-blue-900 font-medium text-xs sm:text-sm">
              {dir === "rtl" 
                ? "💡 سجل دخولك لحفظ عربة التسوق والحصول على مزايا إضافية!"
                : "💡 Sign in to save your cart and get extra benefits!"}
            </p>
            <Button 
              onClick={() => router.push('/signin')}
              className="w-full h-9 sm:h-10 text-sm sm:text-base"
            >
              {dictionary.common.signIn || "تسجيل الدخول"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
