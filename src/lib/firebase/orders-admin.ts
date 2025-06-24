
'use server';

// This file is deprecated. The logic has been moved directly into the Stripe webhook
// at /src/app/api/webhooks/stripe/route.ts to simplify module resolution.

import { adminDb } from '@/lib/firebase-admin';
import type { Order } from '@/lib/types';

export async function addOrderByAdmin(orderData: Omit<Order, 'id'>) {
    console.warn("addOrderByAdmin is deprecated. Use the internal function in the Stripe webhook.");
    if (!adminDb) {
        throw new Error("Firebase Admin SDK is not initialized. Cannot add order.");
    }
    const docRef = await adminDb.collection('orders').add(orderData);
    return docRef.id;
}
