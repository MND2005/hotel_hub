
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import type { Stripe } from 'stripe';
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { Order, Hotel } from '@/lib/types';

// Helper function to get hotel details using the Admin SDK
async function getHotelByAdmin(hotelId: string): Promise<Hotel | null> {
    if (!adminDb) {
        console.error('[Webhook] CRITICAL: Firebase Admin SDK is not initialized. Cannot get hotel.');
        throw new Error("Firebase Admin SDK is not initialized.");
    }
    
    console.log(`[Webhook] Admin-Getting hotel with ID: ${hotelId}`);
    const hotelDocRef = adminDb.collection('hotels').doc(hotelId);
    const hotelDoc = await hotelDocRef.get();

    if (hotelDoc.exists) {
        const data = hotelDoc.data();
        if (data) {
            console.log(`[Webhook] Admin-Found hotel: ${data.name}`);
            return {
                id: hotelDoc.id,
                ownerId: data.ownerId,
                name: data.name,
                address: data.address,
                description: data.description,
                latitude: data.latitude,
                longitude: data.longitude,
                isOpen: data.isOpen,
                imageUrls: data.imageUrls || [],
            } as Hotel;
        }
    }
    console.log(`[Webhook] Admin-Hotel with ID ${hotelId} not found.`);
    return null;
}

// Helper function to create an order using the Admin SDK
async function addOrderByAdmin(orderData: Omit<Order, 'id'>) {
    if (!adminDb) {
        console.error('[Webhook] CRITICAL: Firebase Admin SDK is not initialized. Cannot add order.');
        throw new Error("Firebase Admin SDK is not initialized.");
    }
    console.log('[Webhook] Admin-Adding order to Firestore with payload:', orderData);
    const docRef = await adminDb.collection('orders').add(orderData);
    console.log(`[Webhook] Admin-Order created with ID: ${docRef.id}`);
    return docRef.id;
}


export async function POST(req: Request) {
  console.log('--- [Webhook] Stripe event received ---');
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET is not set.');
    return new Response('Webhook secret not configured.', { status: 500 });
  }
  
  if (!adminDb) {
      console.error('[Webhook] Firestore admin DB is not available. Cannot process webhook.');
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

    if (!userId || !hotelId) {
        console.error(`[Webhook] Metadata is missing. User ID: ${userId}, Hotel ID: ${hotelId}`);
        return new Response('User ID or Hotel ID not found in session metadata.', { status: 400 });
    }
    console.log(`[Webhook] Metadata found - UserID: ${userId}, HotelID: ${hotelId}`);
    
    const total = session.amount_total ? session.amount_total / 100 : 0;

    try {
        console.log(`[Webhook] Attempting to fetch hotel with ID: ${hotelId}`);
        const hotel = await getHotelByAdmin(hotelId);
        
        if (!hotel || !hotel.ownerId) {
            console.error(`[Webhook] CRITICAL: Hotel with ID ${hotelId} not found or has no ownerId.`);
            return new Response(`Webhook Error: Hotel not found or is misconfigured`, { status: 404 });
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

        console.log('[Webhook] Attempting to create order in Firestore...');
        await addOrderByAdmin(orderPayload);
        
        console.log(`[Webhook] SUCCESS: Order created in Firestore for user ${userId}.`);
    } catch (error: any) {
        console.error('[Webhook] CRITICAL: Failed to process order in database.', error);
        return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
