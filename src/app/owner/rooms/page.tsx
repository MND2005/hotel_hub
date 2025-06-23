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

const rooms = [
  { 
    id: 1, 
    type: "Standard Queen", 
    price: 150, 
    capacity: 2, 
    isAvailable: true, 
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "modern hotel room"
  },
  { 
    id: 2, 
    type: "Deluxe King", 
    price: 220, 
    capacity: 2, 
    isAvailable: true, 
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "luxury hotel suite"
  },
  { 
    id: 3, 
    type: "Family Suite", 
    price: 300, 
    capacity: 4, 
    isAvailable: false, 
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "spacious family room"
  },
];

export default function RoomsPage() {
  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Room Management</h2>
                <p className="text-muted-foreground">Add, edit, and manage your hotel's rooms and availability.</p>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Room
            </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
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
    </div>
  );
}
