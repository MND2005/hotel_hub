
import { db } from '@/lib/firebase';
import { firebaseNotConfiguredError } from './auth';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, runTransaction, increment } from 'firebase/firestore';
import type { Room } from '@/lib/types';

const getRoomsCollection = (hotelId: string) => {
    if (!db) throw new Error(firebaseNotConfiguredError);
    return collection(db, 'hotels', hotelId, 'rooms');
}

export async function addRoom(hotelId: string, roomData: Omit<Room, 'id'>) {
    const roomsCollection = getRoomsCollection(hotelId);
    const docRef = await addDoc(roomsCollection, roomData);
    return docRef.id;
}

export async function getRoomsByHotel(hotelId: string): Promise<Room[]> {
    const roomsCollection = getRoomsCollection(hotelId);
    const q = query(roomsCollection);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            imageUrls: data.imageUrls || [],
            features: data.features || [],
        } as Room;
    });
}

export async function updateRoom(hotelId: string, roomId: string, roomData: Partial<Omit<Room, 'id'>>) {
    if (!db) throw new Error(firebaseNotConfiguredError);
    const roomDoc = doc(db, 'hotels', hotelId, 'rooms', roomId);
    await updateDoc(roomDoc, roomData);
}

export async function deleteRoom(hotelId: string, roomId: string) {
    if (!db) throw new Error(firebaseNotConfiguredError);
    const roomDoc = doc(db, 'hotels', hotelId, 'rooms', roomId);
    await deleteDoc(roomDoc);
}

export async function decrementRoomQuantity(hotelId: string, roomId: string, quantityToDecrement: number) {
    if (!db) {
        throw new Error(firebaseNotConfiguredError);
    }
    const roomRef = doc(db, 'hotels', hotelId, 'rooms', roomId);

    try {
        await runTransaction(db, async (transaction) => {
            const roomDoc = await transaction.get(roomRef);
            if (!roomDoc.exists()) {
                throw new Error("Room does not exist!");
            }
            const currentQuantity = roomDoc.data().quantity || 0;
            if (currentQuantity < quantityToDecrement) {
                throw new Error(`Not enough rooms available to book. Requested: ${quantityToDecrement}, Available: ${currentQuantity}`);
            }
            transaction.update(roomRef, {
                quantity: increment(-quantityToDecrement)
            });
        });
        return { success: true };
    } catch (e: any) {
        console.error("Failed to decrement room quantity in transaction:", e);
        // This is a server-side operation. Re-throw the error so the calling service knows something went wrong.
        throw e;
    }
}
