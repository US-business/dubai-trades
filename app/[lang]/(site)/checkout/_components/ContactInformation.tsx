import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcnUI/card'
import { Input } from '@/components/shadcnUI/input'
import { Label } from '@/components/shadcnUI/label'
import { Mail, Phone } from 'lucide-react'
import { type ContactInformationProps } from './types'

export function ContactInformation({ dir }: ContactInformationProps) {
    return (
        <Card>
            <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs sm:text-sm font-medium">1</span>
                    </div>
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    {dir === 'rtl' ? 'معلومات التواصل' : 'Contact Information'}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                    {dir === 'rtl' ? 'أدخل بياناتك للتواصل معك' : 'Enter your contact details'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <Label htmlFor="email" className="flex items-center gap-2 text-xs sm:text-sm">
                            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {dir === 'rtl' ? 'البريد الإلكتروني *' : 'Email *'}
                        </Label>
                        <Input
                            type="email"
                            name="email"
                            id="email"
                            required
                            placeholder={dir === 'rtl' ? 'example@email.com' : 'example@email.com'}
                            className="mt-1 h-10 sm:h-11 text-sm sm:text-base"
                        />
                    </div>
                    <div>
                        <Label htmlFor="phone" className="flex items-center gap-2 text-xs sm:text-sm">
                            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {dir === 'rtl' ? 'رقم الهاتف *' : 'Phone *'}
                        </Label>
                        <Input
                            type="tel"
                            name="phone"
                            id="phone"
                            required
                            placeholder={dir === 'rtl' ? '+20 1234567890' : '+20 1234567890'}
                            className="mt-1 h-10 sm:h-11 text-sm sm:text-base"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
