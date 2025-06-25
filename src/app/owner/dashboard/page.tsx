
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
import { Activity, Users, BedDouble, Utensils } from "lucide-react";
import { IncomeChart } from '@/components/owner/income-chart';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getOrdersByHotelOwner } from "@/lib/firebase/orders";
import type { Order } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from 'date-fns';

export default function OwnerDashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchData(currentUser.uid);
      } else {
        router.push('/login');
      }
    });

    const fetchData = async (ownerId: string) => {
      setLoading(true);
      try {
        const ordersData = await getOrdersByHotelOwner(ownerId);
        ordersData.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        setOrders(ordersData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    return () => unsubscribe();
  }, [router]);


  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const bookings = orders.filter(o => o.type === 'room' || o.type === 'combined').length;
  const foodOrders = orders.filter(o => o.type === 'food' || o.type === 'combined').length;
  const uniqueCustomers = new Set(orders.map(o => o.customerId)).size;

  const stats = [
    { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: Activity },
    { title: "Bookings", value: bookings.toString(), icon: BedDouble },
    { title: "Food Orders", value: foodOrders.toString(), icon: Utensils },
    { title: "Customers", value: uniqueCustomers.toString(), icon: Users },
  ];

  const recentOrders = orders.slice(0, 5);
  
  if (loading) {
    return (
        <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-4">
                <IncomeChart />
            </div>
            <div className="lg:col-span-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>A list of your most recent bookings and food sales.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex justify-between items-center p-2">
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-5 w-16" />
                            </div>
                        ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
            <IncomeChart />
        </div>
        <div className="lg:col-span-3">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>A list of your most recent bookings and food sales.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {recentOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No recent orders.
                                    </TableCell>
                                </TableRow>
                             ) : (
                                recentOrders.map((order) => (
                                    <TableRow key={order.id}>
                                    <TableCell>
                                        <div className="font-medium truncate max-w-[120px]" title={order.customerId}>{`Cust: ${order.customerId.substring(0,8)}...`}</div>
                                        <div className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(order.orderDate), { addSuffix: true })}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">{order.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={order.status === 'completed' ? 'default' : order.status === 'confirmed' ? 'secondary' : 'destructive'} className="capitalize">{order.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                             )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
