import { getCartFull } from "@/lib/actions/cart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcnUI/card"
import { ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/shadcnUI/breadcrumb"
import BackLink from "@/components/shared/BackLink"
import { type CartItem } from "@/lib/stores/cart-store"
import CartItems from "@/app/[lang]/(site)/cart/_components/CartItems"
import { cookies } from "next/headers"
import { getNextAuthUser } from "@/lib/auth/guards"
import TrustIndicators from "@/app/[lang]/(site)/cart/_components/TrustIndicators"
import OrderSummary from "@/app/[lang]/(site)/cart/_components/OrderSummary"
import { getAllCoupons } from "@/lib/actions/coupons"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { type Locale } from "@/lib/i18n/i18n-config"
import GuestCartView from "./_components/GuestCartView/GuestCartView"


export default async function CartPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const resolvedParams = await params
  const lang = resolvedParams.lang as Locale

  const cookieStore = await cookies();
  const locale = cookieStore.get("preferred-locale")?.value as Locale || "ar"; // default ar
  const dir = locale === "ar" ? "rtl" : "ltr";
  const dictionary = await getDictionary(locale);

  const user = await getNextAuthUser()
  const couponsResult = await getAllCoupons()
  const cart = user?.id ? await getCartFull(user.id) : null

  // 🆕 للزوار: عرض عربة من localStorage
  if (!user) {
    return <GuestCartView dir={dir} dictionary={dictionary} />
  }

  if (cart?.success && cart?.data?.items.length === 0) {
    return (
      <>
        {/* Hydrate client cart store to clear any stale items in dropdown */}
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md mx-auto px-4">
            <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {dictionary.cart.emptyCart}
            </h1>
            <p className="text-gray-600">
              {dictionary.cart.emptyCartDescription}
            </p>
            <BackLink dir={dir} className="my-4" href="/" text={dictionary.cart.startShopping} />
          </div>
        </div>
      </>
    )
  }




  return (
    <>
      {/* Hydrate client cart store so dropdown matches server cart */}
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-8 max-w-7xl">
          {/* Breadcrumbs */}
          <Breadcrumb className="mb-4 sm:mb-6">
            <BreadcrumbList className="text-xs sm:text-sm">
              <BreadcrumbItem>
                <BreadcrumbLink href="/">{dictionary.common.home}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{dictionary.cart.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="w-full lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3", dir === "rtl" && "sm:flex-row-reverse")}>
                    <span className="text-lg sm:text-xl">
                      {dictionary.cart.title} ({cart?.data?.items.length}{" "}
                      {dictionary.cart.items})
                    </span>
                    <BackLink dir={dir} className="w-full sm:w-auto" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  {user?.id && <CartItems dir={dir} cart={cart} user={{ id: user.id }} dictionary={dictionary} />}
                </CardContent>
              </Card>
              <p className="text-xs sm:text-sm text-sky-700 text-center my-4 bg-sky-50 p-2 sm:p-3 rounded border-sky-500 border">
                {dictionary.cart.pricesIncludeVAT}
              </p>
              <TrustIndicators dir={dir} dictionary={dictionary} />
            </div>

            {/* Order Summary */}
            <div className="w-full space-y-6">
              <OrderSummary
                dir={dir}
                cart={cart}
                couponsDB={couponsResult.data}
                currentCoupon={cart?.success && cart?.data ? cart?.data?.coupon : null}
                cartId={cart?.success && cart.data ? cart.data.id : 0}
                dictionary={dictionary}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
