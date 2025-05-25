import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Erro ao validar webhook:', err);
      return NextResponse.json(
        { error: 'Webhook error' },
        { status: 400 }
      );
    }

    // Lidar com diferentes eventos
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;

        // Atualizar status pro no Supabase
        if (subscription.status === 'active') {
          const { error } = await supabase.auth.admin.updateUserById(
            userId,
            {
              user_metadata: { is_pro: true }
            }
          );

          if (error) {
            console.error('Erro ao atualizar status pro:', error);
          }
        }
        break;

      case 'customer.subscription.deleted':
        const canceledSubscription = event.data.object as Stripe.Subscription;
        const canceledUserId = canceledSubscription.metadata.userId;

        // Remover status pro no Supabase
        const { error } = await supabase.auth.admin.updateUserById(
          canceledUserId,
          {
            user_metadata: { is_pro: false }
          }
        );

        if (error) {
          console.error('Erro ao remover status pro:', error);
        }
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 500 }
    );
  }
} 