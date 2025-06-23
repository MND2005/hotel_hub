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
import { Users, Hotel, DollarSign, Activity } from "lucide-react";

const stats = [
  { title: "Total Users", value: "1,250", icon: Users },
  { title: "Total Hotels", value: "150", icon: Hotel },
  { title: "Pending Withdrawals", value: "12", icon: DollarSign },
  { title: "Total Revenue", value: "$120,500", icon: Activity },
];

const recentActivity = [
  { id: 1, description: "New hotel 'Sunset Inn' joined.", time: "5m ago", type: 'hotel' },
  { id: 2, description: "User John Doe booked a room.", time: "10m ago", type: 'booking' },
  { id: 3, description: "Withdrawal request for $500 from 'Cozy Corner'.", time: "1h ago", type: 'withdrawal' },
  { id: 4, description: "New user signed up: jane.doe@email.com", time: "2h ago", type: 'user' },
];

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
              {recentActivity.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.description}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{activity.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
