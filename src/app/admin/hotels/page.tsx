
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAllHotelsForAdmin } from "@/lib/firebase/hotels";
import { getAllUsers } from "@/lib/firebase/users";
import { useState, useEffect, useTransition } from "react";
import type { Hotel, User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { toggleHotelStatus } from "./actions";
import { HotelPreviewDialog } from "@/components/app/hotel-preview-dialog";

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hotelsData, usersData] = await Promise.all([
          getAllHotelsForAdmin(),
          getAllUsers(),
        ]);
        setHotels(hotelsData);
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch hotels and users", error);
        toast({
          title: "Error",
          description: "Failed to load hotel data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleToggle = (hotelId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const result = await toggleHotelStatus(hotelId, currentStatus);
      if (result.success) {
        toast({
          title: 'Success',
          description: `Hotel status has been updated.`,
        });
        setHotels(currentHotels =>
          currentHotels.map(h =>
            h.id === hotelId ? { ...h, isOpen: !currentStatus } : h
          )
        );
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update status.',
          variant: 'destructive',
        });
      }
    });
  };

  const handlePreview = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setIsPreviewOpen(true);
  };

  const userMap = new Map(users.map((user) => [user.id, user.name]));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {[...Array(5)].map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-5 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(5)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Hotel Management</CardTitle>
          <CardDescription>
            View and manage all hotels on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hotel Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No hotels found.
                  </TableCell>
                </TableRow>
              ) : (
                hotels.map((hotel) => (
                  <TableRow key={hotel.id}>
                    <TableCell className="font-medium">{hotel.name}</TableCell>
                    <TableCell>
                      {userMap.get(hotel.ownerId) || "Unknown Owner"}
                    </TableCell>
                    <TableCell className="truncate max-w-sm">
                      {hotel.address}
                    </TableCell>
                    <TableCell>
                      <Badge variant={hotel.isOpen ? "default" : "secondary"}>
                        {hotel.isOpen ? "Open" : "Closed"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                            disabled={isPending}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem disabled={isPending} onClick={() => handlePreview(hotel)}>
                              View as Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled={isPending} onClick={() => router.push(`/admin/hotels/${hotel.id}`)}>
                              Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={isPending}
                            onClick={() => handleToggle(hotel.id, hotel.isOpen)}
                            className={hotel.isOpen ? "text-destructive" : ""}
                          >
                            {hotel.isOpen ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <HotelPreviewDialog
        hotel={selectedHotel}
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      />
    </>
  );
}
