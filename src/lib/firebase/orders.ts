
import { db } from '@/lib/firebase';
import { firebaseNotConfiguredError } from './auth';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { getHotelsByOwner } from './hotels';

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
    
    const ownerHotels = await getHotelsByOwner(ownerId);
    if (ownerHotels.length === 0) {
        return [];
    }
    const hotelIds = ownerHotels.map(h => h.id);

    if (hotelIds.length === 0) return [];
    
    const orders: Order[] = [];
    // Firestore 'in' query is limited to 30 items. For this app, that should be sufficient.
    const q = query(collection(db, "orders"), where("hotelId", "in", hotelIds), orderBy("orderDate", "desc"));
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    return orders;
}
