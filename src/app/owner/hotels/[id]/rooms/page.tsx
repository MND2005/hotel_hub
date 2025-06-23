
'use client';

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BedDouble, Users, DollarSign, PlusCircle } from "lucide-react";
import { useParams } from "next/navigation";

// Mock data, in a real app this would be fetched based on hotel ID
const rooms: any[] = [];

export default function HotelRoomsPage() {
  const params = useParams();
  const hotelId = params.id as string;

  return (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle>Room Management</CardTitle>
                    <CardDescription>Add, edit, and manage rooms for Hotel #{hotelId}.</CardDescription>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Room
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {rooms.length === 0 ? (
                    <div className="lg:col-span-2 text-center text-muted-foreground py-20">
                        <BedDouble className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No rooms yet</h3>
                        <p className="text-sm">You haven't added any rooms for this hotel.</p>
                            <Button className="mt-4">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add First Room
                        </Button>
                    </div>
                ) : rooms.map((room) => (
                    <Card key={room.id} className="overflow-hidden">
                        <CardHeader className="p-0">
                            <div className="relative h-48 w-full">
                                <Image src={room.imageUrl} data-ai-hint={room.aiHint} alt={room.type} layout="fill" objectFit="cover" />
                                    <Badge className="absolute top-2 right-2" variant={room.isAvailable ? 'default' : 'destructive'}>
                                    {room.isAvailable ? 'Available' : 'Booked'}
                                    </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <CardTitle className="mb-2">{room.type}</CardTitle>
                            <div className="flex items-center text-muted-foreground text-sm space-x-4">
                                <div className="flex items-center gap-1">
                                    <BedDouble className="h-4 w-4" />
                                    <span>{room.type}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    <span>{room.capacity} Guests</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between items-center">
                            <div className="flex items-center font-bold text-lg">
                                <DollarSign className="h-5 w-5 text-primary" />
                                <span>{room.price} / night</span>
                            </div>
                            <div className="space-x-2">
                                <Button variant="outline" size="sm">Edit</Button>
                                <Button variant="destructive" size="sm">Delete</Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </CardContent>
    </Card>
  );
}
