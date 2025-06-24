
'use server';

import { adminDb } from '@/lib/firebase-admin';
import type { Hotel } from '@/lib/types';

export async function getHotelByAdmin(hotelId: string): Promise<Hotel | null> {
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
