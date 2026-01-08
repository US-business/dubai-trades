'use client';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/shadcnUI/breadcrumb";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryHeaderProps {
    categoryName: {
        en: string;
        ar: string;
    };
    dir: 'rtl' | 'ltr';
    totalProducts: number;
}

export default function CategoryHeader({ categoryName, dir, totalProducts }: CategoryHeaderProps) {
    const displayName = dir === 'rtl' ? categoryName.ar : categoryName.en;

    return (
        <div className="space-y-4">
            {/* Breadcrumbs */}
            <Breadcrumb className="bg-white rounded-lg py-2 px-4 shadow-sm">
                <BreadcrumbList className="flex items-center justify-center" role="list">
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">
                            <Home className="h-4 w-4" />
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className={cn(dir === "rtl" ? "rotate-180" : "")} />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{displayName}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Category Title */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayName}</h1>
                <p className="text-gray-600">
                    {dir === 'rtl' ? `${totalProducts} منتج` : `${totalProducts} products`}
                </p>
            </div>
        </div>
    );
}
