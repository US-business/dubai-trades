import { type CartItem } from "@/lib/stores/cart-store"
import { type Coupon } from '@/lib/stores/coupons-store'
import * as UserProps from "@/types/user"

export type CheckoutItem = {
    id: number
    productId: number
    name: string
    nameAr: string
    price: number
    quantity: number
    image: string
}

export type CartResponse = {
    success: boolean;
    data: {
        items: CartItem[];
        coupon?: any;
    } | null;
};

export type Dir = 'rtl' | 'ltr';

export type ShippingMethodType = 'contact' | 'express';

export interface CheckoutContentProps {
    dir: Dir;
    cart: any | null;
    user: UserProps.User | null;
    couponsDB?: Coupon[];
    currentCoupon?: Coupon | null;
    cartId: number;
}

export interface ContactInformationProps {
    dir: Dir;
}

export interface ShippingAddressProps {
    dir: Dir;
}

export interface ShippingMethodProps {
    dir: Dir;
    shippingMethod: ShippingMethodType;
    onShippingMethodChange: (value: ShippingMethodType) => void;
}

export interface PaymentMethodProps {
    dir: Dir;
}

export interface OrderSummaryProps {
    dir: Dir;
    items: CartItem[];
    subtotal: number;
    couponDiscount: number;
    appliedCoupon: any;
    shipping: number;
    shippingMethod: ShippingMethodType;
    total: number;
}
