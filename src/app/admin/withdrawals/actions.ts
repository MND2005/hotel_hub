'use server';

import { updateWithdrawalStatus as dbUpdateWithdrawalStatus } from '@/lib/firebase/withdrawals';
import { revalidatePath } from 'next/cache';

export async function updateWithdrawalStatus(withdrawalId: string, status: 'approved' | 'denied') {
  const result = await dbUpdateWithdrawalStatus(withdrawalId, status);
  if (result.success) {
    revalidatePath('/admin/withdrawals');
    revalidatePath('/admin/dashboard');
  }
  return result;
}
