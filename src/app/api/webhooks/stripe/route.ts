
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import type { Stripe } from 'stripe';
import { NextResponse } from 'next/server';
import { addOrderByAdmin } from '@/lib/firebase/orders-admin';
import { getHotelByAdmin } from '@/lib/firebase/hotels-admin';

export async function POST(req: Request) {
  console.log('--- Stripe webhook received ---');
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
    console.log('Processing checkout.session.completed event...');
    if (!session?.metadata?.userId || !session?.metadata?.hotelId) {
        console.error('User ID or Hotel ID not found in session metadata.');
        return new Response('User ID or Hotel ID not found in session metadata.', { status: 400 });
    }
    
    const userId = session.metadata.userId;
    const hotelId = session.metadata.hotelId;
    const total = session.amount_total ? session.amount_total / 100 : 0;
    
    const items = JSON.parse(session.metadata.items); 
    const type = session.metadata.type as 'room' | 'food' | 'combined';

    try {
        const hotel = await getHotelByAdmin(hotelId);
        if (!hotel) {
            console.error(`Webhook Error: Hotel with ID ${hotelId} not found.`);
            return new Response(`Webhook Error: Hotel not found`, { status: 400 });
        }

        // Use the admin function to create the order, bypassing security rules
        await addOrderByAdmin({
            customerId: userId,
            hotelId,
            ownerId: hotel.ownerId,
            items,
            total,
            status: 'confirmed',
            orderDate: new Date().toISOString(),
            type,
            stripeCheckoutSessionId: session.id,
        });
        console.log(`Order created successfully for user ${userId} via Admin SDK`);
    } catch (error) {
        console.error('Failed to create order in database', error);
        return new Response('Failed to create order in database', { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
