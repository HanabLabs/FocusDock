'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { UserProfile } from '@/lib/types/database.types';
import { createClient } from '@/lib/supabase/client';

interface GitHubIntegrationClientProps {
  profile: UserProfile | null;
}

export function GitHubIntegrationClient({ profile }: GitHubIntegrationClientProps) {
  const { t } = useI18n();
  const isConnected = profile?.github_connected || false;
  const supabase = createClient();

  const handleConnect = async () => {
    try {
      // Use Supabase GitHub OAuth
      // After OAuth, user will be redirected to /auth/callback
      // Then we'll check in the callback if they came from integrations page
      // and update their profile accordingly
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?from=github-integration`,
          scopes: 'repo',
        },
      });
      
      if (error) {
        console.error('Failed to initiate GitHub OAuth:', error);
      }
    } catch (error) {
      console.error('Failed to get GitHub auth URL:', error);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <h1 className="text-4xl font-bold text-gradient">{t('dashboard.connectGitHub')}</h1>
          <Link
            href="/dashboard"
            className="glass glass-hover px-4 py-2 rounded-lg transition-all"
          >
            ← {t('dashboard.title')}
          </Link>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8"
        >
          {isConnected ? (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-500"
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
                <h2 className="text-2xl font-semibold mb-2">
                  GitHub Connected
                </h2>
                {profile?.github_username && (
                  <p className="text-gray-400">
                    Connected as <span className="font-medium text-gray-300">{profile.github_username}</span>
                  </p>
                )}
              </div>
              <p className="text-gray-400 mb-6">
                Your GitHub commits are being tracked and displayed on your dashboard.
              </p>
              <Link
                href="/settings"
                className="inline-block px-6 py-3 glass glass-hover rounded-lg font-medium transition-all duration-200"
              >
                {t('settings.title')}
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold mb-2">
                  {t('dashboard.connectGitHub')}
                </h2>
                <p className="text-gray-400 mb-6">
                  Connect your GitHub account to track and visualize your commit activity.
                </p>
              </div>
              <button
                onClick={handleConnect}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-glow transition-all duration-300"
              >
                {t('dashboard.connect')} GitHub
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

