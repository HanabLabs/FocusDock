'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentForm } from '@/components/payment-form';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type PlanType = 'monthly' | 'lifetime' | 'donate';

export default function PricingPage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [donationAmount, setDonationAmount] = useState(5);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingClientSecret, setIsLoadingClientSecret] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam === 'donate') {
      setSelectedPlan('donate');
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedPlan) {
      const amount =
        selectedPlan === 'monthly'
          ? 2.99
          : selectedPlan === 'lifetime'
          ? 14.99
          : donationAmount;

      setIsLoadingClientSecret(true);
      setErrorMessage(null);
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: selectedPlan,
          amount: Math.round(amount * 100), // Convert to cents
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
            setErrorMessage(null);
          } else if (data.error) {
            // Map API error messages to user-friendly i18n messages
            let message = data.error;
            if (data.error.includes('already have an active monthly subscription')) {
              message = t('pricing.alreadySubscribed');
            } else if (data.error.includes('already have a lifetime subscription')) {
              message = t('pricing.alreadyLifetime');
            } else if (data.error.includes('cannot subscribe to monthly plans')) {
              message = t('pricing.lifetimeCannotSubscribe');
            } else if (data.error.includes('cancel your monthly subscription')) {
              message = t('pricing.cancelMonthlyFirst');
            }
            setErrorMessage(message);
            setClientSecret(null);
          }
        })
        .catch((error) => {
          console.error('Error creating payment intent:', error);
          setErrorMessage(t('common.error'));
        })
        .finally(() => {
          setIsLoadingClientSecret(false);
        });
    } else {
      setClientSecret(null);
    }
  }, [selectedPlan, donationAmount]);

  const plans = [
    {
      id: 'monthly' as PlanType,
      name: t('pricing.monthly'),
      price: '$2.99',
      period: t('pricing.perMonth'),
      features: [
        t('pricing.features.spotify'),
        t('pricing.features.artistRankings'),
        t('pricing.features.advancedAnalytics'),
      ],
    },
    {
      id: 'lifetime' as PlanType,
      name: t('pricing.lifetime'),
      price: '$14.99',
      period: t('pricing.oneTime'),
      features: [
        t('pricing.features.spotify'),
        t('pricing.features.artistRankings'),
        t('pricing.features.advancedAnalytics'),
        t('pricing.features.prioritySupport'),
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
          <h1 className="text-5xl font-bold text-gradient mb-4">{t('pricing.title')}</h1>
          {!selectedPlan && (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 glass glass-hover rounded-lg transition-all hover:bg-white/10"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {t('pricing.backToDashboard')}
            </Link>
          )}
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
                onClick={() => setSelectedPlan(plan.id)}
                className={`glass-card p-8 relative cursor-pointer transition-all hover:scale-105 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] ${
                  plan.popular ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-semibold">
                    {t('pricing.mostPopular')}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(plan.id);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-glow transition-all duration-300"
                >
                  {plan.id === 'monthly' ? t('pricing.subscribe') : t('pricing.purchase')}
                </motion.button>
              </motion.div>
            ))}

            {/* Donate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setSelectedPlan('donate')}
              className="glass-card p-8 cursor-pointer transition-all hover:scale-105 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              <h3 className="text-2xl font-bold mb-2">{t('pricing.donate')}</h3>
              <p className="text-gray-400 mb-6">{t('pricing.supportDevelopment')}</p>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  {t('pricing.customAmount')}
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={donationAmount}
                  onChange={(e) => {
                    e.stopPropagation();
                    setDonationAmount(Number(e.target.value));
                  }}
                  onClick={(e) => e.stopPropagation()}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlan('donate');
                }}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-glow transition-all duration-300"
              >
                {t('pricing.donateNow')}
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
              className="inline-flex items-center gap-2 px-4 py-2 glass glass-hover rounded-lg transition-all hover:bg-white/10 mb-6"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {t('pricing.backToPlans')}
            </button>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-6">
                {selectedPlan === 'monthly'
                  ? t('pricing.monthly')
                  : selectedPlan === 'lifetime'
                  ? t('pricing.lifetime')
                  : t('pricing.donate')}
              </h2>

              {errorMessage ? (
                <div className="text-center py-8">
                  <div className="text-amber-400">{errorMessage}</div>
                </div>
              ) : isLoadingClientSecret ? (
                <div className="text-center py-8">
                  <div className="text-gray-400">{t('common.loading')}</div>
                </div>
              ) : clientSecret ? (
                <Elements
                  stripe={stripePromise}
                  options={{ clientSecret }}
                >
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
              ) : (
                <div className="text-center py-8">
                  <div className="text-red-400">
                    {t('common.error')}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
