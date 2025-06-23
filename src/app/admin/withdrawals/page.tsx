
'use client';

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
import { getAllWithdrawals } from "@/lib/firebase/withdrawals";
import { getAllUsers } from "@/lib/firebase/users";
import { WithdrawalClient } from "./client";
import { useState, useEffect } from "react";
import type { Withdrawal, User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if(user) {
            const fetchData = async () => {
                try {
                    const [withdrawalsData, usersData] = await Promise.all([
                    getAllWithdrawals(),
                    getAllUsers(),
                    ]);
                    setWithdrawals(withdrawalsData);
                    setUsers(usersData);
                } catch (error) {
                    console.error("Failed to fetch withdrawals and users", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        } else {
            setLoading(false);
            router.push('/login');
        }
    });
    return () => unsubscribe();
  }, [router]);


  const userMap = new Map(users.map((user) => [user.id, user.name]));

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96 mt-2" />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        {[...Array(5)].map((_, i) => (
                        <TableHead key={i}>
                            <Skeleton className="h-5 w-full" />
                        </TableHead>
                        ))}
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                        {[...Array(5)].map((_, j) => (
                            <TableCell key={j}>
                            <Skeleton className="h-5 w-full" />
                            </TableCell>
                        ))}
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdrawal Requests</CardTitle>
        <CardDescription>
          Review and process withdrawal requests from hotel owners.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <WithdrawalClient withdrawals={withdrawals} userMap={userMap} />
      </CardContent>
    </Card>
  );
}
