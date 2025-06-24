
'use server';

import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import type { Room, MenuItem } from '@/lib/types';

export async function createCheckoutSession(
    userId: string,
    hotelId: string,
    bookedRoom: Room | null, 
    foodOrder: Record<string, { item: MenuItem, quantity: number }>
 ) {
    if (!userId) {
        throw new Error('You must be logged in to make a purchase.');
    }

    const appUrl = headers().get('origin') || process.env.NEXT_PUBLIC_APP_URL!;

    const line_items = [];
    const orderItems = [];
    let orderType: 'room' | 'food' | 'combined' = 'food';

    if (bookedRoom) {
        line_items.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: `${bookedRoom.type} Room`,
                    description: '1 night stay',
                    images: bookedRoom.imageUrls.length > 0 ? [bookedRoom.imageUrls[0]] : [],
                },
                unit_amount: bookedRoom.price * 100,
            },
            quantity: 1,
        });
        orderItems.push({ name: bookedRoom.type, quantity: 1, price: bookedRoom.price });
        orderType = 'room';
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
            orderItems.push({ name: item.name, quantity, price: item.price });
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
