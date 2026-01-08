'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/shared/ProductCard/ProductCard';
import ReusablePagination from '@/components/shared/ReusablePagination';

interface Product {
    id: number;
    nameEn: string;
    nameAr: string;
    slug: string;
    sku: string;
    price: string;
    images: string[];
    brand: string;
    discountType: "fixed" | "percentage" | "none";
    discountValue: string;
    status: string;
    quantityInStock: number;
    isFeatured: boolean;
    warrantyEn?: string;
    warrantyAr?: string;
    createdAt: Date;
    categoryId?: number;
    category: {
        id: number;
        nameEn: string;
        nameAr: string;
        slug: string;
    };
}

interface CategoryProductsProps {
    products: Product[];
    total: number;
    currentPage: number;
    limit: number;
    currentSort: string;
    lang: string;
    dir: 'rtl' | 'ltr';
}

export default function CategoryProducts({
    products,
    total,
    currentPage,
    limit,
    currentSort,
    lang,
    dir
}: CategoryProductsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const totalPages = Math.ceil(total / limit);

    // دالة تحديث معامل الترتيب
    const handleSortChange = (newSort: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sortBy', newSort);
        params.delete('page'); // إعادة تعيين الصفحة عند تغيير الترتيب
        router.push(`${pathname}?${params.toString()}`);
    };

    // دالة تحديث رقم الصفحة
    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex-1 space-y-4 sm:space-y-6 min-w-0">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                        {dir === 'rtl'
                            ? `عرض ${products.length} من ${total} منتج`
                            : `Showing ${products.length} of ${total} products`
                        }
                    </span>
                </div>

                {/* Sorting Dropdown */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap flex-shrink-0">
                        {dir === 'rtl' ? 'ترتيب:' : 'Sort:'}
                    </span>
                    <select
                        title={dir === 'rtl' ? 'ترتيب' : 'Sort'}
                        value={currentSort}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="text-xs sm:text-sm border rounded px-2 py-1.5 sm:py-1 flex-1 sm:flex-initial min-w-0"
                    >
                        <option value="newest">{dir === 'rtl' ? 'الأحدث' : 'Newest'}</option>
                        <option value="oldest">{dir === 'rtl' ? 'الأقدم' : 'Oldest'}</option>
                        <option value="priceLowHigh">{dir === 'rtl' ? 'السعر: منخفض إلى مرتفع' : 'Price: Low to High'}</option>
                        <option value="priceHighLow">{dir === 'rtl' ? 'السعر: مرتفع إلى منخفض' : 'Price: High to Low'}</option>
                    </select>
                </div>
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product as any} dir={dir} lang={lang} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 sm:py-12 bg-white rounded-lg px-4">
                    <div className="text-gray-400 mb-3 sm:mb-4">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
                        </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 break-words">
                        {dir === 'rtl' ? 'لا توجد منتجات' : 'No products found'}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 break-words">
                        {dir === 'rtl'
                            ? 'جرب تغيير معايير البحث أو الفلاتر'
                            : 'Try adjusting your filters'
                        }
                    </p>
                </div>
            )}

            {/* Pagination */}
            {products.length > 0 && totalPages > 1 && (
                <div className="flex justify-center">
                    <ReusablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        nextLabel={dir === 'rtl' ? 'التالي' : 'Next'}
                        previousLabel={dir === 'rtl' ? 'السابق' : 'Previous'}
                    />
                </div>
            )}
        </div>
    );
}
