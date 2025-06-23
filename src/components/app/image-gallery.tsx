'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type ImageGalleryProps = {
  imageUrls: string[];
  alt: string;
};

export function ImageGallery({ imageUrls, alt }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!imageUrls || imageUrls.length === 0) {
    imageUrls = ["https://placehold.co/800x600.png"];
  }
  
  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setActiveIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-2">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg">
        <Image
          src={imageUrls[activeIndex]}
          alt={`${alt} view ${activeIndex + 1}`}
          fill
          className="object-cover transition-opacity duration-300 ease-in-out"
          key={activeIndex}
          priority={true}
        />
         {imageUrls.length > 1 && (
            <>
                <Button size="icon" variant="ghost" className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white" onClick={handlePrev}>
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white" onClick={handleNext}>
                    <ChevronRight className="h-6 w-6" />
                </Button>
            </>
         )}
         <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
             {imageUrls.map((_, index) => (
                 <button key={index} onClick={() => setActiveIndex(index)} className={cn('h-2 w-2 rounded-full', activeIndex === index ? 'bg-white' : 'bg-white/50')}></button>
             ))}
         </div>
      </div>
      {imageUrls.length > 1 && (
        <div className="hidden md:grid grid-cols-5 gap-2">
          {imageUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative aspect-video w-full overflow-hidden rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                activeIndex === index ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100 transition-opacity'
              )}
            >
              <Image src={url} alt={`${alt} thumbnail ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
