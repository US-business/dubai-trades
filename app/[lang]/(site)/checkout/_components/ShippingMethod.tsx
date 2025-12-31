import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcnUI/card'
import { RadioGroup, RadioGroupItem } from '@/components/shadcnUI/radio-group'
import { Badge } from '@/components/shadcnUI/badge'
import { Truck, Zap } from 'lucide-react'
import { type ShippingMethodProps } from './types'

export function ShippingMethod({ dir, shippingMethod, onShippingMethodChange }: ShippingMethodProps) {
    return (
        <Card>
            <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs sm:text-sm font-medium">3</span>
                    </div>
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    {dir === 'rtl' ? 'طريقة التوصيل' : 'Shipping Method'}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                    {dir === 'rtl' ? 'اختر طريقة التوصيل المناسبة' : 'Choose your preferred shipping method'}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <RadioGroup
                    value={shippingMethod}
                    onValueChange={onShippingMethodChange}
                    className="space-y-3 sm:space-y-4"
                >
                    <div className="flex items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="contact" id="contact-shipping" className="mt-1 sm:mt-0" />
                        <label htmlFor="contact-shipping" className="flex-1 cursor-pointer">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                                        <span className="font-medium text-sm sm:text-base">
                                            {dir === 'rtl' ? 'التواصل مع العميل وتحديد تكلفة الشحن' : 'Contact customer to set shipping cost'}
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-500">
                                        {dir === 'rtl' ? 'سيتم تحديد المدة والتكلفة بعد التواصل' : 'Time and cost determined after contact'}
                                    </p>
                                </div>
                                <Badge variant="secondary" className="text-[10px] sm:text-xs w-fit">
                                    {dir === 'rtl' ? 'لاحقًا' : 'TBD'}
                                </Badge>
                            </div>
                        </label>
                    </div>
                    <div className="flex items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="express" id="express-shipping" className="mt-1 sm:mt-0" />
                        <label htmlFor="express-shipping" className="flex-1 cursor-pointer">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
                                        <span className="font-medium text-sm sm:text-base">
                                            {dir === 'rtl' ? 'توصيل سريع' : 'Express Shipping'}
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-500">
                                        {dir === 'rtl' ? '1-2 أيام عمل' : '1-2 business days'}
                                    </p>
                                </div>
                                <Badge variant="outline" className="font-semibold text-[10px] sm:text-xs w-fit">
                                    200 {dir === 'rtl' ? 'ج.م' : 'EGP'}
                                </Badge>
                            </div>
                        </label>
                    </div>
                </RadioGroup>
            </CardContent>
        </Card>
    )
}
