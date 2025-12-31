"use client"

import Link from 'next/link';
import { Button } from "@/components/shadcnUI/button";
import { Eye, ShoppingCart } from 'lucide-react';
import WishlistButton from '@/components/ui/WishlistButton';
import { useAuthStore } from '@/lib/stores';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductProps } from '@/types/product';

interface ProductActionsProps {
    product: ProductProps;
    dir?: 'ltr' | 'rtl';
    lang?: string;
}

export function ProductActions({ product, dir = 'ltr', lang = 'en' }: ProductActionsProps) {
    const { user } = useAuthStore();
    const { addItem } = useCart();
    const { toast } = useToast();
    const [isAdding, setIsAdding] = useState(false);
    const router = useRouter();

    const handleAddToCart = async () => {
        if (!product?.id) {
            return;
        }

        setIsAdding(true);
        try {
            // 🎯 استخدام useCart hook الموحد - يتعامل مع الزوار والمستخدمين تلقائياً
            await addItem({
                productId: Number(product.id),
                quantity: 1,
                coupon: {
                    id: 0,
                    code: "",
                    discountType: 'none',
                    discountValue: "0"
                },
                product: {
                    id: Number(product.id),
                    nameEn: product.nameEn,
                    nameAr: product.nameAr,
                    price: String(product.price ?? 0),
                    images: product.images ?? [],
                    quantityInStock: Number(product.quantityInStock ?? 0),
                    discountType: (product.discountType ?? 'none') as 'fixed' | 'percentage' | 'none',
                    discountValue: product.discountValue != null ? String(product.discountValue) : null
                }
            });
            
            // ✅ الـ hook يتعامل مع Toast تلقائياً
        } catch (error) {
            // ✅ الخطأ تم التعامل معه في الـ hook
            console.error('Error adding to cart:', error);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="flex items-center gap-2 sm:gap-3 pt-2 animate-in fade-in slide-in-from-bottom-8 duration-1300">
            <Button
                asChild
                size="default"
                className="flex-1 text-xs sm:text-sm text-amber-800 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-9 sm:h-10 md:h-11"
                aria-label={dir === 'rtl' ? 'عرض تفاصيل المنتج' : 'View product details'}
            >
                <Link href={`/products/${product.id}`} className="flex items-center gap-1.5 sm:gap-2"> 
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-semibold">
                        {dir === 'rtl' ? 'عرض المنتج' : 'View Details'}
                    </span>
                </Link>
            </Button>

            {product.quantityInStock && product.quantityInStock > 0 ? (
                <>
                    <Button
                        size="default"
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-700 border-2 border-amber-300 hover:border-amber-400 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={dir === 'rtl' ? 'أضف إلى السلة' : 'Add to cart'}
                    >
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                    <WishlistButton
                        productId={Number(product.id)}
                        dir={dir}
                        lang={lang}
                        className="border-2 transition-all duration-300 hover:scale-105 h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11"
                        product={{
                            id: Number(product.id),
                            nameEn: product.nameEn,
                            nameAr: product.nameAr,
                            price: String(product.price ?? 0),
                            images: product.images ?? [],
                            quantityInStock: Number(product.quantityInStock ?? 0),
                            discountType: (product.discountType ?? 'none') as 'fixed' | 'percentage' | 'none',
                            discountValue: product.discountValue != null ? String(product.discountValue) : null
                        }}
                    />
                </>
            ) : (
                <Button
                    disabled
                    size="default"
                    className="bg-gray-300 text-gray-500 shadow-lg cursor-not-allowed opacity-60 h-9 sm:h-10 md:h-11 text-xs sm:text-sm"
                    aria-label={dir === 'rtl' ? 'غير متوفر' : 'Out of stock'}
                >
                    {dir === 'rtl' ? 'غير متوفر' : 'Out of stock'}
                </Button>
            )}
        </div>
    );
}