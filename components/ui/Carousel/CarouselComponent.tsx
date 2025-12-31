import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/shadcnUI/carousel"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/shadcnUI/button"
import { Badge } from "@/components/shadcnUI/badge"
import { Card, CardHeader, CardTitle } from "../../shadcnUI/card"
import { cn } from "@/lib/utils"
import ProductCard from "@/components/shared/ProductCard/ProductCard"
interface CategoryProductSliderProps {
  items: any[] | undefined;
  dir: string;
  lang?: string;
  className?: string;
}

const CarouselComponent = ({ dir = 'ltr', lang = 'en', items, className }: CategoryProductSliderProps) => {


  if (!items || items.length === 0) {
    return null
  }

  // إنشاء كروت وهمية إذا كان عدد المنتجات أقل من 6
  const minItems = 6;
  const displayItems = [...items];

  if (items.length < minItems) {
    const placeholdersNeeded = minItems - items.length;
    for (let i = 0; i < placeholdersNeeded; i++) {
      displayItems.push({
        id: `placeholder-${i}`,
        isPlaceholder: true,
      });
    }
  }
  return (
    <Card className={className ? className : `mt-6 overflow-visible relative bg-transparent gap-2 border-0 ${className}`}>
      <CardHeader className="text-md font-bold flex items-center justify-between w-full bg-white p-1 px-3 rounded-md shadow-md">
        <CardTitle>
          {dir === "rtl" ? items[0].category.nameAr : items[0].category.nameEn}
        </CardTitle>
        <Link
          href={`/category/${items[0].category.slug}`}
          className="text-sm text-amber-600 hover:text-amber-700 px-3 py-1 rounded-md transition-2"
        >
          {dir === "rtl" ? "عرض الكل" : "View All"}
        </Link>
      </CardHeader>
      <Carousel
        opts={{
          align: "start",
          loop: true,
          dragFree: true,
          direction: dir === "rtl" ? "rtl" : "ltr",
        }}

      >
        <CarouselContent >
          {displayItems?.map((item: any) => (
            <CarouselItem key={item.id} className="basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 p-3">
              {item.isPlaceholder ? (
                <PlaceholderCard />
              ) : (
                <ProductCard product={item} dir={dir} lang={lang} hiddenButtonCart className="shadow-md" />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex absolute left-[-1rem] top-1/2 -translate-y-1/2 bg-white shadow-md hover:bg-gray-100" />
        <CarouselNext className="hidden md:flex absolute right-[-1rem] top-1/2 -translate-y-1/2 bg-white shadow-md hover:bg-gray-100" />
      </Carousel>
    </Card>
  )
}

// مكون الكارت الوهمي
const PlaceholderCard = () => {
  return (
    <Card className="relative w-full h-full flex flex-col overflow-hidden rounded-lg border bg-gray-50">
      <div className="relative h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-gray-400 text-center">
          <svg xmlns="http://www.w3.org/2000/svg"
            className="w-20 h-20 mx-auto mb-2 opacity-30"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <path d="m15 11-1 9" />
            <path d="m19 11-4-7" />
            <path d="M2 11h20" />
            <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4" />
            <path d="M4.5 15.5h15" />
            <path d="m5 11 4-7" />
            <path d="m9 11 1 9" />
          </svg>
          <p className="text-xs font-medium">Loading...</p>
        </div>
      </div>

      <div className="p-4 space-y-3 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-3/4"></div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 text-gray-300" />
            ))}
          </div>
          <div className="h-4 bg-gray-300 rounded w-12"></div>
        </div>

        <div className="space-y-2">
          <div className="h-6 bg-gray-300 rounded w-24"></div>
          <div className="h-4 bg-gray-300 rounded w-20"></div>
        </div>
      </div>
    </Card>
  )
}

export default CarouselComponent





// //////////////////////////////////////////////// 





const ItemCard = ({ item }: { item: any }) => {
  // const hasDiscount  = product?.discountType !== 'none' && product?.discountValue && product?.discountValue > 0 as boolean

  const price = Number(item?.price) || 0;
  const discountValue = Number(item?.discountValue) || 0;

  const hasDiscount: boolean =
    item?.discountType !== "none" && discountValue > 0;

  const discountedPrice: number = hasDiscount
    ? price - (item.discountType === "fixed"
      ? discountValue
      : (price * discountValue) / 100)
    : price;

  return (
    <Card className="group relative w-full h-full flex flex-col justify-between overflow-hidden rounded-lg border transition-all hover:shadow-md select-none">
      <Link href={`/products/${item.slug}`} className="relative flex h-30 w-full ">
        <Image
          src={item.image || "/placeholder-dummy.jpg"}
          alt={item.nameEn}
          fill
          className="object-contain h-full w-full transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="relative w-full flex flex-col  gap-1">
        <h3 className="truncate text-lg font-semibold">
          <Link href={`/products/${item.slug}`}>{item.nameEn}</Link>
        </h3>

        <div className="flex items-center gap-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">(120)</span>
        </div>

        <div className=" flex flex-col items-baseline">
          <p className="text-xl font-bold text-primary">
            <span className="text-sm text-gray-500">LE </span>
            {discountedPrice?.toFixed(2)}
          </p>
          {hasDiscount && (
            <p className="text-sm text-gray-500 line-through">
              LE {price?.toFixed(2)}
            </p>
          )}
        </div>

      </div>
      <div className={cn(`absolute left-2 top-2 flex flex-col items-end gap-2`)}>
        {hasDiscount && (
          <Badge className="rounded-md px-3 py-1 text-sm font-semibold bg-amber-200/50 text-amber-600">
            -{discountValue}%
          </Badge>
        )}
        <Button variant="outline" size="icon" className="bg-amber-200/50 text-amber-500 border-0 hover:bg-amber-200/70 hover:text-amber-600">
          <Heart className="h-4 w-4" />
        </Button>
      </div>
      {item.status && (
        <Badge className="absolute right-2 top-2 rounded-md px-3 py-1 text-sm font-semibold bg-green-200/50 text-green-600">
          {item.status}
        </Badge>
      )}
    </Card>
  )
}

