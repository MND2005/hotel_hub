'use server';

import { adminDb } from '@/lib/firebase-admin';
import type { Order } from '@/lib/types';

// This function uses the ADMIN SDK to create an order, bypassing security rules.
// It should ONLY be called from a trusted server environment (like our Stripe webhook).
export async function addOrderByAdmin(orderData: Omit<Order, 'id'>) {
    if (!adminDb) {
        throw new Error("Firebase Admin SDK is not initialized. Cannot add order.");
    }
    const docRef = await adminDb.collection('orders').add(orderData);
    return docRef.id;
}
