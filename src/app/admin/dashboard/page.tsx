
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
import { Users, DollarSign, Activity, Landmark, Hotel, ShoppingCart, HelpCircle, TrendingUp } from "lucide-react";
import { getAllUsers } from "@/lib/firebase/users";
import { getAllWithdrawals } from "@/lib/firebase/withdrawals";
import { getAllOrders } from "@/lib/firebase/orders";
import { getAllHotelsForAdmin } from "@/lib/firebase/hotels";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import type { User, Withdrawal, Order, Hotel as HotelType } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchData = async () => {
          try {
            const [usersData, withdrawalsData, ordersData, hotelsData] = await Promise.all([
              getAllUsers(),
              getAllWithdrawals(),
              getAllOrders(),
              getAllHotelsForAdmin(),
            ]);
            setUsers(usersData);
            setWithdrawals(withdrawalsData);
            setOrders(ordersData);
            setHotels(hotelsData);
          } catch (error) {
            console.error("Failed to fetch admin data", error);
          } finally {
            setLoading(false);
          }
        };
        fetchData();
      } else {
        setLoading(false);
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalWithdrawn = withdrawals
    .filter((w) => w.status === "approved")
    .reduce((sum, w) => sum + w.amount, 0);
  const platformIncome = totalWithdrawn * 0.05;
  const expectedPlatformIncome = totalRevenue * 0.05;
  const pendingWithdrawalCount = withdrawals.filter(w => w.status === 'pending').length;
  const totalHotels = hotels.length;
  const totalOrders = orders.length;

  const stats = [
    { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign },
    { title: "Expected Platform Income", value: `$${expectedPlatformIncome.toFixed(2)}`, icon: TrendingUp },
    { title: "Total Withdrawn", value: `$${totalWithdrawn.toFixed(2)}`, icon: Landmark },
    { title: "Platform Income", value: `$${platformIncome.toFixed(2)}`, icon: Activity },
    { title: "Pending Withdrawals", value: pendingWithdrawalCount.toString(), icon: HelpCircle },
    { title: "Total Users", value: users.length.toString(), icon: Users },
    { title: "Total Hotels", value: totalHotels.toString(), icon: Hotel },
    { title: "Total Orders", value: totalOrders.toString(), icon: ShoppingCart },
  ];

  const recentUsers = users
    .sort(
      (a, b) =>
        new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime()
    )
    .slice(0, 5)
    .map((user) => ({
      id: user.id,
      description: `${user.name} joined as a ${user.role}.`,
      time: formatDistanceToNow(new Date(user.joinedDate), {
        addSuffix: true,
      }),
      date: new Date(user.joinedDate),
    }));

  const recentActivity = [...recentUsers].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
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
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              An overview of the latest platform events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-1/4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            An overview of the latest platform events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center h-24">
                    No recent activity.
                  </TableCell>
                </TableRow>
              ) : (
                recentActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">
                      {activity.description}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {activity.time}
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
