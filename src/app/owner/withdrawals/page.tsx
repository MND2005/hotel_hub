'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from 'date-fns';

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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from '@/lib/firebase';
import { getOrdersByHotelOwner } from "@/lib/firebase/orders";
import { getWithdrawalsByOwner, addWithdrawalRequest } from "@/lib/firebase/withdrawals";
import type { Order, Withdrawal } from "@/lib/types";
import { useRouter } from "next/navigation";


export default function WithdrawalsPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchData = useCallback(async (ownerId: string) => {
    try {
        const [ordersData, withdrawalsData] = await Promise.all([
            getOrdersByHotelOwner(ownerId),
            getWithdrawalsByOwner(ownerId)
        ]);
        setOrders(ordersData);
        withdrawalsData.sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
        setWithdrawals(withdrawalsData);
    } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({ title: "Error", description: "Failed to load withdrawal data.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchData(currentUser.uid);
      } else {
        setLoading(false);
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router, fetchData]);


  const { balance, totalRevenue } = useMemo(() => {
    const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
    const totalWithdrawn = withdrawals
        .filter(w => w.status === 'approved')
        .reduce((acc, w) => acc + w.amount, 0);
    const pendingWithdrawals = withdrawals
        .filter(w => w.status === 'pending')
        .reduce((acc, w) => acc + w.amount, 0);

    const balance = totalRevenue - totalWithdrawn - pendingWithdrawals;
    return { balance, totalRevenue };
  }, [orders, withdrawals]);


  const withdrawalSchema = z.object({
    amount: z.coerce
      .number({ invalid_type_error: "Please enter a valid amount." })
      .positive("Amount must be greater than zero.")
      .min(1, "Minimum withdrawal is $1.00.")
      .max(balance, `Cannot withdraw more than your available balance of $${balance.toFixed(2)}.`),
  });

  const form = useForm<z.infer<typeof withdrawalSchema>>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof withdrawalSchema>) {
    if (!user) {
        toast({ title: "Error", description: "You are not logged in.", variant: "destructive" });
        return;
    }
    try {
        await addWithdrawalRequest(user.uid, values.amount);
        toast({ title: "Success", description: "Withdrawal request submitted." });
        form.reset({ amount: undefined });
        fetchData(user.uid);
    } catch (error) {
        console.error("Withdrawal request failed:", error);
        toast({ title: "Error", description: "Failed to submit request.", variant: "destructive" });
    }
  }
  
  if (loading) {
    return (
        <div className="grid gap-6 md:grid-cols-5">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-5 w-64 mt-2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-32" />
                    </CardFooter>
                </Card>
            </div>
            <div className="md:col-span-3">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-56" />
                        <Skeleton className="h-5 w-72 mt-2" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-5">
      <div className="md:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Request Withdrawal</CardTitle>
                <CardDescription>
                  Your current available balance is ${balance.toFixed(2)}
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
                        <Input type="number" placeholder="e.g., 500.00" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={form.formState.isSubmitting || balance <= 0}>
                    {form.formState.isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
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
              A record of your withdrawal requests. Total lifetime revenue: ${totalRevenue.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processed On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No withdrawal history found.
                    </TableCell>
                  </TableRow>
                ) : (
                  withdrawals.map((item) => (
                    <TableRow key={item.id}>
                       <TableCell>{format(new Date(item.requestDate), 'PPP')}</TableCell>
                      <TableCell>${item.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'pending' ? 'outline' : item.status === 'approved' ? 'default' : 'destructive'}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.processedDate ? format(new Date(item.processedDate), 'PPP') : '—'}</TableCell>
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
