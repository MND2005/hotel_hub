
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import type { Stripe } from 'stripe';
import { NextResponse } from 'next/server';
import { addOrder } from '@/lib/firebase/orders';
import { getHotel } from '@/lib/firebase/hotels';

export async function POST(req: Request) {
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
    if (!session?.metadata?.userId) {
        console.error('User ID not found in session metadata.');
        return new Response('User ID not found in session metadata.', { status: 400 });
    }
    
    const userId = session.metadata.userId;
    const hotelId = session.metadata.hotelId;
    const total = session.amount_total ? session.amount_total / 100 : 0;
    
    const items = JSON.parse(session.metadata.items); 
    const type = session.metadata.type as 'room' | 'food' | 'combined';

    try {
        const hotel = await getHotel(hotelId);
        if (!hotel) {
            console.error(`Webhook Error: Hotel with ID ${hotelId} not found.`);
            return new Response(`Webhook Error: Hotel not found`, { status: 400 });
        }

        await addOrder({
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
    } catch (error) {
        console.error('Failed to create order in database', error);
        return new Response('Failed to create order in database', { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
