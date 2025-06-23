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

const stats = [
    { title: "Total Revenue", value: "$0.00", icon: Activity },
    { title: "Bookings", value: "0", icon: BedDouble },
    { title: "Food Orders", value: "0", icon: Utensils },
    { title: "New Customers", value: "0", icon: Users },
  ];

const recentOrders: any[] = [];

export default function OwnerDashboard() {
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
                                        <div className="font-medium">{order.customer}</div>
                                        <div className="text-sm text-muted-foreground">{order.date}</div>
                                    </TableCell>
                                    <TableCell>{order.type}</TableCell>
                                    <TableCell>
                                        <Badge variant={order.status === 'completed' ? 'default' : order.status === 'confirmed' ? 'outline' : 'destructive'}>{order.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">${order.amount.toFixed(2)}</TableCell>
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
