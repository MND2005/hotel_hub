
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
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { getOrdersByHotelOwner } from "@/lib/firebase/orders";
import { getHotel } from "@/lib/firebase/hotels";
import type { Order } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [hotelNames, setHotelNames] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchOrders(currentUser.uid);
      } else {
        setLoading(false);
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchOrders = async (ownerId: string) => {
    setLoading(true);
    try {
      const fetchedOrders = await getOrdersByHotelOwner(ownerId);
      fetchedOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      setOrders(fetchedOrders);
      fetchHotelNames(fetchedOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotelNames = async (ordersToFetch: Order[]) => {
    const uniqueHotelIds = [...new Set(ordersToFetch.map(o => o.hotelId))];
    const namesCache = { ...hotelNames };
    
    const promises = uniqueHotelIds.map(async (id) => {
      if (!namesCache[id]) {
        try {
          const hotel = await getHotel(id);
          namesCache[id] = hotel ? hotel.name : "Unknown Hotel";
        } catch {
          namesCache[id] = "Unknown Hotel";
        }
      }
    });

    await Promise.all(promises);
    setHotelNames(namesCache);
  };
  
  const renderStatusBadge = (status: Order['status']) => {
    const variants: Record<Order['status'], 'default' | 'secondary' | 'outline' | 'destructive'> = {
      pending: 'outline',
      confirmed: 'secondary',
      completed: 'default',
      cancelled: 'destructive'
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  }


  if (loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72 mt-2" />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {[...Array(7)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            {[...Array(7)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
        <CardDescription>
          A complete history of all orders for your hotels.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Hotel</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  You have not received any orders yet.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-xs text-muted-foreground truncate max-w-24">{order.id}</TableCell>
                  <TableCell>{hotelNames[order.hotelId] || <Skeleton className="h-4 w-24" />}</TableCell>
                  <TableCell>{format(new Date(order.orderDate), "PPP")}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{order.type}</Badge>
                  </TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    {renderStatusBadge(order.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/owner/orders/${order.id}`}>
                        View <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
