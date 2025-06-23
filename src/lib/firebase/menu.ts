
import { db } from '@/lib/firebase';
import { firebaseNotConfiguredError } from './auth';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import type { MenuItem } from '@/lib/types';

const getMenuItemsCollection = (hotelId: string) => {
    if (!db) throw new Error(firebaseNotConfiguredError);
    return collection(db, 'hotels', hotelId, 'menuItems');
}

export async function addMenuItem(hotelId: string, menuItemData: Omit<MenuItem, 'id'>) {
    const menuItemsCollection = getMenuItemsCollection(hotelId);
    const docRef = await addDoc(menuItemsCollection, menuItemData);
    return docRef.id;
}

export async function getMenuItemsByHotel(hotelId: string): Promise<MenuItem[]> {
    const menuItemsCollection = getMenuItemsCollection(hotelId);
    const q = query(menuItemsCollection);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
}

export async function updateMenuItem(hotelId: string, menuItemId: string, menuItemData: Partial<Omit<MenuItem, 'id'>>) {
    if (!db) throw new Error(firebaseNotConfiguredError);
    const menuItemDoc = doc(db, 'hotels', hotelId, 'menuItems', menuItemId);
    await updateDoc(menuItemDoc, menuItemData);
}

export async function deleteMenuItem(hotelId: string, menuItemId: string) {
    if (!db) throw new Error(firebaseNotConfiguredError);
    const menuItemDoc = doc(db, 'hotels', hotelId, 'menuItems', menuItemId);
    await deleteDoc(menuItemDoc);
}
