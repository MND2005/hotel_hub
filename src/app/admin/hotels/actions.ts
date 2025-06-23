'use server';

import { updateHotel } from '@/lib/firebase/hotels';
import { revalidatePath } from 'next/cache';

export async function toggleHotelStatus(hotelId: string, currentStatus: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await updateHotel(hotelId, { isOpen: !currentStatus });
    // Revalidate paths that display hotel lists or details
    revalidatePath('/admin/hotels');
    revalidatePath('/customer');
    return { success: true };
  } catch (error: any) {
    console.error("Error toggling hotel status:", error);
    return { success: false, error: 'Failed to update hotel status.' };
  }
}
