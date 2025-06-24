
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import type { Stripe } from 'stripe';
import { NextResponse } from 'next/server';
import { addOrderByAdmin } from '@/lib/firebase/orders-admin';
import { getHotelByAdmin } from '@/lib/firebase/hotels-admin';

export async function POST(req: Request) {
  console.log('--- [Webhook] Stripe event received ---');
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET is not set.');
    return new Response('Webhook secret not configured.', { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`[Webhook] Event constructed successfully: ${event.type}`);
  } catch (err: any) {
    console.error(`[Webhook] Signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(`[Webhook] Processing checkout.session.completed for session: ${session.id}`);

    const { userId, hotelId, items, type } = session.metadata || {};

    if (!userId || !hotelId) {
        console.error(`[Webhook] Metadata is missing. User ID: ${userId}, Hotel ID: ${hotelId}`);
        return new Response('User ID or Hotel ID not found in session metadata.', { status: 400 });
    }
    console.log(`[Webhook] Metadata found - UserID: ${userId}, HotelID: ${hotelId}`);
    
    const total = session.amount_total ? session.amount_total / 100 : 0;

    try {
        console.log(`[Webhook] Attempting to fetch hotel with ID: ${hotelId}`);
        const hotel = await getHotelByAdmin(hotelId);
        
        if (!hotel) {
            console.error(`[Webhook] CRITICAL: Hotel with ID ${hotelId} not found using Admin SDK.`);
            return new Response(`Webhook Error: Hotel not found`, { status: 404 });
        }
        console.log(`[Webhook] Hotel found: ${hotel.name}, OwnerID: ${hotel.ownerId}`);

        const orderPayload = {
            customerId: userId,
            hotelId,
            ownerId: hotel.ownerId,
            items: JSON.parse(items || '[]'),
            total,
            status: 'confirmed' as const,
            orderDate: new Date().toISOString(),
            type: type as 'room' | 'food' | 'combined',
            stripeCheckoutSessionId: session.id,
        };

        console.log('[Webhook] Attempting to create order in Firestore with payload:', orderPayload);
        await addOrderByAdmin(orderPayload);
        
        console.log(`[Webhook] SUCCESS: Order created in Firestore for user ${userId}.`);
    } catch (error) {
        console.error('[Webhook] CRITICAL: Failed to create order in database.', error);
        // It's better to return a 500 here so Stripe retries.
        return new Response('Internal Server Error: Failed to create order in database.', { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
