import { db } from '@/lib/firebase';
import { firebaseNotConfiguredError } from './auth';
import { collection, getDocs, query, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';

export async function getAllUsers(): Promise<User[]> {
    if (!db) {
        throw new Error(firebaseNotConfiguredError);
    }
    const users: User[] = [];
    const q = query(collection(db, "users"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as User);
    });
    return users;
}

export async function getUser(userId: string): Promise<User | null> {
    if (!db) {
        throw new Error(firebaseNotConfiguredError);
    }
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
}

export async function updateUser(userId: string, data: Partial<Pick<User, 'name'>>) {
    if (!db) {
        throw new Error(firebaseNotConfiguredError);
    }
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, data);
}

export async function deleteUserDocument(userId: string): Promise<void> {
    if (!db) {
        throw new Error(firebaseNotConfiguredError);
    }
    const userDocRef = doc(db, 'users', userId);
    await deleteDoc(userDocRef);
}
