import Image from "next/image";
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
import { getHotel, getAllHotels } from "@/lib/firebase/hotels";
import { getRoomsByHotel } from "@/lib/firebase/rooms";
import { getMenuItemsByHotel } from "@/lib/firebase/menu";
import { notFound } from 'next/navigation';
import type { Hotel } from "@/lib/types";


const placeholderImages = [
    { src: "https://placehold.co/800x600.png", alt: "Hotel Main Image", aiHint: "hotel exterior" },
    { src: "https://placehold.co/400x300.png", alt: "Hotel Image 2", aiHint: "hotel room" },
    { src: "https://placehold.co/400x300.png", alt: "Hotel Image 3", aiHint: "hotel amenity" },
];

// This function can be used with "generateStaticParams" to statically generate all hotel pages at build time.
// https://nextjs.org/docs/app/api-reference/functions/generate-static-params
export async function generateStaticParams() {
    const hotels: Hotel[] = await getAllHotels();
    return hotels.map((hotel) => ({
      id: hotel.id,
    }));
}

export default async function HotelDetailPage({ params }: { params: { id: string } }) {
  const hotel = await getHotel(params.id);
  const rooms = await getRoomsByHotel(params.id);
  const menu = await getMenuItemsByHotel(params.id);

  if (!hotel) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8 max-h-[500px]">
        <div className="col-span-2 row-span-2">
            <Image src={placeholderImages[0].src} data-ai-hint={placeholderImages[0].aiHint} alt={placeholderImages[0].alt} width={800} height={600} className="rounded-lg object-cover w-full h-full"/>
        </div>
        <Image src={placeholderImages[1].src} data-ai-hint={placeholderImages[1].aiHint} alt={placeholderImages[1].alt} width={400} height={300} className="rounded-lg object-cover w-full h-full"/>
        <Image src={placeholderImages[2].src} data-ai-hint={placeholderImages[2].aiHint} alt={placeholderImages[2].alt} width={400} height={300} className="rounded-lg object-cover w-full h-full"/>
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
                        <Card key={room.id} className="flex flex-col md:flex-row items-center">
                            <div className="relative w-full md:w-48 h-48 md:h-full">
                               <Image src={room.imageUrl} data-ai-hint={room.aiHint} alt={room.type} layout="fill" objectFit="cover" className="rounded-l-lg" />
                            </div>
                            <CardHeader className="flex-1">
                                <CardTitle>{room.type}</CardTitle>
                                <CardDescription className="flex items-center gap-4 pt-1">
                                    <span className="flex items-center gap-1"><Users className="w-4 h-4"/> {room.capacity} Guests</span>
                                    <span className="flex items-center gap-1"><BedDouble className="w-4 h-4"/> King Bed</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center gap-4 p-4">
                                <p className="text-xl font-bold">${room.price}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
                                <Button disabled>Book Now</Button>
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
                            <div>
                                <h4 className="font-semibold">{item.name}</h4>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                <p className="font-bold text-primary mt-1">${item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="icon" variant="outline" disabled><Minus className="w-4 h-4"/></Button>
                                <span>0</span>
                                <Button size="icon" variant="outline" disabled><Plus className="w-4 h-4"/></Button>
                            </div>
                        </div>
                    ))}
                   </div>
                   <Separator className="my-6" />
                   <div className="flex justify-end items-center gap-4">
                     <p className="text-lg font-bold">Total: $0.00</p>
                     <Button size="lg" disabled>Add to Cart</Button>
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
                   <p className="text-muted-foreground text-sm text-center">Your cart is empty.</p>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" disabled>Checkout</Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
