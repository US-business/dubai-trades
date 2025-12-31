import { ShoppingBag } from "lucide-react"
import BackLink from "@/components/shared/BackLink"

interface EmptyCartProps {
  dir: "rtl" | "ltr"
  dictionary: {
    cart: {
      emptyCart: string
      emptyCartDescription: string
      startShopping: string
    }
  }
}

export function EmptyCart({ dir, dictionary }: EmptyCartProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center space-y-4 sm:space-y-6 max-w-md mx-auto px-3 sm:px-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {dictionary.cart.emptyCart}
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          {dictionary.cart.emptyCartDescription}
        </p>
        <BackLink dir={dir} className="my-4" href="/" text={dictionary.cart.startShopping} />
      </div>
    </div>
  )
}
