
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Users, Check } from "lucide-react";
import { getRoomsByHotel } from "@/lib/firebase/rooms";
import { getMenuItemsByHotel } from "@/lib/firebase/menu";
import type { Hotel, Room, MenuItem } from "@/lib/types";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageGallery } from "@/components/app/image-gallery";
import Image from "next/image";
import { HotelCardImage } from "@/components/app/hotel-card-image";
import { Badge } from '@/components/ui/badge';

type HotelPreviewDialogProps = {
    hotel: Hotel | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
};

const PreviewSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-20 w-full" />
        <div className="space-y-4 pt-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-40 w-full" />
        </div>
    </div>
);

export function HotelPreviewDialog({ hotel, isOpen, onOpenChange }: HotelPreviewDialogProps) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && hotel) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const [roomsData, menuData] = await Promise.all([
                        getRoomsByHotel(hotel.id),
                        getMenuItemsByHotel(hotel.id)
                    ]);
                    setRooms(roomsData);
                    setMenu(menuData);
                } catch (error) {
                    console.error("Failed to fetch preview data", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [isOpen, hotel]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                {hotel && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Customer Preview: {hotel.name}</DialogTitle>
                            <DialogDescription>
                                This is how a customer would see the hotel page. No actions are enabled.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <ImageGallery imageUrls={hotel.imageUrls} alt={hotel.name} />

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <span>0 reviews</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{hotel.address}</span>
                                </div>
                            </div>
                            <p className="text-foreground/80">{hotel.description}</p>

                            {hotel.features && hotel.features.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold mb-3">Amenities</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {hotel.features.map(feature => (
                                            <Badge key={feature} variant="secondary" className="text-sm py-1 px-3 rounded-md flex items-center gap-1.5">
                                                <Check className="h-3.5 w-3.5" />
                                                {feature}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {loading ? <PreviewSkeleton /> : (
                                <Tabs defaultValue="rooms">
                                    <TabsList>
                                        <TabsTrigger value="rooms">Available Rooms</TabsTrigger>
                                        <TabsTrigger value="food">Food Menu</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="rooms" className="mt-6 space-y-4">
                                        {rooms.length === 0 ? (
                                            <p className="text-muted-foreground">No rooms available.</p>
                                        ) : rooms.map(room => (
                                            <Card key={room.id} className="flex flex-col md:flex-row items-center overflow-hidden">
                                                <div className="w-full md:w-48 shrink-0">
                                                    <HotelCardImage imageUrls={room.imageUrls} alt={room.type} aiHint={room.aiHint} />
                                                </div>
                                                <CardHeader className="flex-1">
                                                    <CardTitle>{room.type}</CardTitle>
                                                    <CardDescription className="flex items-center gap-4 pt-1">
                                                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {room.capacity} Guests</span>
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="flex items-center gap-4 p-4">
                                                    <p className="text-xl font-bold">${room.price}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
                                                    <p className={`text-sm font-semibold ${room.isAvailable ? 'text-green-600' : 'text-red-600'}`}>{room.isAvailable ? 'Available' : 'Unavailable'}</p>
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
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            )}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
