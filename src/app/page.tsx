
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
  CardDescription,
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const sriLankaCenter = { lat: 7.8731, lng: 80.7718 };

  useEffect(() => {
    const fetchHotelsAndLocation = async () => {
      setLoading(true);
      setError(null);

      const location = await new Promise<{ lat: number; lng: number }>((resolve) => {
        if (!navigator.geolocation) {
          setError("Geolocation is not supported by your browser.");
          resolve(sriLankaCenter);
        } else {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (err) => {
              console.warn(`Geolocation Error (${err.code}): ${err.message}`);
              let message = "Could not get your location. Showing hotels across Sri Lanka.";
              if (err.code === err.PERMISSION_DENIED) {
                message = "Location access was denied. Please enable it in your browser settings to see nearby hotels.";
              } else if (err.code === err.POSITION_UNAVAILABLE) {
                  message = "Location information is unavailable. Showing hotels across Sri Lanka.";
              } else if (err.code === err.TIMEOUT) {
                  message = "The request to get user location timed out. Showing hotels across Sri Lanka.";
              }
              setError(message);
              resolve(sriLankaCenter);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000, // 10 seconds
              maximumAge: 0,
            }
          );
        }
      });
      setUserLocation(location);

      try {
        const allHotels = await getAllHotels();
        if (allHotels.length === 0) {
            setError("No hotels are available on the platform at the moment.");
            setNearestHotel(null);
            setLoading(false);
            return;
        }

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

  useEffect(() => {
    if (nearestHotel?.imageUrls && nearestHotel.imageUrls.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % nearestHotel.imageUrls.length);
      }, 2000); // 2 seconds
      return () => clearInterval(interval);
    }
  }, [nearestHotel]);
  
  const mapMarkers = [];
  if (nearestHotel) {
    mapMarkers.push({ lat: nearestHotel.latitude, lng: nearestHotel.longitude, name: nearestHotel.name });
  }
  if (userLocation && !error) {
    mapMarkers.push({ lat: userLocation.lat, lng: userLocation.lng, name: 'Your Location' });
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
        <Map
            center={userLocation && !error ? userLocation : (nearestHotel ? { lat: nearestHotel.latitude, lng: nearestHotel.longitude } : sriLankaCenter)}
            zoom={nearestHotel ? 13 : 8}
            markers={mapMarkers}
            className="absolute inset-0 w-full h-full"
        />
        <div className="absolute inset-0 bg-black/40" />

        <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/20 p-4 backdrop-blur-lg sm:px-6 lg:px-8">
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

        <main className="relative z-10 grid h-full items-center md:grid-cols-2">
            <div className="flex items-center justify-center p-4 md:p-8">
                {loading ? (
                    <HomePageSkeleton />
                ) : nearestHotel ? (
                    <Card className="w-full max-w-md mx-4 bg-black/20 backdrop-blur-xl border-white/20 text-white shadow-2xl animate-fade-in">
                        <CardHeader>
                            <CardTitle className="text-center text-xl tracking-wide">Featured Hotel</CardTitle>
                             {error && <CardDescription className="text-center text-red-400 pt-2">{error}</CardDescription>}
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="aspect-video w-full overflow-hidden rounded-lg border border-white/10">
                                    <Image 
                                        src={nearestHotel.imageUrls?.[currentImageIndex] || 'https://placehold.co/600x400.png'}
                                        alt={nearestHotel.name}
                                        width={600}
                                        height={400}
                                        className="w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
                                        data-ai-hint="hotel exterior"
                                        key={currentImageIndex}
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
            </div>
            <div className="hidden md:block">
                {/* This empty div makes the map background visible on the right on larger screens */}
            </div>
        </main>
    </div>
  );
}
