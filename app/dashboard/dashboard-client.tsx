'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useSettingsStore } from '@/lib/store/use-settings-store';
import { GrassGraph } from '@/components/grass-graph';
import { FocusTimer } from '@/components/focus-timer';
import { SpotifyArtists } from '@/components/spotify-artists';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/types/database.types';
import Link from 'next/link';

interface DashboardClientProps {
  user: User;
  profile: UserProfile | null;
  githubCommits: any[];
  workSessions: any[];
  spotifySessions: any[];
  spotifyArtists: any[];
}

export function DashboardClient({
  user,
  profile,
  githubCommits,
  workSessions,
  spotifySessions,
  spotifyArtists,
}: DashboardClientProps) {
  const t = useTranslations();
  const {
    commitColor,
    workHourColor,
    spotifyColor,
    showGitHub,
    showWorkHours,
    showSpotify,
    includeSquashCommits,
    includeMergeCommits,
    includeBotCommits,
  } = useSettingsStore();

  // Process GitHub commits data
  const githubData = githubCommits
    .filter((commit) => {
      if (!includeSquashCommits && commit.is_squash) return false;
      if (!includeMergeCommits && commit.is_merge) return false;
      if (!includeBotCommits && commit.is_bot) return false;
      return true;
    })
    .reduce((acc, commit) => {
      const existing = acc.find((d: any) => d.date === commit.date);
      if (existing) {
        existing.value += commit.commit_count;
      } else {
        acc.push({ date: commit.date, value: commit.commit_count });
      }
      return acc;
    }, [] as { date: string; value: number }[]);

  // Process work sessions data
  const workData = workSessions.reduce((acc, session) => {
    const existing = acc.find((d: any) => d.date === session.date);
    const hours = Math.floor(session.duration_minutes / 60);
    if (existing) {
      existing.value += hours;
    } else {
      acc.push({ date: session.date, value: hours });
    }
    return acc;
  }, [] as { date: string; value: number }[]);

  // Process Spotify data (in 30-minute blocks)
  const spotifyData = spotifySessions.reduce((acc, session) => {
    const existing = acc.find((d: any) => d.date === session.date);
    const blocks = Math.floor(session.duration_ms / (1000 * 60 * 30)); // 30-minute blocks
    if (existing) {
      existing.value += blocks;
    } else {
      acc.push({ date: session.date, value: blocks });
    }
    return acc;
  }, [] as { date: string; value: number }[]);

  const isPaid = profile?.subscription_tier !== 'free';

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">
              {t('common.appName')}
            </h1>
            <p className="text-gray-400">
              {t('dashboard.welcome')}, {user.email}
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/settings"
              className="glass glass-hover px-4 py-2 rounded-lg transition-all"
            >
              {t('settings.title')}
            </Link>
            {!isPaid && (
              <Link
                href="/pricing"
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-glow transition-all duration-300"
              >
                {t('pricing.title')}
              </Link>
            )}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Grass Graphs */}
          <div className="lg:col-span-2 space-y-6">
            {/* GitHub Grass */}
            {showGitHub && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                {profile?.github_connected ? (
                  <GrassGraph
                    data={githubData}
                    color={commitColor}
                    label={t('dashboard.githubCommits')}
                    type="commits"
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">
                      {t('dashboard.connectGitHub')}
                    </p>
                    <Link
                      href="/integrations/github"
                      className="inline-block px-6 py-2 glass glass-hover rounded-lg transition-all"
                    >
                      Connect GitHub
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* Work Hours Grass */}
            {showWorkHours && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <GrassGraph
                  data={workData}
                  color={workHourColor}
                  label={t('dashboard.workHours')}
                  type="hours"
                />
              </motion.div>
            )}

            {/* Spotify Grass */}
            {showSpotify && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                {isPaid ? (
                  profile?.spotify_connected ? (
                    <GrassGraph
                      data={spotifyData}
                      color={spotifyColor}
                      label={t('dashboard.spotify')}
                      type="spotify"
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-4">
                        {t('dashboard.connectSpotify')}
                      </p>
                      <Link
                        href="/integrations/spotify"
                        className="inline-block px-6 py-2 glass glass-hover rounded-lg transition-all"
                      >
                        Connect Spotify
                      </Link>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">
                      {t('dashboard.upgradeForSpotify')}
                    </p>
                    <Link
                      href="/pricing"
                      className="inline-block px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-glow transition-all duration-300"
                    >
                      {t('pricing.title')}
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Focus Timer */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FocusTimer />
            </motion.div>

            {/* Spotify Artists */}
            {showSpotify && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <SpotifyArtists artists={spotifyArtists} isPaid={isPaid} />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
