'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface SpotifyClientProps {
  isPaid: boolean;
}

export function SpotifyClient({ isPaid }: SpotifyClientProps) {
  const handleConnect = () => {
    if (!isPaid) {
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = `${window.location.origin}/integrations/spotify/callback`;
    const scopes = 'user-read-recently-played user-top-read';

    window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 max-w-md w-full text-center"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-4">Connect Spotify</h1>
        <p className="text-gray-400 mb-8">
          Connect your Spotify account to track your listening habits during focus sessions
        </p>

        {!isPaid ? (
          <>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-purple-300">
                Premium feature - Requires a paid subscription
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-block w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-glow transition-all duration-300"
            >
              Upgrade to Connect
            </Link>
          </>
        ) : (
          <>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-purple-300">
                Connect your Spotify account to get started
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleConnect}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg font-semibold hover:shadow-glow transition-all duration-300"
            >
              Connect with Spotify
            </motion.button>
          </>
        )}

        <Link
          href="/dashboard"
          className="block mt-6 text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}

