"use client"
import React from 'react'
import { cn } from "@/lib/utils"
import Image from 'next/image'
import { ProductProps } from '@/types/product'
import {
    Dialog,
    DialogContent,
    DialogClose,
} from "@/components/shadcnUI/dialog"
import { X, ZoomIn } from "lucide-react"
import { Button } from "@/components/shadcnUI/button"

const ImageItemWithModal = ({ product, dir }: { product: ProductProps, dir: string }) => {

    const [selectedImage, setSelectedImage] = React.useState(0);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const productImages = product.images;
    if (!productImages || productImages.length === 0) return null;

    const handleClickImage = (index: number) => {
        setSelectedImage(index);
    }

    const handleOpenModal = () => {
        setIsModalOpen(true);
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
    }

    return (
        <>
            {/* Product Images */}
            <div className="space-y-4 flex flex-col sm:flex-row h-[55dvh]">
                {productImages.length > 1 && (
                    <div className="flex flex-row sm:flex-col items-start gap-3 p-2 overflow-x-auto sm:overflow-y-auto">
                        {productImages.map((image, index) => (
                            <button
                                title={dir === 'rtl' ? 'انقر لاختيار هذه الصورة' : 'Click to select this image'}
                                key={index}
                                onClick={() => handleClickImage(index)}
                                className={cn(
                                    "relative flex-shrink-0 aspect-square w-20 h-20 sm:w-24 sm:h-24 overflow-hidden rounded-lg border-2 transition-all hover:border-primary/50 cursor-pointer hover:scale-105",
                                    selectedImage === index ? "border-primary ring-2 ring-primary/30" : "border-gray-200",
                                )}
                            >
                                <Image
                                    src={image || "/placeholder.svg"}
                                    alt={`${dir === "rtl" ? product.nameAr : product.nameEn} ${index + 1}`}
                                    className="object-cover transition-transform"
                                    fill
                                    sizes='100px'
                                    loading="lazy"
                                />
                            </button>
                        ))}
                    </div>
                )}
                <div className="relative flex-1 aspect-square w-full h-full overflow-hidden rounded-lg bg-gray-50 border border-gray-200 group">
                    {/* Main Image - Clickable */}
                    <button
                        onClick={handleOpenModal}
                        className="w-full h-full relative cursor-zoom-in"
                        title={dir === 'rtl' ? 'انقر للتكبير' : 'Click to zoom'}
                    >
                        <Image
                            src={productImages[selectedImage] || "/placeholder.svg?height=600&width=600&text=Product"}
                            alt={dir === "rtl" ? product.nameAr : product.nameEn}
                            className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                            width={600}
                            height={600}
                            priority={selectedImage === 0}
                            loading={selectedImage === 0 ? "eager" : "lazy"}
                        />

                        {/* Zoom Overlay Hint */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3 shadow-lg">
                                <ZoomIn className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Modal for Large Image */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent
                    className="max-w-[95vw] max-h-[95vh] w-[100%] h-[90%] p-0 overflow-hidden bg-slate-50 border-0"
                    dir={dir}
                >
                    {/* Close Button */}
                    {/* <DialogClose asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "absolute top-4 z-50 bg-white/90 hover:bg-white rounded-full shadow-lg",
                                dir === 'rtl' ? 'left-4' : 'right-4'
                            )}
                            onClick={handleCloseModal}
                        >
                            <X className="h-5 w-5 text-gray-900" />
                        </Button>
                    </DialogClose> */}

                    {/* Large Image */}
                    <div className="relative w-full h-full min-h-[300px] max-h-[90vh] flex items-center justify-center p-4">
                        <Image
                            src={productImages[selectedImage] || "/placeholder.svg"}
                            alt={dir === "rtl" ? product.nameAr : product.nameEn}
                            className="object-cover w-[150%] h-auto max-w-full max-h-full rounded-lg"
                            width={1200}
                            height={1200}
                            priority
                            quality={100}
                        />
                    </div>

                    {/* Image Counter */}
                    {productImages.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 rounded-full shadow-lg">
                            <p className="text-sm font-medium text-gray-900">
                                {selectedImage + 1} / {productImages.length}
                            </p>
                        </div>
                    )}

                    {/* Navigation Arrows (if multiple images) */}
                    {productImages.length > 1 && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "absolute top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full shadow-lg z-50",
                                    dir === 'rtl' ? 'right-4' : 'left-4'
                                )}
                                onClick={() => setSelectedImage((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))}
                            >
                                <span className="text-2xl">‹</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "absolute top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full shadow-lg z-50",
                                    dir === 'rtl' ? 'left-4' : 'right-4'
                                )}
                                onClick={() => setSelectedImage((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))}
                            >
                                <span className="text-2xl">›</span>
                            </Button>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ImageItemWithModal
