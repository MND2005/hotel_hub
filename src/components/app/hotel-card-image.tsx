'use client';

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

type HotelCardImageProps = {
  imageUrls: string[];
  alt: string;
};

export function HotelCardImage({ imageUrls, alt }: HotelCardImageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const validImageUrls = imageUrls && imageUrls.length > 0 ? imageUrls : ["https://placehold.co/600x400.png"];

  const startSlideshow = () => {
    if (validImageUrls.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % validImageUrls.length);
    }, 1500); // Change image every 1.5 seconds
  };

  const stopSlideshow = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentIndex(0);
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const primaryImage = validImageUrls[currentIndex];
  
  const dataAiHint = (imageUrls && imageUrls.length > 0) ? 'hotel exterior' : undefined;

  return (
    <div
      className="relative h-48 w-full"
      onMouseEnter={startSlideshow}
      onMouseLeave={stopSlideshow}
    >
      <Image
        src={primaryImage}
        alt={alt}
        layout="fill"
        objectFit="cover"
        className="transition-opacity duration-500 ease-in-out"
        data-ai-hint={dataAiHint}
        key={primaryImage} // force re-render for transition
      />
    </div>
  );
}
