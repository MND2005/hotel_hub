'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

type MapProps = {
  lat?: number;
  lng?: number;
  zoom?: number;
  className?: string;
};

const Map = ({ lat = 34.0522, lng = -118.2437, zoom = 12, className }: MapProps) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapSrc = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=${zoom}`;

  if (apiKey) {
    return (
      <Card className={className}>
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={mapSrc}
        ></iframe>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-muted">
        <Image
          src="https://placehold.co/1200x600.png"
          data-ai-hint="world map"
          alt="Map Placeholder"
          layout="fill"
          objectFit="cover"
          className="opacity-20"
        />
        <div className="z-10 text-center p-4">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground">Map Unavailable</h3>
          <p className="text-muted-foreground mt-2">
            Please provide a Google Maps API key in your environment variables to display the map.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default Map;
