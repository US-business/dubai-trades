import { getProductsByCategorySlug } from "@/lib/actions/products";
import { cookies } from "next/headers";
import { Metadata } from "next";
import { cache } from "react";
import CategoryHeader from "./_components/CategoryHeader";
import CategoryProducts from "./_components/CategoryProducts";
import CategoryFilterSidebar from "./_components/CategoryFilterSidebar";
import { Home } from "lucide-react";
import Link from "next/link";

// Cached function to avoid duplicate data fetching
const getCachedCategoryProducts = cache(async (
  slug: string,
  options: {
    page?: number;
    limit?: number;
    brands?: string[];
    priceMin?: number;
    priceMax?: number;
    inStock?: boolean;
    onSale?: boolean;
    sortBy?: "newest" | "oldest" | "priceLowHigh" | "priceHighLow";
  }
) => {
  return await getProductsByCategorySlug(slug, options);
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const categorySlug = resolvedParams?.slug;

  if (!categorySlug) {
    return { title: 'Category Not Found' };
  }

  const cookieStore = await cookies();
  const locale = cookieStore.get("preferred-locale")?.value || "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";

  const { data: productInCategory } = await getCachedCategoryProducts(categorySlug, {});

  if (!productInCategory || productInCategory.length === 0) {
    return { title: 'Category Not Found | Dubai-Trades' };
  }

  const categoryName = dir === 'rtl' ? productInCategory[0].category?.nameAr : productInCategory[0].category?.nameEn || 'Category';
  const description = `Browse products in the ${categoryName} category. Find the best deals at Dubai-Trades.`;

  return {
    title: dir === 'rtl' ? ` Dubai-Trades | ${categoryName} ` : `${categoryName} | Dubai-Trades`,
    description: description,
  };
}

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string, lang: string }>,
  searchParams: Promise<{
    page?: string;
    brands?: string;
    priceMin?: string;
    priceMax?: string;
    inStock?: string;
    onSale?: string;
    sortBy?: string;
  }>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const categorySlug = resolvedParams.slug;
  const lang = resolvedParams.lang || 'ar';

  const cookieStore = await cookies();
  const locale = cookieStore.get("preferred-locale")?.value || "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";

  // Parse filter parameters from URL
  const page = parseInt(resolvedSearchParams.page || '1');
  const limit = 12;
  const brands = resolvedSearchParams.brands?.split(',').filter(Boolean) || [];
  const priceMin = resolvedSearchParams.priceMin ? parseFloat(resolvedSearchParams.priceMin) : undefined;
  const priceMax = resolvedSearchParams.priceMax ? parseFloat(resolvedSearchParams.priceMax) : undefined;
  const inStock = resolvedSearchParams.inStock === 'true';
  const onSale = resolvedSearchParams.onSale === 'true';
  const sortBy = (resolvedSearchParams.sortBy as "newest" | "oldest" | "priceLowHigh" | "priceHighLow") || "newest";

  // Fetch products with filters
  const productsRes = await getCachedCategoryProducts(categorySlug, {
    page,
    limit,
    brands,
    priceMin,
    priceMax,
    inStock,
    onSale,
    sortBy
  });

  if (!productsRes.success || !productsRes.data?.length) {
    return (
      <main className="container mx-auto py-8">
        <div className="text-center">
          {dir === 'rtl' ?
            <div className="h-[50dvh] flex flex-col justify-center items-center">
              <h1 className="text-2xl font-bold text-gray-900">المنتجات غير متاحة</h1>
              <Link href={`/${lang}`}>
                <Home className="mx-auto mt-4 text-gray-400" size={48} />
              </Link>
            </div>
            :
            <div className="h-[50dvh] flex flex-col justify-center items-center">
              <h1 className="text-2xl font-bold text-gray-900">Products Not Available</h1>
              <Link href={`/${lang}`}>
                <Home className="mx-auto mt-4 text-gray-400" size={48} />
              </Link>
            </div>
          }
          <p className="mt-2 text-gray-600">
            {dir === 'rtl' ? 'لم يتم العثور على منتجات في هذه الفئة' : 'No products found in this category'}
          </p>
        </div>
      </main>
    );
  }

  // Extract category info
  const categoryInfo = {
    en: productsRes.data[0].category?.nameEn || 'Category',
    ar: productsRes.data[0].category?.nameAr || 'فئة'
  };

  // Extract unique brands from all products (for filter sidebar)
  // Note: We need to get all brands, not just from current page
  // For now, using brands from current results. Ideally, fetch all brands separately.
  const allProductsRes = await getCachedCategoryProducts(categorySlug, { limit: 1000 });
  const availableBrands = [...new Set(
    (allProductsRes.data || [])
      .map((p: any) => p.brand)
      .filter(Boolean)
  )] as string[];

  // Current filters state
  const currentFilters = {
    brands,
    priceRange: [priceMin || 0, priceMax || 100000] as [number, number],
    inStock,
    onSale
  };

  return (
    <main className="container mx-auto px-4 py-6">
      {/* Category Header */}
      <CategoryHeader
        categoryName={categoryInfo}
        dir={dir}
        totalProducts={productsRes.total || 0}
      />

      <div className="mt-8 flex flex-col lg:flex-row gap-6">
        {/* Filter Sidebar */}
        <CategoryFilterSidebar
          availableBrands={availableBrands}
          currentFilters={currentFilters}
          dir={dir}
          maxPrice={100000}
        />

        {/* Products Grid */}
        <CategoryProducts
          products={productsRes.data}
          total={productsRes.total || 0}
          currentPage={page}
          limit={limit}
          currentSort={sortBy}
          lang={lang}
          dir={dir}
        />
      </div>
    </main>
  );
}
