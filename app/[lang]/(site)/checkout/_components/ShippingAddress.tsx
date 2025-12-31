import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcnUI/card'
import { Input } from '@/components/shadcnUI/input'
import { Label } from '@/components/shadcnUI/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcnUI/select'
import { MapPin, User, Building } from 'lucide-react'
import { type ShippingAddressProps } from './types'

export function ShippingAddress({ dir }: ShippingAddressProps) {
    return (
        <Card>
            <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs sm:text-sm font-medium">2</span>
                    </div>
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    {dir === 'rtl' ? 'عنوان التوصيل' : 'Shipping Address'}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                    {dir === 'rtl' ? 'أدخل عنوان التوصيل الخاص بك' : 'Enter your delivery address'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="firstName" className="flex items-center gap-2 text-xs sm:text-sm">
                            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {dir === 'rtl' ? 'الاسم الأول *' : 'First name *'}
                        </Label>
                        <Input
                            type="text"
                            name="firstName"
                            id="firstName"
                            required
                            className="mt-1 h-10 sm:h-11 text-sm sm:text-base"
                        />
                    </div>
                    <div>
                        <Label htmlFor="lastName" className="text-xs sm:text-sm">
                            {dir === 'rtl' ? 'الاسم الأخير *' : 'Last name *'}
                        </Label>
                        <Input
                            type="text"
                            name="lastName"
                            id="lastName"
                            required
                            className="mt-1 h-10 sm:h-11 text-sm sm:text-base"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <Label htmlFor="address" className="flex items-center gap-2 text-xs sm:text-sm">
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {dir === 'rtl' ? 'العنوان *' : 'Address *'}
                        </Label>
                        <Input
                            type="text"
                            name="address"
                            id="address"
                            required
                            placeholder={dir === 'rtl' ? 'الشارع والمنطقة' : 'Street and area'}
                            className="mt-1 h-10 sm:h-11 text-sm sm:text-base"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <Label htmlFor="apartment" className="flex items-center gap-2 text-xs sm:text-sm">
                            <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {dir === 'rtl' ? 'الشقة / المكتب (اختياري)' : 'Apartment / Office (optional)'}
                        </Label>
                        <Input
                            type="text"
                            name="apartment"
                            id="apartment"
                            placeholder={dir === 'rtl' ? 'رقم الشقة أو المكتب' : 'Apartment or office number'}
                            className="mt-1 h-10 sm:h-11 text-sm sm:text-base"
                        />
                    </div>
                    <div>
                        <Label htmlFor="city" className="text-xs sm:text-sm">
                            {dir === 'rtl' ? 'المدينة *' : 'City *'}
                        </Label>
                        <Input
                            type="text"
                            name="city"
                            id="city"
                            required
                            className="mt-1 h-10 sm:h-11 text-sm sm:text-base"
                        />
                    </div>
                    <div>
                        <Label htmlFor="governorate" className="text-xs sm:text-sm">
                            {dir === 'rtl' ? 'المحافظة *' : 'Governorate *'}
                        </Label>
                        <Select name="governorate" required>
                            <SelectTrigger className="mt-1 h-10 sm:h-11 text-sm sm:text-base">
                                <SelectValue placeholder={dir === 'rtl' ? 'اختر المحافظة' : 'Choose governorate'} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="القاهرة">القاهرة</SelectItem>
                                <SelectItem value="الإسكندرية">الإسكندرية</SelectItem>
                                <SelectItem value="الجيزة">الجيزة</SelectItem>
                                <SelectItem value="الدقهلية">الدقهلية</SelectItem>
                                <SelectItem value="الشرقية">الشرقية</SelectItem>
                                <SelectItem value="المنوفية">المنوفية</SelectItem>
                                <SelectItem value="القليوبية">القليوبية</SelectItem>
                                <SelectItem value="البحيرة">البحيرة</SelectItem>
                                <SelectItem value="الغربية">الغربية</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="sm:col-span-2">
                        <Label htmlFor="postalCode" className="text-xs sm:text-sm">
                            {dir === 'rtl' ? 'الرمز البريدي (اختياري)' : 'Postal code (optional)'}
                        </Label>
                        <Input
                            type="text"
                            name="postalCode"
                            id="postalCode"
                            className="mt-1 h-10 sm:h-11 text-sm sm:text-base"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
