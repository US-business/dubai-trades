'use client';

import React from 'react';

interface HeroCarouselProps {
  title?: string;
  subtitle?: string;
  images?: string[];
  className?: string;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  title = "Quality for Every Home",
  subtitle = "Explore our curated collection of clothing, kitchen tools, home décor, electrical appliances, and more. Find everything you need to elevate your lifestyle.",
  images = [
    "https://res.cloudinary.com/dvpp7fsht/image/upload/v1767898095/gallery/wuy4qzbqvuunj6nfl0lv.png",
    "https://res.cloudinary.com/dvpp7fsht/image/upload/v1770150028/gallery/lhsdafl4eqeefb9da66u.jpg",
    "https://res.cloudinary.com/dvpp7fsht/image/upload/v1770150467/gallery/kwtqjwxhaea6khxpbhtm.jpg"
  ],
  className = ""
}) => {
  return (
    <div className={`absolute top-0 left-0 h-dvh w-full overflow-hidden ${className}`}>
      {/* Animated Background Carousel */}
      <div className="absolute inset-0 w-full h-full flex animate-slide z-0">
        {images.map((image, index) => (
          <div
            key={index}
            className="w-full h-full flex-shrink-0 bg-cover bg-center"
            style={{
              // backgroundImage: `url("${image}")` 
              backgroundImage: `linear-gradient(rgba(0, 31, 63, 0.2) 0%, rgba(0, 31, 63, 0.3) 100%), url("${image}")`
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 w-full h-full flex bg-[linear-gradient(180deg,transparent,transparent_5%,transparent_25%,white,#f1f5f8)]  z-0"></div>

      <style jsx>{`
        @keyframes slide {
          0%, 100% {
            transform: translateX(0%);
          }
          25% {
            transform: translateX(0%);
          }
          33% {
            transform: translateX(-100%);
          }
          58% {
            transform: translateX(-100%);
          }
          66% {
            transform: translateX(-200%);
          }
          91% {
            transform: translateX(-200%);
          }
        }

        .animate-slide {
          animation: slide 15s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;
