import { cookies } from 'next/headers'
import { getCartFull } from '@/lib/actions/cart'
import CheckoutContent from '@/app/[lang]/(site)/checkout/_components/CheckoutContent'
import { getNextAuthUser } from '@/lib/auth/guards'
import { getAllCoupons } from '@/lib/actions/coupons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcnUI/card'
import { Button } from '@/components/shadcnUI/button'
import { ShoppingCart, Lock, TrendingUp } from 'lucide-react'
import Link from 'next/link'


export default async function CheckoutPage() {
  const cookieStore = await cookies()
  const locale = cookieStore.get('preferred-locale')?.value || 'ar'
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  const user = await getNextAuthUser()
  
  // 🆕 رسالة جذابة للزوار لتسجيل الدخول
  if (!user || !user.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-3 sm:p-4">
        <Card className="max-w-lg w-full shadow-xl border-2">
          <CardHeader className="text-center space-y-2 p-4 sm:p-6 pb-3 sm:pb-4">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-2">
              <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <CardTitle className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {dir === 'rtl' ? 'سجل دخولك لحفظ عربتك!' : 'Sign in to save your cart!'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <p className="text-center text-gray-600 text-sm sm:text-lg">
              {dir === 'rtl' 
                ? 'للمتابعة إلى صفحة الدفع وإتمام عملية الشراء، يرجى تسجيل الدخول أولاً' 
                : 'To proceed to checkout and complete your purchase, please sign in first'}
            </p>
            
            {/* المزايا */}
            <div className="space-y-2 sm:space-y-3 bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                {dir === 'rtl' ? 'مزايا التسجيل:' : 'Benefits of signing in:'}
              </p>
              <ul className={`space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-700 ${dir === 'rtl' ? 'mr-6 sm:mr-7' : 'ml-6 sm:ml-7'}`}>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>{dir === 'rtl' ? 'حفظ عربة التسوق عبر جميع الأجهزة' : 'Save your cart across all devices'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>{dir === 'rtl' ? 'تتبع طلباتك بسهولة' : 'Track your orders easily'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>{dir === 'rtl' ? 'عروض حصرية وخصومات خاصة' : 'Exclusive offers and special discounts'}</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link href="/signin" className="block">
                <Button className="w-full h-10 sm:h-12 text-sm sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {dir === 'rtl' ? 'تسجيل الدخول الآن' : 'Sign In Now'}
                </Button>
              </Link>
              
              <div className="text-center text-xs sm:text-sm text-gray-600">
                {dir === 'rtl' ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
                <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
                  {dir === 'rtl' ? 'سجل الآن' : 'Sign Up'}
                </Link>
              </div>
            </div>

            <Link href="/cart" className="block">
              <Button variant="outline" className="w-full h-9 sm:h-10 text-sm sm:text-base">
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                {dir === 'rtl' ? 'العودة للعربة' : 'Back to Cart'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const cart = await getCartFull(user.id)
  const couponsResult = await getAllCoupons()
  if (!cart || cart.data?.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{dir === 'rtl' ? 'لا يوجد منتجات في السلة' : 'No products in cart'}</p>
      </div>
    )
  }

  // Define the database cart item type




  // Map NextAuth user to application User type
  const appUser = {
    id: user.id!, // TypeScript knows this exists due to the guard above
    email: user.email,
    username: user.username ?? null,
    role: user.role ?? "viewer",
    image: user.image ?? null,
  }

  return (
    <CheckoutContent 
      dir={dir} 
      cart={cart} 
      user={appUser}
      couponsDB={couponsResult.data}
      currentCoupon={cart?.success && cart?.data ? cart?.data?.coupon : null}
      cartId={cart?.success && cart.data ? cart.data.id : 0}
    />
  )
}