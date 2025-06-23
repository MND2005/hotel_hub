import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";

const paymentHistory = [
    { id: "PAY-001", date: "2023-11-20", amount: 250.00, method: "Visa **** 4242" },
    { id: "PAY-002", date: "2023-11-18", amount: 45.50, method: "Mastercard **** 5678" },
    { id: "PAY-003", date: "2023-11-22", amount: 78.90, method: "Visa **** 4242" },
]

export default function CustomerProfilePage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>My Profile</CardTitle>
                        <CardDescription>Update your personal information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" defaultValue="Jane Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue="jane.doe@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input id="password" type="password" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button>Save Changes</Button>
                    </CardFooter>
                </Card>
            </div>
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Payment History</CardTitle>
                        <CardDescription>A record of all your transactions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Payment Method</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {paymentHistory.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell className="font-medium">{payment.id}</TableCell>
                                <TableCell>{payment.date}</TableCell>
                                <TableCell>${payment.amount.toFixed(2)}</TableCell>
                                <TableCell>{payment.method}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
