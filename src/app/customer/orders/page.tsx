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

const orders = [
  { id: "ORD-001", hotelId: "HTL-123", date: "2023-11-20", type: 'Room', total: 250.00, status: "completed" },
  { id: "ORD-002", hotelId: "HTL-456", date: "2023-11-18", type: 'Food', total: 45.50, status: "completed" },
  { id: "ORD-003", hotelId: "HTL-123", date: "2023-11-22", type: 'Food', total: 78.90, status: "confirmed" },
  { id: "ORD-004", hotelId: "HTL-789", date: "2023-11-15", type: 'Room', total: 480.00, status: "cancelled" },
  { id: "ORD-005", hotelId: "HTL-456", date: "2023-11-23", type: 'Room', total: 180.00, status: "pending" },
];

export default function CustomerOrdersPage() {
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
                <TableHead>Order ID</TableHead>
                <TableHead>Hotel ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>Hotel #{order.hotelId.split('-')[1]}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{order.type}</Badge>
                  </TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "completed"
                          ? "default"
                          : order.status === "pending"
                          ? "outline"
                          : order.status === "confirmed"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
