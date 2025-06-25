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
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getAllOrders } from "@/lib/firebase/orders";
import { getAllUsers } from "@/lib/firebase/users";
import { getAllHotelsForAdmin } from "@/lib/firebase/hotels";
import type { Order, User, Hotel } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData();
      } else {
        setLoading(false);
        router.push('/login');
      }
    });

    const fetchData = async () => {
        setLoading(true);
        try {
          const [ordersData, usersData, hotelsData] = await Promise.all([
            getAllOrders(),
            getAllUsers(),
            getAllHotelsForAdmin(),
          ]);
          ordersData.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
          setOrders(ordersData);
          setUsers(usersData);
          setHotels(hotelsData);
        } catch (error) {
          console.error("Failed to fetch data:", error);
        } finally {
          setLoading(false);
        }
      };

    return () => unsubscribe();
  }, [router]);
  
  const userMap = useMemo(() => new Map(users.map(user => [user.id, user.name])), [users]);
  const hotelMap = useMemo(() => new Map(hotels.map(hotel => [hotel.id, hotel.name])), [hotels]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    return orders.filter(order => {
        const customerName = userMap.get(order.customerId)?.toLowerCase() || '';
        const hotelName = hotelMap.get(order.hotelId)?.toLowerCase() || '';
        const lowercasedTerm = searchTerm.toLowerCase();

        return (
            order.id.toLowerCase().includes(lowercasedTerm) ||
            customerName.includes(lowercasedTerm) ||
            hotelName.includes(lowercasedTerm)
        );
    });
  }, [orders, searchTerm, userMap, hotelMap]);

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
                <div className="relative mb-4">
                    <Skeleton className="h-10 w-full md:w-1/3" />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {[...Array(6)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            {[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
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
          Search and manage all orders across the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by Order ID, Customer, or Hotel..."
              className="pl-10 w-full md:w-1/3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Hotel</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{userMap.get(order.customerId) || 'N/A'}</TableCell>
                  <TableCell>{hotelMap.get(order.hotelId) || 'N/A'}</TableCell>
                  <TableCell>{format(new Date(order.orderDate), "PPP")}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    {renderStatusBadge(order.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/orders/${order.id}`}>
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
