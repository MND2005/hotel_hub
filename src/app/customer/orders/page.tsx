
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
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { getOrdersByCustomer } from "@/lib/firebase/orders";
import type { Order } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { getHotel } from "@/lib/firebase/hotels";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [hotelNames, setHotelNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchOrders(currentUser.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchOrders = async (userId: string) => {
    setLoading(true);
    try {
      const fetchedOrders = await getOrdersByCustomer(userId);
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
          if (hotel) {
            namesCache[id] = hotel.name;
          } else {
            namesCache[id] = "Unknown Hotel";
          }
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
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-72 mt-2" />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {[...Array(6)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {[...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                                {[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
          <CardDescription>
            Here's a list of your past room bookings and food orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hotel</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Order ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    You haven't placed any orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{hotelNames[order.hotelId] || <Skeleton className="h-4 w-24" />}</TableCell>
                    <TableCell>{format(new Date(order.orderDate), "PPP")}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{order.type}</Badge>
                    </TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      {renderStatusBadge(order.status)}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground truncate max-w-24">
                        {order.id}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
