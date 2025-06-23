import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllWithdrawals } from "@/lib/firebase/withdrawals";
import { getAllUsers } from "@/lib/firebase/users";
import { WithdrawalClient } from "./client";

export default async function WithdrawalsPage() {
  const [withdrawals, users] = await Promise.all([
    getAllWithdrawals(),
    getAllUsers(),
  ]);

  const userMap = new Map(users.map((user) => [user.id, user.name]));

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
