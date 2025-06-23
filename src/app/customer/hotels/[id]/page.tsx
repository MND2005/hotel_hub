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

const hotel = {
  id: "1",
  address: "123 Ocean Drive, Sunnyvale, CA",
  rating: 4.8,
  reviews: 245,
  description: "Experience unparalleled luxury and comfort at our seaside location. Hotel #1 offers breathtaking views and world-class amenities for an unforgettable stay. Please note that direct contact information and hotel names are not displayed for privacy.",
  images: [
    { src: "https://placehold.co/800x600.png", alt: "Hotel Lobby", aiHint: "hotel lobby interior" },
    { src: "https://placehold.co/400x300.png", alt: "Hotel Pool", aiHint: "hotel swimming pool" },
    { src: "https://placehold.co/400x300.png", alt: "Hotel Restaurant", aiHint: "fine dining restaurant" },
  ],
};

const rooms = [
    { id: 1, type: "Deluxe King", price: 250, capacity: 2, imageUrl: "https://placehold.co/600x400.png", aiHint: "luxury hotel suite" },
    { id: 2, type: "Ocean View Suite", price: 400, capacity: 3, imageUrl: "https://placehold.co/600x400.png", aiHint: "hotel room ocean view" },
];

const menu = [
    { id: 1, name: "Gourmet Burger", price: 22, description: "Wagyu beef, truffle aioli, brioche bun." },
    { id: 2, name: "Lobster Bisque", price: 18, description: "Creamy, rich bisque with fresh lobster." },
    { id: 3, name: "Truffle Fries", price: 12, description: "Hand-cut fries with parmesan and truffle oil." },
];

export default function HotelDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8 max-h-[500px]">
        <div className="col-span-2 row-span-2">
            <Image src={hotel.images[0].src} data-ai-hint={hotel.images[0].aiHint} alt={hotel.images[0].alt} width={800} height={600} className="rounded-lg object-cover w-full h-full"/>
        </div>
        <Image src={hotel.images[1].src} data-ai-hint={hotel.images[1].aiHint} alt={hotel.images[1].alt} width={400} height={300} className="rounded-lg object-cover w-full h-full"/>
        <Image src={hotel.images[2].src} data-ai-hint={hotel.images[2].aiHint} alt={hotel.images[2].alt} width={400} height={300} className="rounded-lg object-cover w-full h-full"/>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Hotel #{params.id}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>{hotel.rating} ({hotel.reviews} reviews)</span>
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
                    {rooms.map(room => (
                        <Card key={room.id} className="flex flex-col md:flex-row items-center">
                            <Image src={room.imageUrl} data-ai-hint={room.aiHint} alt={room.type} width={200} height={150} className="rounded-l-lg object-cover h-full w-full md:w-48"/>
                            <CardHeader className="flex-1">
                                <CardTitle>{room.type}</CardTitle>
                                <CardDescription className="flex items-center gap-4 pt-1">
                                    <span className="flex items-center gap-1"><Users className="w-4 h-4"/> {room.capacity} Guests</span>
                                    <span className="flex items-center gap-1"><BedDouble className="w-4 h-4"/> King Bed</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center gap-4 p-4">
                                <p className="text-xl font-bold">${room.price}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
                                <Button>Book Now</Button>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
                <TabsContent value="food" className="mt-6">
                   <div className="space-y-4">
                    {menu.map(item => (
                        <div key={item.id} className="flex justify-between items-center">
                            <div>
                                <h4 className="font-semibold">{item.name}</h4>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                <p className="font-bold text-primary mt-1">${item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="icon" variant="outline"><Minus className="w-4 h-4"/></Button>
                                <span>1</span>
                                <Button size="icon" variant="outline"><Plus className="w-4 h-4"/></Button>
                            </div>
                        </div>
                    ))}
                   </div>
                   <Separator className="my-6" />
                   <div className="flex justify-end items-center gap-4">
                     <p className="text-lg font-bold">Total: $22.00</p>
                     <Button size="lg">Add to Cart</Button>
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
