import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const userId = paymentIntent.metadata.supabase_user_id;
        const planType = paymentIntent.metadata.plan_type;

        // Only handle lifetime and donations (monthly subscriptions are handled by invoice.payment_succeeded)
        if (userId && planType && planType !== 'donate' && planType !== 'monthly') {
          if (planType === 'lifetime') {
            // Check if user already has lifetime subscription
            const { data: profile } = await supabaseAdmin
              .from('user_profiles')
              .select('subscription_tier')
              .eq('id', userId)
              .single();

            // Only update if not already lifetime (prevent overwriting)
            if (profile && profile.subscription_tier !== 'lifetime') {
              await supabaseAdmin
                .from('user_profiles')
                .update({ subscription_tier: 'lifetime' })
                .eq('id', userId);
            }
          }
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Get subscription to check metadata
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata.supabase_user_id;

          if (userId) {
            // Check if user already has lifetime subscription
            const { data: profile } = await supabaseAdmin
              .from('user_profiles')
              .select('subscription_tier')
              .eq('id', userId)
              .single();

            // Only update to monthly if not lifetime (lifetime takes priority)
            if (profile && profile.subscription_tier !== 'lifetime') {
              await supabaseAdmin
                .from('user_profiles')
                .update({ subscription_tier: 'monthly' })
                .eq('id', userId);
            }
          }
        }

        break;
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customer ID
        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          if (event.type === 'customer.subscription.deleted') {
            // Subscription cancelled - downgrade to free
            await supabaseAdmin
              .from('user_profiles')
              .update({ subscription_tier: 'free' })
              .eq('id', profile.id);
          } else if (subscription.status === 'active') {
            // Subscription is active - ensure user has monthly tier
            const userId = subscription.metadata.supabase_user_id;
            if (userId) {
              await supabaseAdmin
                .from('user_profiles')
                .update({ subscription_tier: 'monthly' })
                .eq('id', userId);
            }
          }
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
