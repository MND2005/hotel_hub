'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Users, BedDouble, Plus, Minus } from "lucide-react";
import { getHotel } from "@/lib/firebase/hotels";
import { getRoomsByHotel } from "@/lib/firebase/rooms";
import { getMenuItemsByHotel } from "@/lib/firebase/menu";
import { useRouter, useParams } from 'next/navigation';
import type { Hotel, Room, MenuItem } from "@/lib/types";
import { useState, useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageGallery } from "@/components/app/image-gallery";
import Image from "next/image";
import { HotelCardImage } from "@/components/app/hotel-card-image";

const HotelDetailSkeleton = () => (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
       <div className="space-y-2 mb-8">
        <Skeleton className="w-full aspect-[16/10]" />
        <div className="hidden md:grid grid-cols-5 gap-2">
            <Skeleton className="w-full aspect-video" />
            <Skeleton className="w-full aspect-video" />
            <Skeleton className="w-full aspect-video" />
            <Skeleton className="w-full aspect-video" />
            <Skeleton className="w-full aspect-video" />
        </div>
      </div>
       <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <div className="space-y-4 pt-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-40 w-full" />
            </div>
        </div>
        <div className="lg:col-span-1">
            <Card>
                <CardHeader><Skeleton className="h-7 w-1/2" /></CardHeader>
                <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
            </Card>
        </div>
      </div>
    </div>
)


export default function HotelDetailPage() {
  const router = useRouter();
  const params = useParams();
  const hotelId = params.id as string;

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Cart state
  const [bookedRoom, setBookedRoom] = useState<Room | null>(null);
  const [foodOrder, setFoodOrder] = useState<Record<string, { item: MenuItem, quantity: number }>>({});

  useEffect(() => {
    const fetchData = async () => {
        if (!hotelId) return;
        setLoading(true);
        try {
            const [hotelData, roomsData, menuData] = await Promise.all([
                getHotel(hotelId),
                getRoomsByHotel(hotelId),
                getMenuItemsByHotel(hotelId)
            ]);

            if (!hotelData) {
                router.push('/not-found');
                return;
            }

            setHotel(hotelData);
            setRooms(roomsData);
            setMenu(menuData);
        } catch (error) {
            console.error("Failed to fetch hotel details", error);
            // Optionally show a toast error
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [hotelId, router]);

  const handleBookRoom = (room: Room) => {
    setBookedRoom(prevRoom => prevRoom?.id === room.id ? null : room);
  };

  const handleFoodQuantityChange = (item: MenuItem, change: number) => {
    setFoodOrder(prevOrder => {
      const existingItem = prevOrder[item.id];
      const newQuantity = (existingItem?.quantity || 0) + change;

      if (newQuantity <= 0) {
        const newOrder = { ...prevOrder };
        delete newOrder[item.id];
        return newOrder;
      }

      return {
        ...prevOrder,
        [item.id]: { item, quantity: newQuantity },
      };
    });
  };

  const total = useMemo(() => {
    const roomPrice = bookedRoom?.price || 0;
    const foodPrice = Object.values(foodOrder).reduce((acc, { item, quantity }) => {
        return acc + (item.price * quantity);
    }, 0);
    return roomPrice + foodPrice;
  }, [bookedRoom, foodOrder]);

  if (loading) {
    return <HotelDetailSkeleton />;
  }

  if (!hotel) {
    // This case should be handled by the redirect in useEffect, but as a fallback:
    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold">Hotel not found.</h1>
            <p className="text-muted-foreground">The hotel you are looking for does not exist or is unavailable.</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
            <ImageGallery imageUrls={hotel.imageUrls} alt={hotel.name} />
        </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold tracking-tight mb-2">{hotel.name}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>0 reviews</span>
                </div>
                <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{hotel.address}</span>
                </div>
            </div>
            <p className="text-foreground/80 mb-6">{hotel.description}</p>
        
            <Tabs defaultValue="rooms">
                <TabsList>
                    <TabsTrigger value="rooms">Book a Room</TabsTrigger>
                    <TabsTrigger value="food">Order Food</TabsTrigger>
                </TabsList>
                <TabsContent value="rooms" className="mt-6 space-y-4">
                    {rooms.length === 0 ? (
                      <p className="text-muted-foreground">No rooms available for booking at the moment.</p>
                    ) : rooms.map(room => (
                        <Card key={room.id} className="flex flex-col md:flex-row items-center overflow-hidden">
                            <div className="w-full md:w-48 shrink-0">
                               <HotelCardImage imageUrls={room.imageUrls} alt={room.type} aiHint={room.aiHint} />
                            </div>
                            <CardHeader className="flex-1">
                                <CardTitle>{room.type}</CardTitle>
                                <CardDescription className="flex items-center gap-4 pt-1">
                                    <span className="flex items-center gap-1"><Users className="w-4 h-4"/> {room.capacity} Guests</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center gap-4 p-4">
                                <p className="text-xl font-bold">${room.price}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
                                <Button onClick={() => handleBookRoom(room)} disabled={!room.isAvailable} variant={bookedRoom?.id === room.id ? "secondary" : "default"}>
                                  {bookedRoom?.id === room.id ? 'Selected' : (room.isAvailable ? 'Book Now' : 'Unavailable')}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
                <TabsContent value="food" className="mt-6">
                   <div className="space-y-4">
                    {menu.length === 0 ? (
                      <p className="text-muted-foreground">The menu is currently unavailable.</p>
                    ) : menu.map(item => (
                        <div key={item.id} className="flex justify-between items-center">
                             <div className="flex items-center gap-4">
                                {item.imageUrl && (
                                    <Image src={item.imageUrl} data-ai-hint={item.aiHint || 'food plate'} alt={item.name} width={64} height={64} className="rounded-md object-cover" />
                                )}
                                <div>
                                    <h4 className="font-semibold">{item.name}</h4>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                    <p className="font-bold text-primary mt-1">${item.price.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="icon" variant="outline" onClick={() => handleFoodQuantityChange(item, -1)} disabled={!foodOrder[item.id]}>
                                  <Minus className="w-4 h-4"/>
                                </Button>
                                <span>{foodOrder[item.id]?.quantity || 0}</span>
                                <Button size="icon" variant="outline" onClick={() => handleFoodQuantityChange(item, 1)}>
                                  <Plus className="w-4 h-4"/>
                                </Button>
                            </div>
                        </div>
                    ))}
                   </div>
                </TabsContent>
            </Tabs>
        </div>

        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Your Booking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   {(!bookedRoom && Object.keys(foodOrder).length === 0) ? (
                     <p className="text-muted-foreground text-sm text-center">Your cart is empty.</p>
                   ) : (
                     <div className="space-y-3">
                        {bookedRoom && (
                          <div>
                            <h4 className="font-semibold">Room</h4>
                            <div className="flex justify-between items-center text-sm">
                              <span>{bookedRoom.type} (1 night)</span>
                              <span>${bookedRoom.price.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                        {Object.keys(foodOrder).length > 0 && (
                          <div>
                            <h4 className="font-semibold">Food Order</h4>
                            {Object.values(foodOrder).map(({ item, quantity }) => (
                              <div key={item.id} className="flex justify-between items-center text-sm">
                                <span>{item.name} x{quantity}</span>
                                <span>${(item.price * quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <Separator />
                         <div className="flex justify-between items-center font-bold text-lg">
                           <span>Total</span>
                           <span>${total.toFixed(2)}</span>
                         </div>
                     </div>
                   )}
                </CardContent>
                <CardFooter>
                    <Button className="w-full" disabled={total === 0}>Checkout</Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
