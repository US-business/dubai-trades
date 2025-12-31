import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcnUI/card'
import { RadioGroup, RadioGroupItem } from '@/components/shadcnUI/radio-group'
import { CreditCard } from 'lucide-react'
import { type PaymentMethodProps } from './types'

export function PaymentMethod({ dir }: PaymentMethodProps) {
    return (
        <Card>
            <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs sm:text-sm font-medium">4</span>
                    </div>
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    {dir === 'rtl' ? 'طريقة الدفع' : 'Payment Method'}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                    {dir === 'rtl' ? 'اختر طريقة الدفع المفضلة' : 'Choose your preferred payment method'}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <RadioGroup defaultValue="cash" className="space-y-3 sm:space-y-4">
                    <div className="flex items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="cash" id="cash-payment" className="mt-1 sm:mt-0" />
                        <input type="hidden" name="paymentMethod" value="cash" />
                        <label htmlFor="cash-payment" className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-1">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-green-600 text-base sm:text-lg font-bold">$</span>
                            </div>
                            <div>
                                <div className="font-medium text-sm sm:text-base">
                                    {dir === 'rtl' ? 'الدفع عند الاستلام' : 'Cash on delivery'}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500">
                                    {dir === 'rtl' ? 'ادفع عند وصول الطلب' : 'Pay when your order arrives'}
                                </div>
                            </div>
                        </label>
                    </div>
                    <div className="flex items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors opacity-50">
                        <RadioGroupItem value="card" id="card-payment" disabled className="mt-1 sm:mt-0" />
                        <label htmlFor="card-payment" className="flex items-center gap-2 sm:gap-3 cursor-not-allowed flex-1">
                            <CreditCard className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 flex-shrink-0" />
                            <div>
                                <div className="font-medium text-sm sm:text-base">
                                    {dir === 'rtl' ? 'بطاقة ائتمانية / خصم مباشر' : 'Credit / Debit card'}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500">
                                    {dir === 'rtl' ? 'قريبًا' : 'Coming soon'}
                                </div>
                            </div>
                        </label>
                    </div>
                </RadioGroup>
            </CardContent>
        </Card>
    )
}
