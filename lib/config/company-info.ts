/**
 * Company Information Configuration
 * This file contains all real company data to be used across the application
 * Update this file to change company information globally
 */

export const companyInfo = {
  // Company Names
  nameEn: "Dubai for Import, Export, and Commercial Agencies",
  nameAr: "دبي للاستيراد والتصدير والتوكيلات التجارية",
  
  // Short Names (for branding)
  shortNameEn: "Dubai Trades",
  shortNameAr: "تجارة دبي",
  
  // Contact Information
  phones: [
    "0123414243",
    "01557777139"
  ],
  
  // Address
  addressEn: "Shebin El-Kom, 21 Al-Amin Street",
  addressAr: "شبين الكوم، 21 شارع الأمين",
  
  // Social Media Links (update with real URLs)
  socialMedia: {
    facebook: "https://facebook.com/your-page", // Update with real URL
    twitter: "https://twitter.com/your-handle", // Update with real URL
    instagram: "https://instagram.com/your-handle", // Update with real URL
    youtube: "https://youtube.com/your-channel", // Update with real URL
    linkedin: "https://linkedin.com/company/your-company" // Update with real URL
  },
  
  // Email Information
  email: {
    support: "support@yourdomain.com", // Update with real email
    info: "info@yourdomain.com", // Update with real email
    sales: "sales@yourdomain.com" // Update with real email
  },
  
  // Copyright
  copyrightYear: new Date().getFullYear(),
  
  // Payment Methods
  paymentMethods: ["VISA", "MC", "AMEX", "PP"],
  
  // Company Stats (update as needed)
  stats: {
    happyCustomers: "50K+",
    productsSold: "10K+",
    avgRating: "4.9★"
  }
}

/**
 * Helper function to get company name based on direction
 */
export function getCompanyName(dir: "ltr" | "rtl" = "ltr") {
  return dir === "rtl" ? companyInfo.nameAr : companyInfo.nameEn
}

/**
 * Helper function to get company address based on direction
 */
export function getCompanyAddress(dir: "ltr" | "rtl" = "ltr") {
  return dir === "rtl" ? companyInfo.addressAr : companyInfo.addressEn
}

/**
 * Helper function to get first phone number
 */
export function getPrimaryPhone() {
  return companyInfo.phones[0]
}

/**
 * Helper function to get all phone numbers
 */
export function getAllPhones() {
  return companyInfo.phones
}
