
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
import { Star, MapPin, Users, Plus, Minus, ChevronLeft, ChevronRight, MessageSquare, Check } from "lucide-react";
import { getHotel } from "@/lib/firebase/hotels";
import { getRoomsByHotel } from "@/lib/firebase/rooms";
import { getMenuItemsByHotel } from "@/lib/firebase/menu";
import { getReviewsByHotel, getUserReviewForHotel } from "@/lib/firebase/reviews";
import { useRouter, useParams } from 'next/navigation';
import type { Hotel, Room, MenuItem, Review } from "@/lib/types";
import { useState, useEffect, useMemo, useTransition, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageGallery } from "@/components/app/image-gallery";
import Image from "next/image";
import { HotelCardImage } from "@/components/app/hotel-card-image";
import { loadStripe } from '@stripe/stripe-js';
import { createCheckoutSession } from './actions';
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { StarRating } from "@/components/ui/star-rating";
import { ReviewFormDialog } from "@/components/app/review-form-dialog";
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
  const { toast } = useToast();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const [bookedRooms, setBookedRooms] = useState<Record<string, { room: Room, quantity: number }>>({});
  const [foodOrder, setFoodOrder] = useState<Record<string, { item: MenuItem, quantity: number }>>({});
  const [user, setUser] = useState<FirebaseUser | null>(null);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minPrice, setMinPrice] = useState(0);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);

  const fetchData = useCallback(async (currentUserId?: string) => {
    if (!hotelId) return;
    setLoading(true);
    try {
        const [hotelData, roomsData, menuData, reviewsData] = await Promise.all([
            getHotel(hotelId),
            getRoomsByHotel(hotelId),
            getMenuItemsByHotel(hotelId),
            getReviewsByHotel(hotelId),
        ]);

        if (!hotelData) {
            router.push('/not-found');
            return;
        }

        setHotel(hotelData);
        setRooms(roomsData);
        setMenu(menuData);
        reviewsData.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReviews(reviewsData);

        if (roomsData.length > 0) {
            const prices = roomsData.map(r => r.price);
            const min = Math.floor(Math.min(...prices));
            const max = Math.ceil(Math.max(...prices));
            setMinPrice(min);
            setMaxPrice(max);
            setPriceRange([min, max]);
        } else {
            setMinPrice(0);
            setMaxPrice(0);
            setPriceRange([0, 0]);
        }

        if(currentUserId) {
            const existingReview = await getUserReviewForHotel(hotelId, currentUserId);
            setUserReview(existingReview);
        }

    } catch (error) {
        console.error("Failed to fetch hotel details", error);
    } finally {
        setLoading(false);
    }
  }, [hotelId, router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      fetchData(currentUser?.uid);
    });
    return () => unsubscribe();
  }, [fetchData]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(
      room => room.price >= priceRange[0] && room.price <= priceRange[1]
    );
  }, [rooms, priceRange]);

  useEffect(() => {
      setCurrentRoomIndex(0);
  }, [priceRange]);

  const handlePrevRoom = () => {
    setCurrentRoomIndex(prev => (prev === 0 ? filteredRooms.length - 1 : prev - 1));
  };

  const handleNextRoom = () => {
      setCurrentRoomIndex(prev => (prev + 1) % filteredRooms.length);
  };
  
  const handleRoomQuantityChange = (room: Room, change: number) => {
    setBookedRooms(prevOrder => {
      const existingItem = prevOrder[room.id];
      const newQuantity = (existingItem?.quantity || 0) + change;

      if (newQuantity <= 0) {
        const newOrder = { ...prevOrder };
        delete newOrder[room.id];
        return newOrder;
      }
      
      if (newQuantity > room.quantity) {
          toast({ title: "Limit Reached", description: `Only ${room.quantity} rooms of this type are available.`, variant: 'default' });
          return prevOrder;
      }

      return {
        ...prevOrder,
        [room.id]: { room, quantity: newQuantity },
      };
    });
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
    const roomPrice = Object.values(bookedRooms).reduce((acc, { room, quantity }) => {
        return acc + (room.price * quantity);
    }, 0);
    const foodPrice = Object.values(foodOrder).reduce((acc, { item, quantity }) => {
        return acc + (item.price * quantity);
    }, 0);
    return roomPrice + foodPrice;
  }, [bookedRooms, foodOrder]);

  const groupedMenu = useMemo(() => {
    return menu.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, { breakfast: [], lunch: [], dinner: [] } as Record<'breakfast' | 'lunch' | 'dinner', MenuItem[]>);
  }, [menu]);

  const handleCheckout = () => {
    startTransition(async () => {
        if (!user) {
            toast({
                title: "Authentication Error",
                description: "You must be logged in to make a purchase.",
                variant: "destructive"
            });
            router.push('/login');
            return;
        }

        try {
            const { sessionId } = await createCheckoutSession(user.uid, hotelId, bookedRooms, foodOrder);
            const stripe = await stripePromise;
            if (!stripe) throw new Error('Stripe.js has not loaded yet.');
            
            const { error } = await stripe.redirectToCheckout({ sessionId });
            if (error) {
                toast({
                    title: "Checkout Error",
                    description: error.message || "An unexpected error occurred during checkout.",
                    variant: "destructive"
                });
            }

        } catch (error: any) {
            toast({
                title: "Checkout Failed",
                description: error.message || "Failed to create a checkout session. Please try again.",
                variant: "destructive"
            });
        }
    });
  }

  const handleReviewSaved = () => {
      fetchData(user?.uid);
  }

  if (loading) {
    return <HotelDetailSkeleton />;
  }

  if (!hotel) {
    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold">Hotel not found.</h1>
            <p className="text-muted-foreground">The hotel you are looking for does not exist or is unavailable.</p>
        </div>
    );
  }

  return (
    <>
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <ImageGallery imageUrls={hotel.imageUrls} alt={hotel.name} />
            </div>
        
        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold tracking-tight mb-2">{hotel.name}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    {(hotel.reviewCount || 0) > 0 ? (
                        <div className="flex items-center gap-2">
                            <StarRating rating={hotel.avgRating || 0} readOnly size={16} />
                            <span className="font-medium">{(hotel.avgRating || 0).toFixed(1)}</span>
                            <span>({hotel.reviewCount} reviews)</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-muted-foreground" />
                            <span>No reviews yet</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{hotel.address}</span>
                    </div>
                </div>
                <p className="text-foreground/80 mb-6">{hotel.description}</p>
                 {hotel.features && hotel.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {hotel.features.map(feature => (
                            <Badge key={feature} variant="secondary" className="text-sm py-1 px-3 rounded-md flex items-center gap-2">
                                <Check className="h-4 w-4" />
                                {feature}
                            </Badge>
                        ))}
                    </div>
                )}
            
                <Tabs defaultValue="rooms">
                    <TabsList>
                        <TabsTrigger value="rooms">Book a Room</TabsTrigger>
                        <TabsTrigger value="food">Order Food</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>
                    <TabsContent value="rooms" className="mt-6">
                        {rooms.length === 0 ? (
                        <p className="text-muted-foreground">No rooms available for booking at the moment.</p>
                        ) : (
                        <>
                            <Card className="mb-6 p-4">
                                <h4 className="font-semibold mb-4 text-center">Filter by Price Range</h4>
                                <div className="relative px-2">
                                 <TooltipProvider>
                                  <Slider
                                      value={priceRange}
                                      onValueChange={(value) => setPriceRange(value as [number, number])}
                                      max={maxPrice}
                                      step={1}
                                      min={minPrice}
                                      thumbChildren={
                                        priceRange.map((value, index) => (
                                          <Tooltip key={index}>
                                            <TooltipTrigger />
                                            <TooltipContent>
                                                ${value}
                                            </TooltipContent>
                                          </Tooltip>
                                        ))
                                      }
                                  />
                                 </TooltipProvider>
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                                    <span>${priceRange[0]}</span>
                                    <span>${priceRange[1]}</span>
                                </div>
                            </Card>

                            {filteredRooms.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">No rooms match your price filter.</p>
                            ) : (
                                <>
                                    <div className="relative md:hidden">
                                        <Card key={filteredRooms[currentRoomIndex].id} className="w-full flex flex-col overflow-hidden transition-all duration-300">
                                            <CardHeader className="p-0">
                                                <HotelCardImage imageUrls={filteredRooms[currentRoomIndex].imageUrls} alt={filteredRooms[currentRoomIndex].type} aiHint={filteredRooms[currentRoomIndex].aiHint} />
                                            </CardHeader>
                                            <CardContent className="p-4 flex-grow space-y-2">
                                                <CardTitle>{filteredRooms[currentRoomIndex].type}</CardTitle>
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Users className="w-4 h-4"/> 
                                                    <span>{filteredRooms[currentRoomIndex].capacity} Guests</span>
                                                </div>
                                                {filteredRooms[currentRoomIndex].features && filteredRooms[currentRoomIndex].features!.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                                        {filteredRooms[currentRoomIndex].features!.map(feature => (
                                                            <Badge key={feature} variant="secondary" className="text-xs py-0.5 px-2 rounded-md flex items-center gap-1">
                                                                <Check className="h-3 w-3" />
                                                                {feature}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                            <CardFooter className="p-4 pt-0 flex items-center justify-between">
                                                <p className="text-xl font-bold">${filteredRooms[currentRoomIndex].price}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
                                                <div className="flex items-center gap-2">
                                                    <Button size="icon" variant="outline" onClick={() => handleRoomQuantityChange(filteredRooms[currentRoomIndex], -1)} disabled={!bookedRooms[filteredRooms[currentRoomIndex].id]}>
                                                        <Minus className="w-4 h-4"/>
                                                    </Button>
                                                    <span className="font-bold w-4 text-center">{bookedRooms[filteredRooms[currentRoomIndex].id]?.quantity || 0}</span>
                                                    <Button size="icon" variant="outline" onClick={() => handleRoomQuantityChange(filteredRooms[currentRoomIndex], 1)} disabled={!filteredRooms[currentRoomIndex].isAvailable || filteredRooms[currentRoomIndex].quantity === 0 || (bookedRooms[filteredRooms[currentRoomIndex].id]?.quantity || 0) >= filteredRooms[currentRoomIndex].quantity}>
                                                        <Plus className="w-4 h-4"/>
                                                    </Button>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                        {filteredRooms.length > 1 && (
                                            <>
                                                <Button size="icon" variant="ghost" className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white" onClick={handlePrevRoom}>
                                                    <ChevronLeft className="h-6 w-6" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white" onClick={handleNextRoom}>
                                                    <ChevronRight className="h-6 w-6" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                    
                                    <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                                        {filteredRooms.map((room) => (
                                            <Card key={room.id} className="w-full flex flex-col overflow-hidden">
                                                <CardHeader className="p-0">
                                                    <HotelCardImage imageUrls={room.imageUrls} alt={room.type} aiHint={room.aiHint} />
                                                </CardHeader>
                                                <CardContent className="p-4 flex-grow space-y-2">
                                                    <CardTitle>{room.type}</CardTitle>
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Users className="w-4 h-4"/> 
                                                        <span>{room.capacity} Guests</span>
                                                    </div>
                                                    {room.features && room.features.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                                            {room.features.map(feature => (
                                                                <Badge key={feature} variant="secondary" className="text-xs py-0.5 px-2 rounded-md flex items-center gap-1">
                                                                    <Check className="h-3 w-3" />
                                                                    {feature}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </CardContent>
                                                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                                                    <p className="text-xl font-bold">${room.price}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
                                                    <div className="flex items-center gap-2">
                                                        <Button size="icon" variant="outline" onClick={() => handleRoomQuantityChange(room, -1)} disabled={!bookedRooms[room.id]}>
                                                            <Minus className="w-4 h-4"/>
                                                        </Button>
                                                        <span className="font-bold w-4 text-center">{bookedRooms[room.id]?.quantity || 0}</span>
                                                        <Button size="icon" variant="outline" onClick={() => handleRoomQuantityChange(room, 1)} disabled={!room.isAvailable || room.quantity === 0 || (bookedRooms[room.id]?.quantity || 0) >= room.quantity}>
                                                            <Plus className="w-4 h-4"/>
                                                        </Button>
                                                    </div>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                        )}
                    </TabsContent>
                    <TabsContent value="food" className="mt-6">
                    {menu.length === 0 ? (
                        <p className="text-muted-foreground">The menu is currently unavailable.</p>
                    ) : (
                        <div className="space-y-8">
                        {(['breakfast', 'lunch', 'dinner'] as const).map(category => {
                            const items = groupedMenu[category];
                            if (!items || items.length === 0) return null;

                            return (
                                <div key={category}>
                                <h3 className="text-2xl font-bold tracking-tight mb-4 capitalize">{category}</h3>
                                <div className="space-y-4">
                                    {items.map(item => (
                                        <Card key={item.id} className="w-full p-4 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                                            <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto flex-1">
                                                {item.imageUrl && (
                                                    <Image src={item.imageUrl} data-ai-hint={item.aiHint || 'food plate'} alt={item.name} width={64} height={64} className="rounded-md object-cover shrink-0" />
                                                )}
                                                <div className='flex-1'>
                                                    <h4 className="font-semibold">{item.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between w-full sm:w-auto shrink-0 mt-4 sm:mt-0 gap-4">
                                                <p className="font-bold text-primary text-lg">${item.price.toFixed(2)}</p>
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
                                        </Card>
                                    ))}
                                </div>
                                </div>
                            )
                        })}
                        </div>
                    )}
                    </TabsContent>
                    <TabsContent value="reviews" className="mt-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Guest Reviews</CardTitle>
                                        <CardDescription>See what others have to say.</CardDescription>
                                    </div>
                                    {user && (
                                        <Button onClick={() => setIsReviewDialogOpen(true)}>
                                            <MessageSquare className="mr-2 h-4 w-4" />
                                            {userReview ? 'Edit Your Review' : 'Leave a Review'}
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {reviews.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">Be the first to review this hotel!</p>
                                ) : (
                                    reviews.map(review => (
                                        <div key={review.id} className="flex gap-4">
                                            <Avatar>
                                                <AvatarFallback>{review.customerName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-semibold">{review.customerName}</p>
                                                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</p>
                                                </div>
                                                <StarRating rating={review.rating} readOnly size={16} className="my-1"/>
                                                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{review.comment}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Booking</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    {(Object.keys(bookedRooms).length === 0 && Object.keys(foodOrder).length === 0) ? (
                        <p className="text-muted-foreground text-sm text-center">Your cart is empty.</p>
                    ) : (
                        <div className="space-y-3">
                            {Object.keys(bookedRooms).length > 0 && (
                            <div>
                                <h4 className="font-semibold">Rooms</h4>
                                {Object.values(bookedRooms).map(({ room, quantity }) => (
                                <div key={room.id} className="flex justify-between items-center text-sm">
                                    <span>{room.type} ({quantity === 1 ? '1 night' : `${quantity} nights`})</span>
                                    <span>${(room.price * quantity).toFixed(2)}</span>
                                </div>
                                ))}
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
                        <Button className="w-full" disabled={total === 0 || isPending} onClick={handleCheckout}>
                            {isPending ? 'Processing...' : 'Checkout'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
        </div>
        <ReviewFormDialog
            isOpen={isReviewDialogOpen}
            setIsOpen={setIsReviewDialogOpen}
            hotelId={hotelId}
            existingReview={userReview}
            onSave={handleReviewSaved}
        />
    </>
  );
}

    