import { db } from '@/lib/firebase';
import { firebaseNotConfiguredError } from './auth';
import { collection, getDocs, query, doc, updateDoc, orderBy } from 'firebase/firestore';
import type { Withdrawal } from '@/lib/types';

export async function getAllWithdrawals(): Promise<Withdrawal[]> {
    if (!db) {
        throw new Error(firebaseNotConfiguredError);
    }
    const withdrawals: Withdrawal[] = [];
    const q = query(collection(db, "withdrawals"), orderBy("requestDate", "desc"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        withdrawals.push({ id: doc.id, ...doc.data() } as Withdrawal);
    });
    return withdrawals;
}

export async function updateWithdrawalStatus(withdrawalId: string, status: 'approved' | 'denied'): Promise<{ success: boolean, error?: string }> {
    if (!db) {
        return { success: false, error: firebaseNotConfiguredError };
    }
    try {
        const withdrawalDoc = doc(db, 'withdrawals', withdrawalId);
        await updateDoc(withdrawalDoc, {
            status,
            processedDate: new Date().toISOString(),
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
