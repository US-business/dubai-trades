/**
 * Pricing Utilities - Single Source of Truth for Cart Calculations
 * Created: 2025-11-07
 */

export interface Product {
  price: string | number | null
  discountType: 'fixed' | 'percentage' | 'none'
  discountValue: string | number | null
}

export interface Coupon {
  discountType: 'fixed' | 'percentage' | 'none'
  discountValue: string | number | null
  isActive: boolean | null
}

/**
 * Convert any value to number safely
 */
export function toNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

/**
 * Calculate final price for a product after applying its discount
 */
export function calculateProductPrice(product: Product): number {
  let price = toNumber(product.price)
  const discountValue = toNumber(product.discountValue || 0)

  if (product.discountType === 'percentage') {
    price = price - (price * discountValue) / 100
  } else if (product.discountType === 'fixed') {
    price = Math.max(price - discountValue, 0) // Never negative
  }

  return price
}

/**
 * Calculate total price for cart items (with product discounts)
 */
export function calculateItemsTotal(
  items: Array<{ product: Product; quantity: number }>
): number {
  return items.reduce((total, item) => {
    const itemPrice = calculateProductPrice(item.product)
    return total + (itemPrice * item.quantity)
  }, 0)
}

/**
 * Calculate coupon discount amount
 */
export function calculateCouponDiscount(
  subtotal: number,
  coupon: Coupon | null | undefined
): number {
  if (!coupon || !coupon.isActive) return 0

  const couponValue = toNumber(coupon.discountValue || 0)

  if (coupon.discountType === 'percentage') {
    return (subtotal * couponValue) / 100
  } else if (coupon.discountType === 'fixed') {
    return Math.min(couponValue, subtotal) // Don't exceed subtotal
  }

  return 0
}

/**
 * Calculate final total with coupon applied
 */
export function calculateCartTotal(
  items: Array<{ product: Product; quantity: number }>,
  coupon?: Coupon | null
): { subtotal: number; discount: number; total: number } {
  const subtotal = calculateItemsTotal(items)
  const discount = calculateCouponDiscount(subtotal, coupon)
  const total = Math.max(subtotal - discount, 0) // Never negative

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  }
}

/**
 * Validate quantity
 */
export function validateQuantity(
  quantity: number,
  maxStock: number = 1000
): { valid: boolean; error?: string } {
  if (quantity <= 0) {
    return { valid: false, error: "Quantity must be positive" }
  }
  if (quantity > maxStock) {
    return { valid: false, error: `Only ${maxStock} items available in stock` }
  }
  if (!Number.isInteger(quantity)) {
    return { valid: false, error: "Quantity must be a whole number" }
  }
  return { valid: true }
}
