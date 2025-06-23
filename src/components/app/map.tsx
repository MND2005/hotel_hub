
'use client';

import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { useJsApiLoader, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type MapMarker = {
  lat: number;
  lng: number;
  name?: string;
};

type MapProps = {
  center: { lat: number; lng: number };
  zoom?: number;
  onMapClick?: (e: any) => void;
  markerPosition?: MapMarker | null;
  markers?: MapMarker[];
  className?: string;
};

const Map = ({ center, zoom = 12, onMapClick, markerPosition, markers, className }: MapProps) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [activeMarker, setActiveMarker] = React.useState<MapMarker | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
    libraries: ['places'],
  });

  const handleMarkerClick = (marker: MapMarker) => {
    setActiveMarker(marker);
  };

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
        {markers && markers.map((marker, index) => (
          <Marker
            key={index}
            position={marker}
            title={marker.name}
            onClick={() => handleMarkerClick(marker)}
          />
        ))}
        {activeMarker && (
          <InfoWindow
            position={{ lat: activeMarker.lat, lng: activeMarker.lng }}
            onCloseClick={() => setActiveMarker(null)}
          >
            <div>
              <h4 className="font-bold">{activeMarker.name}</h4>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </Card>
  );
};

export default Map;
