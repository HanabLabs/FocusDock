'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

interface Artist {
  name: string;
  playTimeMs: number;
  trackCount: number;
  rank: number;
}

interface SpotifyArtistsProps {
  artists: Artist[];
  isPaid: boolean;
}

function formatPlayTime(ms: number) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export function SpotifyArtists({ artists, isPaid }: SpotifyArtistsProps) {
  const { t } = useI18n();

  if (!isPaid) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">{t('spotify.topArtists')}</h3>
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">
            Unlock Spotify features with a subscription
          </p>
          <a
            href="/pricing"
            className="inline-block px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-glow transition-all duration-300"
          >
            Upgrade Now
          </a>
        </div>
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">{t('spotify.topArtists')}</h3>
        <p className="text-gray-400 text-center py-8">{t('spotify.noArtists')}</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">
        {t('spotify.topArtists')} <span className="text-sm text-gray-400">({t('dashboard.last30Days')})</span>
      </h3>

      <div className="space-y-3">
        {artists.map((artist, index) => {
          const isTopThree = artist.rank <= 3;

          return (
            <motion.div
              key={artist.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass rounded-lg p-4 hover:bg-white/10 transition-all duration-300 ${
                isTopThree ? 'ring-2 ring-purple-500/30' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                      artist.rank === 1
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black'
                        : artist.rank === 2
                        ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black'
                        : artist.rank === 3
                        ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-black'
                        : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {artist.rank}
                  </div>
                  <div>
                    <p className="font-semibold">{artist.name}</p>
                    <p className="text-xs text-gray-400">
                      {artist.trackCount} {t('spotify.tracks')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold">
                    {formatPlayTime(artist.playTimeMs)}
                  </p>
                  <p className="text-xs text-gray-400">{t('spotify.playTime')}</p>
                </div>
              </div>

              {/* Progress bar */}
              {isTopThree && (
                <motion.div
                  className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(artist.playTimeMs / artists[0].playTimeMs) * 100}%`,
                    }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                  />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
