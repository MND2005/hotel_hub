
'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, LocateFixed } from "lucide-react";
import Map from "@/components/app/map";
import { useState, useEffect, useTransition } from "react";
import { getAllHotels } from "@/lib/firebase/hotels";
import type { Hotel } from "@/lib/types";
import { getDistance } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { HotelCardImage } from '@/components/app/hotel-card-image';
import { useToast } from '@/hooks/use-toast';

type HotelWithDistance = Hotel & { distance?: number };

export default function CustomerExplorePage() {
  const [hotels, setHotels] = useState<HotelWithDistance[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, startLocating] = useTransition();
  const { toast } = useToast();

  const sriLankaCenter = { lat: 7.8731, lng: 80.7718 };

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      setError(null);
      try {
        const allHotels = await getAllHotels();
        // Sort alphabetically by default
        setHotels(allHotels.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (dbError) {
        console.error("Error fetching hotels:", dbError);
        setError("Could not fetch hotel data.");
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  const handleSortByDistance = () => {
    startLocating(() => {
      if (!navigator.geolocation) {
        toast({
          variant: "destructive",
          title: "Geolocation Error",
          description: "Geolocation is not supported by your browser.",
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);

          const hotelsWithDistance = [...hotels].map(hotel => ({
            ...hotel,
            distance: getDistance(location.lat, location.lng, hotel.latitude, hotel.longitude)
          })).sort((a, b) => a.distance! - b.distance!);

          setHotels(hotelsWithDistance);
          toast({
            title: "Location Found",
            description: "Hotels sorted by distance from you.",
          });
        },
        (err) => {
          let message = "Could not retrieve your location.";
          if (err.code === err.PERMISSION_DENIED) {
            message = "Location access was denied. Please enable it in your browser settings.";
          }
          toast({
            variant: "destructive",
            title: "Geolocation Error",
            description: message,
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-2 mb-8">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-3">
                <Skeleton className="h-[500px] w-full" />
            </div>
            <div className="lg:col-span-3 mt-8">
                <Skeleton className="h-8 w-1/4 mb-4" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="p-0"><Skeleton className="h-48 w-full" /></CardHeader>
                            <CardContent className="p-4 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                            </CardContent>
                            <CardFooter className="p-4 pt-0"><Skeleton className="h-10 w-full" /></CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-2 mb-8 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Find Your Stay</h1>
            <p className="text-muted-foreground">
                {userLocation ? "Showing hotels sorted by distance." : "Explore hotels for room bookings and food orders."}
            </p>
        </div>
        <Button onClick={handleSortByDistance} disabled={isLocating}>
            <LocateFixed className="mr-2 h-4 w-4" />
            {isLocating ? 'Locating...' : 'Sort by Distance'}
        </Button>
      </div>

      {error && <p className="text-destructive mb-4">{error}</p>}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-3">
            <Map 
              className="overflow-hidden h-[500px]" 
              center={userLocation || sriLankaCenter}
              zoom={userLocation ? 13 : 8}
              markers={[
                ...(userLocation
                  ? [{ lat: userLocation.lat, lng: userLocation.lng, name: 'Your Location' }]
                  : []),
                ...hotels.map(h => ({ lat: h.latitude, lng: h.longitude, name: h.name })),
              ]}
            />
        </div>

        <div className="lg:col-span-3 mt-8">
            <h2 className="text-2xl font-bold tracking-tight mb-4">{userLocation ? "Hotels Near You" : "All Hotels"}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {hotels.length === 0 ? (
                    <div className="lg:col-span-4 text-center text-muted-foreground py-10">
                        No hotels found.
                    </div>
                ) : hotels.map((hotel) => (
                    <Card key={hotel.id} className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                        <Link href={`/customer/hotels/${hotel.id}`}>
                            <CardHeader className="p-0">
                                <HotelCardImage imageUrls={hotel.imageUrls} alt={hotel.name} />
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                <CardTitle className="text-lg truncate">{hotel.name}</CardTitle>
                                {typeof hotel.distance === 'number' && (
                                    <Badge variant="secondary">{hotel.distance.toFixed(1)} km</Badge>
                                )}
                                </div>
                                <p className="flex items-center text-sm text-muted-foreground">
                                  <MapPin className="w-4 h-4 mr-1 shrink-0" />
                                  <span className="truncate">{hotel.address}</span>
                                </p>
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                <Button className="w-full">View Details</Button>
                            </CardFooter>
                        </Link>
                    </Card>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
