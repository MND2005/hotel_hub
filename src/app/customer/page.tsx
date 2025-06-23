
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
import { MapPin } from "lucide-react";
import Map from "@/components/app/map";
import { useState, useEffect } from "react";
import { getAllHotels } from "@/lib/firebase/hotels";
import type { Hotel } from "@/lib/types";
import { getDistance } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { HotelCardImage } from '@/components/app/hotel-card-image';

type HotelWithDistance = Hotel & { distance: number };

export default function CustomerExplorePage() {
  const [hotels, setHotels] = useState<HotelWithDistance[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sriLankaCenter = { lat: 7.8731, lng: 80.7718 };

  useEffect(() => {
    const fetchHotelsAndLocation = async () => {
      setLoading(true);
      setError(null);

      // Fetch user location
      const getLocation = new Promise<{ lat: number, lng: number }>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject("Geolocation is not supported by your browser.");
        } else {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            () => {
              reject("Unable to retrieve your location. Showing hotels across Sri Lanka.");
            }
          );
        }
      });

      try {
        const location = await getLocation;
        setUserLocation(location);
      } catch (locationError: any) {
        setError(locationError as string);
        setUserLocation(sriLankaCenter); // Default to Sri Lanka center on error
      }
    };

    fetchHotelsAndLocation();
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    const fetchAndSortHotels = async () => {
        try {
            const allHotels = await getAllHotels();
            const hotelsWithDistance = allHotels.map(hotel => ({
                ...hotel,
                distance: getDistance(userLocation.lat, userLocation.lng, hotel.latitude, hotel.longitude)
            })).sort((a, b) => a.distance - b.distance);

            setHotels(hotelsWithDistance);
        } catch (dbError) {
            console.error("Error fetching hotels:", dbError);
            setError("Could not fetch hotel data.");
        } finally {
            setLoading(false);
        }
    };

    fetchAndSortHotels();

  }, [userLocation]);


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
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Find Your Stay</h1>
        <p className="text-muted-foreground">
          {error ? error : "Explore hotels near you for room bookings and food orders."}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-3">
            <Map 
              className="overflow-hidden h-[500px]" 
              center={userLocation || sriLankaCenter}
              zoom={userLocation && !error ? 13 : 8}
              markers={[
                ...(userLocation && !error
                  ? [{ lat: userLocation.lat, lng: userLocation.lng, name: 'Your Location' }]
                  : []),
                ...hotels.map(h => ({ lat: h.latitude, lng: h.longitude, name: h.name })),
              ]}
            />
        </div>

        <div className="lg:col-span-3 mt-8">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Hotels Near You</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {hotels.length === 0 ? (
                    <div className="lg:col-span-4 text-center text-muted-foreground py-10">
                        No hotels found near you.
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
                                <Badge variant="secondary">{hotel.distance.toFixed(1)} km</Badge>
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
