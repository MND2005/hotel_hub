'use client';

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
import type { Withdrawal } from "@/lib/types";
import { updateWithdrawalStatus } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useTransition } from "react";

export function WithdrawalClient({ withdrawals, userMap }: { withdrawals: Withdrawal[], userMap: Map<string, string> }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (id: string, status: 'approved' | 'denied') => {
    startTransition(async () => {
      const result = await updateWithdrawalStatus(id, status);
      if (result.success) {
        toast({
          title: "Success",
          description: `Withdrawal has been ${status}.`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update status.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Owner</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date Requested</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {withdrawals.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              No withdrawal requests found.
            </TableCell>
          </TableRow>
        ) : (
          withdrawals.map((withdrawal) => (
            <TableRow key={withdrawal.id}>
              <TableCell className="font-medium">{userMap.get(withdrawal.ownerId) || 'Unknown'}</TableCell>
              <TableCell>${withdrawal.amount.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={withdrawal.status === 'pending' ? 'outline' : withdrawal.status === 'approved' ? 'default' : 'destructive'}>
                  {withdrawal.status}
                </Badge>
              </TableCell>
              <TableCell>{format(new Date(withdrawal.requestDate), 'PPP')}</TableCell>
              <TableCell className="text-right">
                {withdrawal.status === 'pending' && (
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => handleUpdate(withdrawal.id, 'denied')} disabled={isPending}>Deny</Button>
                    <Button size="sm" onClick={() => handleUpdate(withdrawal.id, 'approved')} disabled={isPending}>Approve</Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
