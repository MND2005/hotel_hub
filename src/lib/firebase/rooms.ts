
import { db } from '@/lib/firebase';
import { firebaseNotConfiguredError } from './auth';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query } from 'firebase/firestore';
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
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
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
