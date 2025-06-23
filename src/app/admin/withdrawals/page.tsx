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

const withdrawals = [
  { id: "WDR-001", hotelId: "HTL-002", amount: 500.00, status: "pending", requested: "2023-05-01" },
  { id: "WDR-002", hotelId: "HTL-001", amount: 1250.75, status: "approved", requested: "2023-04-28" },
  { id: "WDR-003", hotelId: "HTL-003", amount: 300.50, status: "denied", requested: "2023-04-25" },
  { id: "WDR-004", hotelId: "HTL-004", amount: 780.00, status: "pending", requested: "2023-05-02" },
];

export default function WithdrawalsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdrawal Requests</CardTitle>
        <CardDescription>Review and process withdrawal requests from hotel owners.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Hotel ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Requested</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.map((withdrawal) => (
              <TableRow key={withdrawal.id}>
                <TableCell className="font-medium">{withdrawal.id}</TableCell>
                <TableCell>{withdrawal.hotelId}</TableCell>
                <TableCell>${withdrawal.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={withdrawal.status === 'pending' ? 'outline' : withdrawal.status === 'approved' ? 'default' : 'destructive'}>
                    {withdrawal.status}
                  </Badge>
                </TableCell>
                <TableCell>{withdrawal.requested}</TableCell>
                <TableCell className="text-right">
                  {withdrawal.status === 'pending' && (
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline">Deny</Button>
                      <Button size="sm">Approve</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
