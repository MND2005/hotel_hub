'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type MapProps = {
  center: { lat: number; lng: number };
  zoom?: number;
  onMapClick?: (e: any) => void;
  markerPosition?: { lat: number; lng: number } | null;
  className?: string;
};

const Map = ({ center, zoom = 12, onMapClick, markerPosition, className }: MapProps) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
    libraries: ['places'],
  });

  if (loadError || !apiKey) {
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
              Please provide a valid Google Maps API key in your environment variables to display the map.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!isLoaded) {
    return <Skeleton className={cn('h-full w-full', className)} />;
  }

  return (
    <Card className={className}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={zoom}
        onClick={onMapClick}
        options={{
            streetViewControl: false,
            mapTypeControl: false,
        }}
      >
        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>
    </Card>
  );
};

export default Map;
