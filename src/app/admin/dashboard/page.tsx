
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
import { Users, Hotel, DollarSign, Activity } from "lucide-react";
import { getAllUsers } from "@/lib/firebase/users";
import { getAllHotelsForAdmin } from "@/lib/firebase/hotels";
import { getAllWithdrawals } from "@/lib/firebase/withdrawals";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import type { User, Hotel as HotelType, Withdrawal } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, hotelsData, withdrawalsData] = await Promise.all([
          getAllUsers(),
          getAllHotelsForAdmin(),
          getAllWithdrawals(),
        ]);
        setUsers(usersData);
        setHotels(hotelsData);
        setWithdrawals(withdrawalsData);
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { title: "Total Users", value: users.length.toString(), icon: Users },
    { title: "Total Hotels", value: hotels.length.toString(), icon: Hotel },
    {
      title: "Pending Withdrawals",
      value: withdrawals.filter((w) => w.status === "pending").length.toString(),
      icon: DollarSign,
    },
    { title: "Total Revenue", value: "$0.00", icon: Activity },
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
