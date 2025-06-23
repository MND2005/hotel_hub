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

const withdrawals: any[] = [];

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
            {withdrawals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No withdrawal requests found.
                </TableCell>
              </TableRow>
            ) : (
              withdrawals.map((withdrawal) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
