
import { db } from '@/lib/firebase';
import { firebaseNotConfiguredError } from './auth';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import type { Order } from '@/lib/types';

export async function addOrder(orderData: Omit<Order, 'id'>) {
    if (!db) {
        throw new Error(firebaseNotConfiguredError);
    }
    const docRef = await addDoc(collection(db, 'orders'), orderData);
    return docRef.id;
}

export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
    if (!db) {
        throw new Error(firebaseNotConfiguredError);
    }
    const orders: Order[] = [];
    const q = query(collection(db, "orders"), where("customerId", "==", customerId), orderBy("orderDate", "desc"));
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
    const q = query(collection(db, "orders"), where("ownerId", "==", ownerId), orderBy("orderDate", "desc"));
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    return orders;
}
