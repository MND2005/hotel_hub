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

export default async function AdminDashboard() {
  const [users, hotels, withdrawals] = await Promise.all([
    getAllUsers(),
    getAllHotelsForAdmin(),
    getAllWithdrawals(),
  ]);

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
