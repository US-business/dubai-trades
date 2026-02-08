'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface HeroCarouselProps {
  title?: string;
  subtitle?: string;
  images?: string[];
  className?: string;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  images = [
    "https://res.cloudinary.com/dvpp7fsht/image/upload/v1770250191/gallery/hmsjhjuom5i1yqzlcvjg.png",
    "https://res.cloudinary.com/dvpp7fsht/image/upload/v1770250618/gallery/yh65yauarodiye7gzymd.jpg",
    "https://res.cloudinary.com/dvpp7fsht/image/upload/v1770251726/gallery/fc6ogrepieb3rtwgkbyw.jpg"
  ],
  className = ""
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className={`absolute top-0 left-0 h-dvh w-full overflow-hidden ${className}`}>
      {images.map((image, index) => (
        // <Image
        //   key={index}
        //   src={image}
        //   alt={`Slide ${index + 1}`}
        //   fill
        //   className={`object-cover transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'
        //     }`}
        //   style={{
        //     filter: 'brightness(0.8)'
        //   }}
        // />   
        
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `linear-gradient(rgba(0, 31, 63, 0.2) 0%, rgba(0, 31, 63, 0.3) 100%), url("${image}")`,
            // backgroundImage: `url("${image}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      ))}

      <div className="absolute inset-0 w-full h-full flex bg-[linear-gradient(180deg,transparent,transparent_5%,transparent_25%,white,#f1f5f8)]  z-0"></div>
    </div>
  );
};

export default HeroCarousel;