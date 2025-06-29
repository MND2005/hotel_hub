
'use server';

import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import type { Room, MenuItem } from '@/lib/types';

export async function createCheckoutSession(
    userId: string,
    hotelId: string,
    bookedRooms: Record<string, { room: Room, quantity: number }>,
    foodOrder: Record<string, { item: MenuItem, quantity: number }>
 ) {
    if (!userId) {
        throw new Error('You must be logged in to make a purchase.');
    }

    const appUrl = headers().get('origin') || process.env.NEXT_PUBLIC_APP_URL!;

    const line_items = [];
    const orderItems = [];
    let orderType: 'room' | 'food' | 'combined' = 'food';

    if (Object.keys(bookedRooms).length > 0) {
        orderType = 'room';
        for (const { room, quantity } of Object.values(bookedRooms)) {
            line_items.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: room.type,
                        description: 'Hotel Room Booking',
                        images: room.imageUrls.length > 0 ? [room.imageUrls[0]] : [],
                    },
                    unit_amount: room.price * 100,
                },
                quantity: quantity,
            });
            orderItems.push({ type: 'room', id: room.id, name: room.type, quantity, price: room.price });
        }
    }

    if (Object.keys(foodOrder).length > 0) {
        for (const { item, quantity } of Object.values(foodOrder)) {
            line_items.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        description: item.description,
                        images: item.imageUrl ? [item.imageUrl] : [],
                    },
                    unit_amount: item.price * 100,
                },
                quantity: quantity,
            });
            orderItems.push({ type: 'food', id: item.id, name: item.name, quantity, price: item.price });
        }
        orderType = orderType === 'room' ? 'combined' : 'food';
    }

    if (line_items.length === 0) {
        throw new Error('Cannot create checkout session for an empty cart.');
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: line_items,
        mode: 'payment',
        success_url: `${appUrl}/customer/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/customer/hotels/${hotelId}`,
        metadata: {
            userId: userId,
            hotelId,
            items: JSON.stringify(orderItems),
            type: orderType,
        },
    });

    return { sessionId: session.id };
}
