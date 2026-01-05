'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Send verification code
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store email and password temporarily for verification
        localStorage.setItem('pendingVerificationEmail', email);
        localStorage.setItem('pendingPassword', password);
        // Redirect to verification page
        router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
      } else {
        setMessage(data.error || 'Failed to send verification code');
        setLoading(false);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setMessage('An error occurred during signup');
      setLoading(false);
    }
  };

  const handleGitHubSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gradient">FocusDock</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setLocale('en')}
              className={`px-3 py-1 rounded text-sm transition-all ${
                locale === 'en'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                  : 'glass glass-hover'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale('ja')}
              className={`px-3 py-1 rounded text-sm transition-all ${
                locale === 'ja'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                  : 'glass glass-hover'
              }`}
            >
              日本語
            </button>
          </div>
        </div>
        <p className="text-gray-400 mb-8">{t('auth.signup')}</p>

        {!success ? (
          <>
            <form onSubmit={handleSignup} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('auth.password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  minLength={6}
                />
              </div>

              {message && !success && (
                <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-glow transition-all duration-300 disabled:opacity-50"
              >
                {loading ? t('common.loading') : t('auth.signup')}
              </button>
            </form>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-gray-400">or</span>
              </div>
            </div>

            <button
              onClick={handleGitHubSignup}
              className="w-full py-3 glass glass-hover rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              {t('auth.loginWithGitHub')}
            </button>
          </>
        ) : (
          <div className="text-center">
            <div className="text-sm text-green-400 bg-green-500/10 p-4 rounded-lg mb-6">
              {message}
            </div>
            <p className="text-gray-400 text-sm">
              Please check your email and click the confirmation link to complete your registration.
            </p>
          </div>
        )}

        <p className="text-center text-sm text-gray-400 mt-6">
          {t('auth.hasAccount')}{' '}
          <a href="/auth/login" className="text-purple-400 hover:text-purple-300">
            {t('auth.login')}
          </a>
        </p>
      </motion.div>
    </div>
  );
}
