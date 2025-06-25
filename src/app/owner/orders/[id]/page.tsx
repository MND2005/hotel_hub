
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserCircle, Hotel as HotelIcon, Calendar, Hash, DollarSign, List } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getOrderById } from "@/lib/firebase/orders";
import { getHotel } from "@/lib/firebase/hotels";
import type { Order, Hotel } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const OrderDetailSkeleton = () => (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <div>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
            <Separator />
            <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                                <TableHead className="text-right"><Skeleton className="h-5 w-24" /></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(2)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-5 w-full" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center bg-muted/50 p-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-24" />
        </CardFooter>
    </Card>
);


export default function OwnerOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrderDetails = useCallback(async () => {
        if (!orderId || !auth.currentUser) return;
        setLoading(true);
        try {
            const orderData = await getOrderById(orderId);
            if (!orderData || orderData.ownerId !== auth.currentUser.uid) {
                toast({ title: "Not Found", description: "Order not found or you don't have permission to view it.", variant: "destructive" });
                router.push("/owner/orders");
                return;
            }
            setOrder(orderData);
            
            const hotelData = await getHotel(orderData.hotelId);
            setHotel(hotelData);

        } catch (error) {
            console.error("Failed to fetch order details:", error);
            toast({ title: "Error", description: "Failed to fetch order details.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [orderId, router, toast]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchOrderDetails();
            } else {
                router.push('/login');
            }
        });
        return () => unsubscribe();
    }, [fetchOrderDetails, router]);

    const renderStatusBadge = (status: Order['status']) => {
        const variants: Record<Order['status'], 'default' | 'secondary' | 'outline' | 'destructive'> = {
          pending: 'outline',
          confirmed: 'secondary',
          completed: 'default',
          cancelled: 'destructive'
        };
        return <Badge variant={variants[status]} className="capitalize text-base px-3 py-1">{status}</Badge>;
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-48 mb-4" />
                <OrderDetailSkeleton />
            </div>
        )
    }

    if (!order) {
        return <p>Order not found.</p>;
    }

    return (
        <div className="space-y-4">
             <Button variant="outline" asChild>
                <Link href="/owner/orders">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Orders
                </Link>
             </Button>

            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl">Order Details</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <Hash className="h-3 w-3" />
                                {order.id}
                            </CardDescription>
                        </div>
                        {renderStatusBadge(order.status)}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-start gap-3">
                            <HotelIcon className="h-5 w-5 mt-1 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Hotel</p>
                                <p className="font-medium">{hotel?.name || 'Loading...'}</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-3">
                            <UserCircle className="h-5 w-5 mt-1 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Customer ID</p>
                                <p className="font-mono text-xs">{order.customerId}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 mt-1 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Order Date</p>
                                <p className="font-medium">{format(new Date(order.orderDate), 'PPpp')}</p>
                            </div>
                        </div>
                    </div>
                    
                    <Separator />

                    <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                           <List className="h-5 w-5" /> Items Ordered
                        </h3>
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center bg-muted/50 p-4 rounded-b-lg">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        <span className="font-semibold">Order Total</span>
                    </div>
                    <span className="text-2xl font-bold">${order.total.toFixed(2)}</span>
                </CardFooter>
            </Card>
        </div>
    );
}
