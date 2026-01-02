'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';

interface PaymentFormProps {
  planType: 'monthly' | 'lifetime' | 'donate';
  amount: number;
}

export function PaymentForm({ planType, amount }: PaymentFormProps) {
  const t = useTranslations('pricing');
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType,
          amount: Math.round(amount * 100), // Convert to cents
        }),
      });

      const { clientSecret } = await response.json();

      // Confirm payment
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold mb-2">{t('thankYou')}</h3>
        <p className="text-gray-400">{t('paymentSuccess')}</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Amount</span>
          <span className="text-2xl font-bold text-gradient">${amount}</span>
        </div>
      </div>

      <div className="glass rounded-lg p-6">
        <PaymentElement />
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">
          {error}
        </div>
      )}

      <motion.button
        type="submit"
        disabled={!stripe || isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-glow transition-all duration-300 disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : `Pay $${amount}`}
      </motion.button>

      <p className="text-xs text-gray-500 text-center">
        Secured by Stripe. Your payment information is encrypted and secure.
      </p>
    </form>
  );
}
