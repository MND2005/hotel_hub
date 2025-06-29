
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
import { getReviewsByHotel } from "@/lib/firebase/reviews";
import { getHotelsByOwner } from "@/lib/firebase/hotels";
import { useState, useEffect, useMemo } from "react";
import type { Review, Hotel } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { StarRating } from "@/components/ui/star-rating";

export default function OwnerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchData(currentUser.uid);
      } else {
        setLoading(false);
        router.push('/login');
      }
    });

    const fetchData = async (ownerId: string) => {
        setLoading(true);
        try {
          const ownerHotels = await getHotelsByOwner(ownerId);
          setHotels(ownerHotels);

          if (ownerHotels.length > 0) {
            const reviewPromises = ownerHotels.map(hotel => getReviewsByHotel(hotel.id));
            const reviewsByHotel = await Promise.all(reviewPromises);
            const allReviews = reviewsByHotel.flat();
            allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setReviews(allReviews);
          } else {
            setReviews([]);
          }
        } catch (error) {
          console.error("Failed to fetch reviews", error);
          toast({ title: "Error", description: "Could not load reviews.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
    };

    return () => unsubscribe();
  }, [router, toast]);

  const hotelMap = useMemo(() => new Map(hotels.map(h => [h.id, h.name])), [hotels]);

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
                            {[...Array(5)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                            {[...Array(5)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guest Reviews</CardTitle>
        <CardDescription>
          See what customers are saying about your hotels.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hotel</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  You have no reviews yet across all your hotels.
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">{hotelMap.get(review.hotelId) || 'Unknown Hotel'}</TableCell>
                  <TableCell className="font-medium">{review.customerName}</TableCell>
                  <TableCell>
                    <StarRating rating={review.rating} readOnly size={16} />
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-sm truncate" title={review.comment}>{review.comment}</TableCell>
                  <TableCell>{format(new Date(review.createdAt), "PPP")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
