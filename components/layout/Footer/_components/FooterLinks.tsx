"use client"

import Link from "next/link"
import { Phone, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCompanyName, getCompanyAddress, getAllPhones } from "@/lib/config/company-info"

type LinkItem = {
  name: string
  href: string
  external?: boolean
}

interface FooterLinksProps {
  quickLinks: LinkItem[]
  customerService: LinkItem[]
  dir: string
  className?: string
}

export function FooterLinks({ quickLinks, customerService, dir, className = '' }: FooterLinksProps) {
  const phones = getAllPhones()
  
  return (
    <>
      {/* Quick Links */}
      <div className={cn( className)}>
        <h3 className="text-lg font-semibold text-white mb-6">
          {dir === 'rtl' ? "روابط سريعة" : "Quick Links"}
        </h3>
        <ul className="space-y-3">
          {quickLinks.map((link, index) => (
            <li key={index}>
              <Link
                href={link.href}
                className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center gap-2"
              >
                <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Customer Service */}
      <div className={cn("")}>
        <h3 className="text-lg font-semibold text-white mb-6">
          {dir === 'rtl' ? "خدمة العملاء" : "Customer Service"}
        </h3>
        <ul className="space-y-3">
          {customerService.map((link, index) => (
            <li key={index}>
              <Link
                href={link.href}
                className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center gap-2"
              >
                <span className="w-1 h-1 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Contact Info */}
        <div className="mt-8 space-y-3">
          {/* Company Name */}
          <div className="text-slate-200 text-sm font-medium">
            {getCompanyName(dir as "ltr" | "rtl")}
          </div>
          {/* Phones */}
          {phones.map((phone, index) => (
            <div key={index} className={cn(
              "flex items-center gap-3 text-slate-400","flex-row"
            )}>
              <Phone className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{phone}</span>
            </div>
          ))}
          <div className={cn(
            "flex items-center gap-3 text-slate-400","flex-row"
          )}>
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <span>
              {getCompanyAddress(dir as "ltr" | "rtl")}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

export default FooterLinks
