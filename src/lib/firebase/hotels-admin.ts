
'use server';

// This file is deprecated. The logic has been moved directly into the Stripe webhook
// at /src/app/api/webhooks/stripe/route.ts to simplify module resolution.

import { adminDb } from '@/lib/firebase-admin';
import type { Hotel } from '@/lib/types';

export async function getHotelByAdmin(hotelId: string): Promise<Hotel | null> {
    console.warn("getHotelByAdmin is deprecated. Use the internal function in the Stripe webhook.");
    if (!adminDb) {
        throw new Error("Firebase Admin SDK is not initialized. Cannot get hotel.");
    }
    
    const hotelDocRef = adminDb.collection('hotels').doc(hotelId);
    const hotelDoc = await hotelDocRef.get();

    if (hotelDoc.exists) {
        const data = hotelDoc.data();
        if (data) {
            return {
                id: hotelDoc.id,
                ownerId: data.ownerId,
                name: data.name,
                address: data.address,
                description: data.description,
                latitude: data.latitude,
                longitude: data.longitude,
                isOpen: data.isOpen,
                imageUrls: data.imageUrls || [],
            } as Hotel;
        }
    }
    return null;
}
