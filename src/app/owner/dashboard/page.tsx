
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
import { Activity, DollarSign, Landmark, ShoppingCart } from "lucide-react";
import { IncomeChart } from '@/components/owner/income-chart';
import { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getOrdersByHotelOwner } from "@/lib/firebase/orders";
import { getWithdrawalsByOwner } from "@/lib/firebase/withdrawals";
import type { Order, Withdrawal } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { format, formatDistanceToNow, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OwnerDashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
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
        const [ordersData, withdrawalsData] = await Promise.all([
          getOrdersByHotelOwner(ownerId),
          getWithdrawalsByOwner(ownerId),
        ]);
        ordersData.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        setOrders(ordersData);
        setWithdrawals(withdrawalsData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    return () => unsubscribe();
  }, [router]);


  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const totalOrders = orders.length;
  
  const totalWithdrawn = withdrawals
    .filter(w => w.status === 'approved')
    .reduce((acc, w) => acc + w.amount, 0);

  const pendingWithdrawals = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((acc, w) => acc + w.amount, 0);

  const withdrawableBalance = totalRevenue - totalWithdrawn - pendingWithdrawals;

  const chartData = useMemo(() => {
    const monthlyRevenue: { [key: string]: number } = {};
    orders.forEach(order => {
      const monthKey = format(new Date(order.orderDate), 'yyyy-MM');
      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = 0;
      }
      monthlyRevenue[monthKey] += order.total;
    });
    
    const lastFiveMonths = [];
    const today = new Date();
    for (let i = 4; i >= 0; i--) {
        const month = subMonths(today, i);
        lastFiveMonths.push({
            name: format(month, 'MMM'),
            key: format(month, 'yyyy-MM'),
        });
    }

    return lastFiveMonths.map(month => ({
        name: month.name,
        total: monthlyRevenue[month.key] || 0,
    }));
  }, [orders]);

  const stats = [
    { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: Activity },
    { title: "Total Withdrawn", value: `$${totalWithdrawn.toFixed(2)}`, icon: Landmark },
    { title: "Withdrawable Balance", value: `$${withdrawableBalance.toFixed(2)}`, icon: DollarSign },
    { title: "Total Orders", value: totalOrders.toString(), icon: ShoppingCart },
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
                <IncomeChart data={[]} />
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
            <IncomeChart data={chartData} />
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
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {recentOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
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
                                    <TableCell className="text-right">
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={`/owner/orders/${order.id}`}>View</Link>
                                        </Button>
                                    </TableCell>
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
