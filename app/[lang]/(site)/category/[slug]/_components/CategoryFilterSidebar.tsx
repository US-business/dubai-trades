'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/shadcnUI/button';
import { ScrollArea } from '@/components/shadcnUI/scroll-area';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/shadcnUI/sheet';
import { SlidersIcon, X } from 'lucide-react';
import { Checkbox } from '@/components/shadcnUI/checkbox';
import { Label } from '@/components/shadcnUI/label';
import { Slider } from '@/components/shadcnUI/slider';

interface CategoryFilterSidebarProps {
    availableBrands: string[];
    currentFilters: {
        brands: string[];
        priceRange: [number, number];
        inStock: boolean;
        onSale: boolean;
    };
    dir: 'rtl' | 'ltr';
    maxPrice?: number;
}

export default function CategoryFilterSidebar({
    availableBrands,
    currentFilters,
    dir,
    maxPrice = 100000
}: CategoryFilterSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);

    // Local state for price range (for smooth slider)
    const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(currentFilters.priceRange);

    // دالة تحديث الفلاتر في URL
    const updateFilters = (key: string, value: any) => {
        const params = new URLSearchParams(searchParams.toString());

        if (key === 'brands') {
            // Toggle brand in array
            const currentBrands = params.get('brands')?.split(',').filter(Boolean) || [];
            const brandIndex = currentBrands.indexOf(value);

            if (brandIndex > -1) {
                currentBrands.splice(brandIndex, 1);
            } else {
                currentBrands.push(value);
            }

            if (currentBrands.length > 0) {
                params.set('brands', currentBrands.join(','));
            } else {
                params.delete('brands');
            }
        } else if (key === 'priceRange') {
            const [min, max] = value as [number, number];
            if (min > 0) params.set('priceMin', min.toString());
            else params.delete('priceMin');

            if (max < maxPrice) params.set('priceMax', max.toString());
            else params.delete('priceMax');
        } else if (key === 'inStock' || key === 'onSale') {
            if (value) {
                params.set(key, 'true');
            } else {
                params.delete(key);
            }
        }

        // إعادة تعيين الصفحة عند تغيير الفلاتر
        params.delete('page');

        router.push(`${pathname}?${params.toString()}`);
    };

    // دالة مسح كل الفلاتر
    const clearAllFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('brands');
        params.delete('priceMin');
        params.delete('priceMax');
        params.delete('inStock');
        params.delete('onSale');
        params.delete('page');

        router.push(`${pathname}?${params.toString()}`);
        setLocalPriceRange([0, maxPrice]);
    };

    // محتوى الفلاتر (مشترك بين Desktop و Mobile)
    const FilterContent = () => (
        <div className="space-y-6">
            {/* Header with Clear Button */}
            <div className="flex items-center justify-between pb-4 border-b">
                <h3 className="text-lg font-semibold">
                    {dir === 'rtl' ? 'الفلاتر' : 'Filters'}
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-blue-600 hover:text-blue-700"
                >
                    {dir === 'rtl' ? 'مسح الكل' : 'Clear All'}
                </Button>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">
                    {dir === 'rtl' ? 'نطاق السعر' : 'Price Range'}
                </Label>
                <div className="px-2">
                    <Slider
                        min={0}
                        max={maxPrice}
                        step={100}
                        value={localPriceRange}
                        onValueChange={(value: number[]) => setLocalPriceRange(value as [number, number])}
                        onValueCommit={(value: number[]) => updateFilters('priceRange', value)}
                        className="w-full"
                    />
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                        <span>{localPriceRange[0]} {dir === 'rtl' ? 'د.إ' : 'AED'}</span>
                        <span>{localPriceRange[1]} {dir === 'rtl' ? 'د.إ' : 'AED'}</span>
                    </div>
                </div>
            </div>

            {/* Brands Filter */}
            {availableBrands.length > 0 && (
                <div className="space-y-3">
                    <Label className="text-sm font-medium">
                        {dir === 'rtl' ? 'العلامات التجارية' : 'Brands'}
                    </Label>
                    <ScrollArea className="h-48 px-2">
                        <div className="space-y-2">
                            {availableBrands.map((brand) => (
                                <div key={brand} className="flex items-center space-x-2 rtl:space-x-reverse">
                                    <Checkbox
                                        id={`brand-${brand}`}
                                        checked={currentFilters.brands.includes(brand)}
                                        onCheckedChange={() => updateFilters('brands', brand)}
                                    />
                                    <Label
                                        htmlFor={`brand-${brand}`}
                                        className="text-sm font-normal cursor-pointer"
                                    >
                                        {brand}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}

            {/* Stock Status */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">
                    {dir === 'rtl' ? 'حالة المخزون' : 'Stock Status'}
                </Label>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox
                            id="inStock"
                            checked={currentFilters.inStock}
                            onCheckedChange={(checked) => updateFilters('inStock', checked)}
                        />
                        <Label htmlFor="inStock" className="text-sm font-normal cursor-pointer">
                            {dir === 'rtl' ? 'متوفر في المخزون' : 'In Stock'}
                        </Label>
                    </div>
                </div>
            </div>

            {/* Sale Status */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">
                    {dir === 'rtl' ? 'العروض' : 'Special Offers'}
                </Label>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox
                            id="onSale"
                            checked={currentFilters.onSale}
                            onCheckedChange={(checked) => updateFilters('onSale', checked)}
                        />
                        <Label htmlFor="onSale" className="text-sm font-normal cursor-pointer">
                            {dir === 'rtl' ? 'المنتجات المخفضة' : 'On Sale'}
                        </Label>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Filter Button */}
            <div className="lg:hidden w-full flex justify-end mb-3 sm:mb-4">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 py-2">
                            <SlidersIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">{dir === 'rtl' ? 'الفلتر' : 'Filter'}</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side={dir === 'rtl' ? 'right' : 'left'}
                        className="w-[300px] sm:w-[350px]"
                    >
                        <SheetHeader>
                            <SheetTitle>{dir === 'rtl' ? 'الفلاتر' : 'Filters'}</SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="h-[calc(100vh-80px)] mt-4 px-1">
                            <FilterContent />
                        </ScrollArea>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="bg-white rounded-lg p-4 shadow-sm sticky top-4">
                    <FilterContent />
                </div>
            </aside>
        </>
    );
}
