import { loadStripe } from '@stripe/stripe-js';

// Substitua pela sua chave pública do Stripe
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export const PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID; 