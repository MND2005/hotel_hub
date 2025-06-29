
import { db, auth } from '@/lib/firebase';
import { firebaseNotConfiguredError } from './auth';
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import type { Hotel } from '@/lib/types';

export async function addHotel(hotelData: {
    name: string;
    address: string;
    description: string;
    latitude: number;
    longitude: number;
    isOpen: boolean;
    imageUrls: string[];
    features?: string[];
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
            imageUrls: data.imageUrls || [],
            features: data.features || [],
        } as Hotel);
    });
    return hotels;
}

export async function getHotel(hotelId: string): Promise<Hotel | null> {
    if (!db) {
        throw new Error(firebaseNotConfiguredError);
    }
    const hotelDocRef = doc(db, 'hotels', hotelId);
    const hotelDoc = await getDoc(hotelDocRef);
    if (hotelDoc.exists()) {
        const data = hotelDoc.data();
        return { 
            id: hotelDoc.id, 
            ...data,
            imageUrls: data.imageUrls || [],
            features: data.features || [],
        } as Hotel;
    }
    return null;
}

export async function updateHotel(hotelId: string, hotelData: Partial<Omit<Hotel, 'id' | 'ownerId'>>) {
    if (!db) {
        throw new Error(firebaseNotConfiguredError);
    }
    const hotelDocRef = doc(db, 'hotels', hotelId);
    await updateDoc(hotelDocRef, hotelData);
}

export async function getAllHotels(): Promise<Hotel[]> {
    if (!db) {
        throw new Error(firebaseNotConfiguredError);
    }

    const hotels: Hotel[] = [];
    const q = query(collection(db, "hotels"), where("isOpen", "==", true));
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        hotels.push({ 
            id: doc.id, 
            ...data,
            imageUrls: data.imageUrls || [],
            features: data.features || [],
        } as Hotel);
    });
    return hotels;
}


export async function getAllHotelsForAdmin(): Promise<Hotel[]> {
    if (!db) {
        throw new Error(firebaseNotConfiguredError);
    }

    const hotels: Hotel[] = [];
    const querySnapshot = await getDocs(collection(db, "hotels"));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        hotels.push({ 
            id: doc.id, 
            ...data,
            imageUrls: data.imageUrls || [],
            features: data.features || [],
        } as Hotel);
    });
    return hotels;
}
