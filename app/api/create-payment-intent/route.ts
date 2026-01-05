import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planType, amount } = await request.json();

    // Get user profile to check subscription status
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id, subscription_tier')
      .eq('id', user.id)
      .single();

    // Prevent duplicate payments
    if (planType === 'monthly' && profile?.subscription_tier === 'monthly') {
      return NextResponse.json(
        { error: 'You already have an active monthly subscription' },
        { status: 400 }
      );
    }

    if (planType === 'monthly' && profile?.subscription_tier === 'lifetime') {
      return NextResponse.json(
        { error: 'Lifetime users cannot subscribe to monthly plans' },
        { status: 400 }
      );
    }

    if (planType === 'lifetime' && profile?.subscription_tier === 'lifetime') {
      return NextResponse.json(
        { error: 'You already have a lifetime subscription' },
        { status: 400 }
      );
    }

    // If user has monthly subscription and wants lifetime, cancel monthly first
    if (planType === 'lifetime' && profile?.subscription_tier === 'monthly') {
      // Check if user has active Stripe subscription
      if (profile?.stripe_customer_id) {
        const subscriptions = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: 'active',
        });

        if (subscriptions.data.length > 0) {
          return NextResponse.json(
            { error: 'Please cancel your monthly subscription before purchasing lifetime' },
            { status: 400 }
          );
        }
      }
    }

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      customerId = customer.id;

      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Handle monthly subscription
    if (planType === 'monthly') {
      const priceId = process.env.STRIPE_PRICE_ID_MONTHLY;
      
      if (!priceId) {
        return NextResponse.json(
          { error: 'Monthly price ID not configured' },
          { status: 500 }
        );
      }

      // Create subscription with incomplete payment
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          supabase_user_id: user.id,
          plan_type: planType,
        },
      });

      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        subscriptionId: subscription.id,
      });
    }

    // Handle lifetime or donation (one-time payment)
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customerId,
      metadata: {
        supabase_user_id: user.id,
        plan_type: planType,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
