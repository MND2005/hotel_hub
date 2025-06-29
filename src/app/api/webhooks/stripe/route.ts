
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import type { Stripe } from 'stripe';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { getHotel } from '@/lib/firebase/hotels';
import { addOrder } from '@/lib/firebase/orders';
import { decrementRoomQuantity } from '@/lib/firebase/rooms';
import type { Order } from '@/lib/types';


export async function POST(req: Request) {
  // Check for required Stripe environment variables
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!process.env.STRIPE_SECRET_KEY || !webhookSecret) {
    console.error('[Webhook] ERROR: Stripe environment variables (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET) are not set.');
    return new Response('Webhook secret not configured.', { status: 500 });
  }

  console.log('--- [Webhook] Stripe event received ---');
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;
  
  if (!db) {
      console.error('[Webhook] Firestore client DB is not available. Cannot process webhook.');
      return new Response('Internal Server Error: Database connection failed.', { status: 500 });
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

    if (!userId || !hotelId || !items) {
        console.error(`[Webhook] Metadata is missing. User ID: ${userId}, Hotel ID: ${hotelId}, Items: ${items}`);
        return new Response('User ID, Hotel ID, or Items not found in session metadata.', { status: 400 });
    }
    console.log(`[Webhook] Metadata found - UserID: ${userId}, HotelID: ${hotelId}`);
    
    const total = session.amount_total ? session.amount_total / 100 : 0;
    const parsedItems = JSON.parse(items);

    try {
        console.log(`[Webhook] Attempting to fetch hotel with ID: ${hotelId}`);
        const hotel = await getHotel(hotelId);
        
        if (!hotel || !hotel.ownerId) {
            console.error(`[Webhook] CRITICAL: Hotel with ID ${hotelId} not found or has no ownerId.`);
            // Return 200 to Stripe to prevent retries for a misconfigured hotel, but log error.
            return NextResponse.json({ error: `Hotel not found or is misconfigured` });
        }
        console.log(`[Webhook] Hotel found: ${hotel.name}, OwnerID: ${hotel.ownerId}`);

        // This is what goes into the Order document. It's for display/record keeping.
        const orderItemsForDoc = parsedItems.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        }));

        const orderPayload: Omit<Order, 'id'> = {
            customerId: userId,
            hotelId,
            ownerId: hotel.ownerId,
            items: orderItemsForDoc,
            total,
            status: 'confirmed' as const,
            orderDate: new Date().toISOString(),
            type: type as 'room' | 'food' | 'combined',
            stripeCheckoutSessionId: session.id,
        };

        console.log('[Webhook] Attempting to create order in Firestore...');
        await addOrder(orderPayload);
        console.log(`[Webhook] SUCCESS: Order created in Firestore for user ${userId}.`);

        // After successfully creating the order, update inventory.
        // This makes the process more robust. If order creation fails, we don't touch inventory.
        console.log('[Webhook] Attempting to update room inventory...');
        for (const item of parsedItems) {
            if (item.type === 'room' && item.id && item.quantity > 0) {
                await decrementRoomQuantity(hotelId, item.id, item.quantity);
                console.log(`[Webhook] Decremented quantity for room ${item.id} by ${item.quantity}`);
            }
        }
        console.log('[Webhook] SUCCESS: Inventory updated.');

    } catch (error: any) {
        console.error('[Webhook] CRITICAL: Failed to process order in database.', error);
        return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
