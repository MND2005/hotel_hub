
import { db } from '@/lib/firebase';
import { adminDb } from '@/lib/firebase-admin';
import { firebaseNotConfiguredError } from './auth';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import type { Order } from '@/lib/types';

// This function uses the CLIENT SDK and is subject to security rules.
// It should be used for any client-side operations that are allowed.
export async function addOrder(orderData: Omit<Order, 'id'>) {
    if (!db) {
        throw new Error(firebaseNotConfiguredError);
    }
    const docRef = await addDoc(collection(db, 'orders'), orderData);
    return docRef.id;
}

// This new function uses the ADMIN SDK to create an order, bypassing security rules.
// It should ONLY be called from a trusted server environment (like our Stripe webhook).
export async function addOrderByAdmin(orderData: Omit<Order, 'id'>) {
    const docRef = await adminDb.collection('orders').add(orderData);
    return docRef.id;
}


export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
    if (!db) {
        throw new Error(firebaseNotConfiguredError);
    }
    const orders: Order[] = [];
    const q = query(collection(db, "orders"), where("customerId", "==", customerId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    return orders;
}

export async function getOrdersByHotelOwner(ownerId: string): Promise<Order[]> {
    if (!db) {
        throw new Error(firebaseNotConfiguredError);
    }
    
    const orders: Order[] = [];
    const q = query(collection(db, "orders"), where("ownerId", "==", ownerId));
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    return orders;
}
