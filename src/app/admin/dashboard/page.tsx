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

const stats = [
  { title: "Total Users", value: "0", icon: Users },
  { title: "Total Hotels", value: "0", icon: Hotel },
  { title: "Pending Withdrawals", value: "0", icon: DollarSign },
  { title: "Total Revenue", value: "$0.00", icon: Activity },
];

const recentActivity: any[] = [];

export default function AdminDashboard() {
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

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>An overview of the latest platform events.</CardDescription>
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
                    <TableCell className="font-medium">{activity.description}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{activity.time}</TableCell>
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
