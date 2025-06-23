
'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import type { Hotel } from "@/lib/types";
import { getAllHotels } from "@/lib/firebase/hotels";
import { getDistance } from "@/lib/utils";
import Map from "@/components/app/map";
import { Skeleton } from "@/components/ui/skeleton";

type HotelWithDistance = Hotel & { distance: number };

const HomePageSkeleton = () => (
    <Card className="w-full max-w-md mx-4 bg-white/10 backdrop-blur-lg border-white/20 text-white shadow-2xl">
        <CardHeader>
            <CardTitle className="text-center text-xl">Finding Your Nearest Hotel...</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <Skeleton className="aspect-video w-full rounded-lg bg-white/20" />
                <Skeleton className="h-8 w-3/4 mx-auto bg-white/20" />
                <Skeleton className="h-5 w-full mx-auto bg-white/20" />
                <Skeleton className="h-5 w-1/3 mx-auto bg-white/20" />
            </div>
        </CardContent>
        <CardFooter>
            <Skeleton className="h-11 w-full rounded-md bg-white/20" />
        </CardFooter>
    </Card>
);


export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nearestHotel, setNearestHotel] = useState<HotelWithDistance | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  
  const sriLankaCenter = { lat: 7.8731, lng: 80.7718 };

  useEffect(() => {
    const fetchHotelsAndLocation = async () => {
      setLoading(true);
      setError(null);

      // 1. Get User Location
      const location = await new Promise<{ lat: number, lng: number }>((resolve) => {
        if (!navigator.geolocation) {
          setError("Geolocation is not supported. Showing hotels across Sri Lanka.");
          resolve(sriLankaCenter);
        } else {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            () => {
              setError("Could not get your location. Showing hotels across Sri Lanka.");
              resolve(sriLankaCenter);
            }
          );
        }
      });
      setUserLocation(location);

      // 2. Fetch Hotels
      try {
        const allHotels = await getAllHotels();
        if (allHotels.length === 0) {
            setError("No hotels are available on the platform at the moment.");
            setNearestHotel(null);
            setLoading(false);
            return;
        }

        // 3. Find Nearest Hotel
        const hotelsWithDistance = allHotels.map(hotel => ({
            ...hotel,
            distance: getDistance(location.lat, location.lng, hotel.latitude, hotel.longitude)
        })).sort((a, b) => a.distance - b.distance);

        setNearestHotel(hotelsWithDistance[0]);

      } catch (dbError) {
        console.error("Error fetching hotels:", dbError);
        setError("Could not fetch hotel data.");
      } finally {
        setLoading(false);
      }
    };

    fetchHotelsAndLocation();
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
        {/* Background Map */}
        <Map
            center={nearestHotel ? { lat: nearestHotel.latitude, lng: nearestHotel.longitude } : sriLankaCenter}
            zoom={nearestHotel ? 13 : 8}
            markers={nearestHotel ? [{ lat: nearestHotel.latitude, lng: nearestHotel.longitude, name: nearestHotel.name }] : []}
            className="absolute inset-0 w-full h-full"
        />
        <div className="absolute inset-0 bg-black/30" /> {/* Dark overlay for better readability */}

        {/* Header */}
        <header className="absolute top-0 left-0 right-0 p-4 sm:px-6 lg:px-8 flex justify-between items-center z-10">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">Tri-Sided Hub</h1>
            <div className="space-x-2">
                <Button asChild variant="ghost" className="text-white hover:bg-white/20 hover:text-white">
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="bg-white/90 text-black hover:bg-white">
                    <Link href="/signup">Sign Up</Link>
                </Button>
            </div>
        </header>

        {/* Main Content - Centered Glass Card */}
        <main className="relative z-10 flex items-center justify-center h-full">
            {loading ? (
                <HomePageSkeleton />
            ) : nearestHotel ? (
                <Card className="w-full max-w-md mx-4 bg-black/20 backdrop-blur-xl border-white/20 text-white shadow-2xl animate-fade-in">
                    <CardHeader>
                        <CardTitle className="text-center text-xl tracking-wide">Closest Hotel to You</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="aspect-video w-full overflow-hidden rounded-lg border border-white/10">
                                <Image 
                                    src={nearestHotel.imageUrls?.[0] || 'https://placehold.co/600x400.png'}
                                    alt={nearestHotel.name}
                                    width={600}
                                    height={400}
                                    className="w-full h-full object-cover"
                                    data-ai-hint="hotel exterior"
                                />
                            </div>
                            <h3 className="text-3xl font-bold text-center drop-shadow-md">{nearestHotel.name}</h3>
                            <p className="flex items-center justify-center gap-2 text-sm text-white/80">
                                <MapPin className="w-4 h-4 shrink-0"/>
                                <span className="truncate">{nearestHotel.address}</span>
                            </p>
                            <p className="text-center text-lg font-bold">{nearestHotel.distance.toFixed(1)} km away</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild size="lg" className="w-full bg-white/90 text-black hover:bg-white">
                            <Link href="/login">
                                View Hotel & Book
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <Card className="w-full max-w-md mx-4 bg-black/20 backdrop-blur-xl border-white/20 text-white shadow-2xl">
                    <CardContent className="p-10 text-center">
                        <p>{error || "No hotels found at the moment. Please check back later."}</p>
                    </CardContent>
                </Card>
            )}
        </main>
    </div>
  );
}
