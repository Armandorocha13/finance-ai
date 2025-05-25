import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, email } = await req.json();

    // Criar ou recuperar cliente no Stripe
    let stripeCustomer = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    let customerId: string;

    if (stripeCustomer.data.length === 0) {
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          supabaseUserId: userId,
        },
      });
      customerId = customer.id;
    } else {
      customerId = stripeCustomer.data[0].id;
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?canceled=true`,
      metadata: {
        userId: userId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    return NextResponse.json(
      { error: 'Erro ao criar sessão de checkout' },
      { status: 500 }
    );
  }
} 