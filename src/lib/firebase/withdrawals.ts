import { db } from '@/lib/firebase';
import { firebaseNotConfiguredError } from './auth';
import { collection, getDocs, query, doc, updateDoc, where, addDoc } from 'firebase/firestore';
import type { Withdrawal } from '@/lib/types';

export async function getAllWithdrawals(): Promise<Withdrawal[]> {
    if (!db) {
        throw new Error(firebaseNotConfiguredError);
    }
    const withdrawals: Withdrawal[] = [];
    const q = query(collection(db, "withdrawals"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        withdrawals.push({ id: doc.id, ...doc.data() } as Withdrawal);
    });
    // Sort client-side to avoid needing a composite index
    withdrawals.sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
    return withdrawals;
}

export async function getWithdrawalsByOwner(ownerId: string): Promise<Withdrawal[]> {
    if (!db) {
        throw new Error(firebaseNotConfiguredError);
    }
    const withdrawals: Withdrawal[] = [];
    const q = query(collection(db, "withdrawals"), where("ownerId", "==", ownerId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        withdrawals.push({ id: doc.id, ...doc.data() } as Withdrawal);
    });
    return withdrawals;
}

export async function addWithdrawalRequest(ownerId: string, amount: number) {
    if (!db) {
        throw new Error(firebaseNotConfiguredError);
    }
    const newWithdrawal: Omit<Withdrawal, 'id' | 'processedDate'> = {
        ownerId,
        amount,
        status: 'pending',
        requestDate: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'withdrawals'), newWithdrawal);
    return docRef.id;
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
