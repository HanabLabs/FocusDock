'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Footer } from '@/components/footer';

export default function VerifyPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  // Get email from URL params or localStorage
  useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      if (emailParam) {
        setEmail(emailParam);
        localStorage.setItem('pendingVerificationEmail', emailParam);
      } else {
        const storedEmail = localStorage.getItem('pendingVerificationEmail');
        if (storedEmail) {
          setEmail(storedEmail);
        }
      }
    }
  });

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!email) {
      setMessage('Email is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear pending email and password
        localStorage.removeItem('pendingVerificationEmail');
        localStorage.removeItem('pendingPassword');
        // Redirect to login
        router.push('/auth/login?verified=true');
      } else {
        setMessage(data.error || 'Verification failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setMessage('An error occurred during verification');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setMessage('');

    if (!email) {
      setMessage('Email is required');
      setLoading(false);
      return;
    }

    // Get password from localStorage (temporary, in production use a more secure method)
    const password = localStorage.getItem('pendingPassword');
    if (!password) {
      setMessage('Please sign up again');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification code sent! Please check your email.');
      } else {
        setMessage(data.error || 'Failed to resend code');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setMessage('An error occurred while resending the code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-8 w-full max-w-md"
        >
          <h1 className="text-3xl font-bold text-gradient mb-2">Verify Your Email</h1>
          <p className="text-gray-400 mb-6">
            We've sent a verification code to <span className="font-medium text-gray-300">{email}</span>
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-2 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            {message && (
              <div className={`text-sm p-3 rounded-lg ${
                message.includes('sent') || message.includes('success')
                  ? 'text-green-400 bg-green-500/10'
                  : 'text-red-400 bg-red-500/10'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              Didn't receive the code? Resend
            </button>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/auth/signup"
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              ← Back to Sign Up
            </a>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

