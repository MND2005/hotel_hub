'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const withdrawalSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive."),
});

const withdrawalHistory: any[] = [];

export default function WithdrawalsPage() {
  const form = useForm<z.infer<typeof withdrawalSchema>>({
    resolver: zodResolver(withdrawalSchema),
  });

  function onSubmit(values: z.infer<typeof withdrawalSchema>) {
    console.log(values);
  }

  return (
    <div className="grid gap-6 md:grid-cols-5">
      <div className="md:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Request Withdrawal</CardTitle>
                <CardDescription>
                  Your current balance is $0.00
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 500.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit">Submit Request</Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
      <div className="md:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
            <CardDescription>
              A record of your past withdrawal requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawalHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No withdrawal history found.
                    </TableCell>
                  </TableRow>
                ) : (
                  withdrawalHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>${item.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'pending' ? 'outline' : item.status === 'approved' ? 'default' : 'destructive'}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.date}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
