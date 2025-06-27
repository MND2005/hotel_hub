
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
import { useToast } from "@/hooks/use-toast";

type HotelWithDistance = Hotel & { distance: number };

const HomePageSkeleton = () => (
    <Card className="w-full max-w-md mx-4">
        <CardHeader>
            <CardTitle className="text-center text-xl">Finding Your Nearest Hotel...</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-5 w-full mx-auto" />
                <Skeleton className="h-5 w-1/3 mx-auto" />
            </div>
        </CardContent>
        <CardFooter>
            <Skeleton className="h-11 w-full rounded-md" />
        </CardFooter>
    </Card>
);


export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nearestHotel, setNearestHotel] = useState<HotelWithDistance | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();
  
  const sriLankaCenter = { lat: 7.8731, lng: 80.7718 };

  const findNearestHotel = async () => {
    setLoading(true);
    setError(null);
    setNearestHotel(null);

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
            let message = "Could not get your location. Showing hotels across Sri Lanka.";
            if (err.code === err.PERMISSION_DENIED) {
              message = "Location access was denied. Please enable it in your browser settings to see nearby hotels.";
            } else if (err.code === err.POSITION_UNAVAILABLE) {
                message = "Location information is unavailable. Showing hotels across Sri Lanka.";
            }
            setError(message);
            resolve(sriLankaCenter);
          },
          {
            enableHighAccuracy: true,
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
      } else {
        const hotelsWithDistance = allHotels.map(hotel => ({
            ...hotel,
            distance: getDistance(location.lat, location.lng, hotel.latitude, hotel.longitude)
        })).sort((a, b) => a.distance - b.distance);
        setNearestHotel(hotelsWithDistance[0]);
      }
    } catch (dbError) {
      console.error("Error fetching hotels:", dbError);
      setError("Could not fetch hotel data.");
    } finally {
      setLoading(false);
    }
  };

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
  if (userLocation && (userLocation.lat !== sriLankaCenter.lat || userLocation.lng !== sriLankaCenter.lng)) {
    mapMarkers.push({ lat: userLocation.lat, lng: userLocation.lng, name: 'Your Location' });
  }

  const InitialCard = () => (
    <Card className="w-full max-w-md mx-4 text-center animate-fade-in">
        <CardHeader>
            <CardTitle className="text-xl tracking-wide">Welcome to Tri-Sided Hub</CardTitle>
            <CardDescription className="pt-2">Find your perfect stay in Sri Lanka.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Click the button below to allow location access and find the hotel closest to you.</p>
        </CardContent>
        <CardFooter>
            <Button onClick={findNearestHotel} size="lg" className="w-full">
                Find Nearest Hotel
            </Button>
        </CardFooter>
    </Card>
  );

  const renderContent = () => {
    if (loading) {
      return <HomePageSkeleton />;
    }
    if (nearestHotel) {
      return (
        <Card className="w-full max-w-md mx-4 animate-fade-in">
            <CardHeader>
                <CardTitle className="text-center text-xl tracking-wide">Featured Hotel</CardTitle>
                 {error && <CardDescription className="text-center text-orange-500 pt-2">{error}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="aspect-video w-full overflow-hidden rounded-lg border">
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
                    <h3 className="text-3xl font-bold text-center">{nearestHotel.name}</h3>
                    <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 shrink-0"/>
                        <span className="truncate">{nearestHotel.address}</span>
                    </p>
                    <p className="text-center text-lg font-bold">{nearestHotel.distance.toFixed(1)} km away</p>
                </div>
            </CardContent>
            <CardFooter>
                <Button asChild size="lg" className="w-full">
                    <Link href="/login">
                        View Hotel & Book
                    </Link>
                </Button>
            </CardFooter>
        </Card>
      );
    }
    if (error && !loading) {
        return (
            <Card className="w-full max-w-md mx-4">
                <CardContent className="p-10 text-center">
                    <p className="text-destructive">{error}</p>
                    <Button onClick={findNearestHotel} size="lg" className="w-full mt-4">
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        )
    }
    return <InitialCard />;
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
        <Map
            center={userLocation || sriLankaCenter}
            zoom={userLocation ? 13 : 8}
            markers={mapMarkers}
            className="absolute inset-0 w-full h-full"
        />
        <div className="absolute inset-0 bg-black/20" />

        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">Tri-Sided Hub</h1>
            <div className="space-x-2">
                <Button asChild variant="ghost" className="text-white hover:bg-white/20 hover:text-white">
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                </Button>
            </div>
        </header>

        <main className="relative z-10 grid h-full items-center md:grid-cols-2">
            <div className="flex items-center justify-center p-4 md:p-8">
                {renderContent()}
            </div>
            <div className="hidden md:block">
                {/* This empty div makes the map background visible on the right on larger screens */}
            </div>
        </main>
    </div>
  );
}
