
'use client';

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
import { BedDouble, Users, DollarSign, PlusCircle, Trash, Edit } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { getRoomsByHotel, deleteRoom } from "@/lib/firebase/rooms";
import type { Room } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { RoomFormDialog } from "@/components/owner/room-form-dialog";
import { HotelCardImage } from "@/components/app/hotel-card-image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function HotelRoomsPage() {
  const params = useParams();
  const hotelId = params.id as string;
  const { toast } = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedRooms = await getRoomsByHotel(hotelId);
      setRooms(fetchedRooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast({
        title: "Error",
        description: "Failed to fetch rooms.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [hotelId, toast]);

  useEffect(() => {
    if (hotelId) {
      fetchRooms();
    }
  }, [hotelId, fetchRooms]);

  const handleAddRoom = () => {
    setSelectedRoom(null);
    setIsDialogOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsDialogOpen(true);
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await deleteRoom(hotelId, roomId);
      toast({
        title: "Success",
        description: "Room has been deleted.",
      });
      fetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
      toast({
        title: "Error",
        description: "Failed to delete room.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
             <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {[...Array(2)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="p-0 relative h-48 w-full">
                            <Skeleton className="h-full w-full" />
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between items-center">
                            <Skeleton className="h-8 w-1/3" />
                            <Skeleton className="h-8 w-1/4" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Room Management</CardTitle>
              <CardDescription>Add, edit, and manage rooms for Hotel #{hotelId}.</CardDescription>
            </div>
            <Button onClick={handleAddRoom}>
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
                <Button className="mt-4" onClick={handleAddRoom}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add First Room
                </Button>
              </div>
            ) : (
              rooms.map((room) => (
                <Card key={room.id} className="overflow-hidden flex flex-col">
                  <CardHeader className="p-0">
                    <div className="relative h-48 w-full">
                       <HotelCardImage imageUrls={room.imageUrls} alt={room.type} aiHint={room.aiHint} />
                      <Badge className="absolute top-2 right-2" variant={room.isAvailable && room.quantity > 0 ? 'default' : 'destructive'}>
                        {room.isAvailable && room.quantity > 0 ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow">
                    <CardTitle className="mb-2">{room.type}</CardTitle>
                    <div className="flex items-center text-muted-foreground text-sm space-x-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{room.capacity} Guests</span>
                      </div>
                       <div className="flex items-center gap-1">
                        <BedDouble className="h-4 w-4" />
                        <span>{room.quantity} rooms left</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between items-center">
                    <div className="flex items-center font-bold text-lg">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <span>{room.price} / night</span>
                    </div>
                    <div className="space-x-2">
                       <Button variant="outline" size="icon" onClick={() => handleEditRoom(room)}>
                         <Edit className="h-4 w-4" />
                         <span className="sr-only">Edit</span>
                       </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the room and its data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteRoom(room.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <RoomFormDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        hotelId={hotelId}
        room={selectedRoom}
        onSave={fetchRooms}
      />
    </>
  );
}
