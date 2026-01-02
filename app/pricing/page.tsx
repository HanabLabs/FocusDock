'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentForm } from '@/components/payment-form';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type PlanType = 'monthly' | 'lifetime' | 'donate';

export default function PricingPage() {
  const t = useTranslations('pricing');
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [donationAmount, setDonationAmount] = useState(5);

  const plans = [
    {
      id: 'monthly' as PlanType,
      name: t('monthly'),
      price: '$2.99',
      period: t('perMonth'),
      features: [
        t('features.spotify'),
        t('features.artistRankings'),
        t('features.advancedAnalytics'),
      ],
    },
    {
      id: 'lifetime' as PlanType,
      name: t('lifetime'),
      price: '$14.99',
      period: t('oneTime'),
      features: [
        t('features.spotify'),
        t('features.artistRankings'),
        t('features.advancedAnalytics'),
        t('features.prioritySupport'),
      ],
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-bold text-gradient mb-4">{t('title')}</h1>
          <Link
            href="/dashboard"
            className="inline-block text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </motion.div>

        {!selectedPlan ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Monthly & Lifetime Plans */}
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass-card p-8 relative ${
                  plan.popular ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gradient">
                    {plan.price}
                  </span>
                  <span className="text-gray-400 ml-2">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <svg
                        className="w-5 h-5 text-green-500"
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
                      {feature}
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPlan(plan.id)}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-glow transition-all duration-300"
                >
                  {plan.id === 'monthly' ? t('subscribe') : t('purchase')}
                </motion.button>
              </motion.div>
            ))}

            {/* Donate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-8"
            >
              <h3 className="text-2xl font-bold mb-2">{t('donate')}</h3>
              <p className="text-gray-400 mb-6">Support the development</p>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  {t('customAmount')}
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(Number(e.target.value))}
                  className="w-full accent-purple-500 mb-3"
                />
                <div className="text-center">
                  <span className="text-4xl font-bold text-gradient">
                    ${donationAmount}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedPlan('donate')}
                className="w-full py-3 glass glass-hover rounded-lg font-semibold transition-all duration-300"
              >
                {t('donateNow')}
              </motion.button>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto"
          >
            <button
              onClick={() => setSelectedPlan(null)}
              className="mb-6 text-gray-400 hover:text-white transition-colors"
            >
              ← Back to plans
            </button>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-6">
                {selectedPlan === 'monthly'
                  ? t('monthly')
                  : selectedPlan === 'lifetime'
                  ? t('lifetime')
                  : t('donate')}
              </h2>

              <Elements stripe={stripePromise}>
                <PaymentForm
                  planType={selectedPlan}
                  amount={
                    selectedPlan === 'monthly'
                      ? 2.99
                      : selectedPlan === 'lifetime'
                      ? 14.99
                      : donationAmount
                  }
                />
              </Elements>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
