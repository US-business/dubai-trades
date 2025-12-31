"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { ChevronRight, Phone, Mail, MapPin } from "lucide-react"
import { getCompanyName, getCompanyAddress, getAllPhones } from "@/lib/config/company-info"

type LinkItem = {
  name: string
  href: string
  external?: boolean
}


interface ContactInfoProps {
  dir: string
  lang?: string
  className?: string
}


export function ContactInfo({ dir, lang = 'en', className = '' }: ContactInfoProps) {
  const phones = getAllPhones()
  
  return (
    <div className={cn( "space-y-4", className)}>
      <h3 className="text-base font-semibold text-foreground pb-2 border-b border-border">
        {dir === 'rtl' ? "اتصل بنا" : "Contact Us"}
      </h3>
      <div className="space-y-3">
        {/* Company Name */}
        <div className={cn(
          "text-foreground text-sm font-medium"
        )}>
          {getCompanyName(dir as "ltr" | "rtl")}
        </div>
        {/* Phones */}
        {phones.map((phone, index) => (
          <div key={index} className={cn(
            "flex items-center gap-3 text-muted-foreground text-sm",
            "flex-row"
          )}>
            <Phone className="w-4 h-4 text-primary flex-shrink-0" />
            <span>{phone}</span>
          </div>
        ))}
        <div className={cn(
          "flex items-start gap-3 text-muted-foreground text-sm",
          "flex-row"
        )}>
          <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <span>
            {getCompanyAddress(dir as "ltr" | "rtl")}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ContactInfo