
import { db, auth } from '@/lib/firebase';
import { firebaseNotConfiguredError } from './auth';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import type { Hotel } from '@/lib/types';

export async function addHotel(hotelData: {
    name: string;
    address: string;
    description: string;
    latitude: number;
    longitude: number;
    isOpen: boolean;
}) {
    if (!auth?.currentUser || !db) {
        throw new Error(firebaseNotConfiguredError);
    }

    const hotelPayload = {
        ...hotelData,
        ownerId: auth.currentUser.uid,
    };

    const docRef = await addDoc(collection(db, 'hotels'), hotelPayload);
    return docRef.id;
}


export async function getHotelsByOwner(ownerId: string): Promise<Hotel[]> {
    if (!db) {
        throw new Error(firebaseNotConfiguredError);
    }

    const hotels: Hotel[] = [];
    const q = query(collection(db, "hotels"), where("ownerId", "==", ownerId));
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        hotels.push({
            id: doc.id,
            ownerId: data.ownerId,
            name: data.name,
            address: data.address,
            description: data.description,
            latitude: data.latitude,
            longitude: data.longitude,
            isOpen: data.isOpen,
        } as Hotel);
    });
    return hotels;
}
