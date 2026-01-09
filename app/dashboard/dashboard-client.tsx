'use client';

import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { useSettingsStore } from '@/lib/store/use-settings-store';
import { useFocusStore } from '@/lib/store/use-focus-store';
import { GrassGraph } from '@/components/grass-graph';
import { FocusTimer } from '@/components/focus-timer';
import { SpotifyArtists } from '@/components/spotify-artists';
import { GitHubRecentCommits } from '@/components/github-recent-commits';
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
  const { t, locale } = useI18n();
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
    workHoursBlockUnit,
    spotifyBlockUnit,
  } = useSettingsStore();
  const { totalFocusToday } = useFocusStore();

  const [isMounted, setIsMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle manual GitHub sync
  const handleGitHubSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const response = await fetch('/api/sync/github', {
        method: 'POST',
      });

      if (response.ok) {
        setSyncMessage({ type: 'success', text: t('dashboard.syncSuccess') });
        // Reload page to fetch fresh data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setSyncMessage({ type: 'error', text: t('dashboard.syncError') });
        setIsSyncing(false);
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncMessage({ type: 'error', text: t('dashboard.syncError') });
      setIsSyncing(false);
    }
  };

  // Format last synced time
  const formatLastSynced = (timestamp: string | null) => {
    if (!timestamp) return t('dashboard.neverSynced');

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Handle GitHub connection success - reload page to fetch new data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const githubConnected = params.get('github');
      if (githubConnected === 'connected') {
        // Remove query parameter and reload to fetch fresh data from server
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        window.location.reload();
      }
    }
  }, []);

  // Process GitHub commits data (memoized)
  const githubData = useMemo(() => {
    return githubCommits
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
  }, [githubCommits, includeSquashCommits, includeMergeCommits, includeBotCommits]);

  // Process work sessions data (memoized) - includes stored totalFocusToday
  const workData = useMemo(() => {
    // Convert block unit to minutes
    const unitMinutes = workHoursBlockUnit === '15min' ? 15 : workHoursBlockUnit === '30min' ? 30 : 60;

    // Get today's date string (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // Use stored totalFocusToday (doesn't include active session time for graph stability)
    const todayMinutes = totalFocusToday / (1000 * 60);
    const todayBlocks = todayMinutes / unitMinutes;

    // Group work sessions by date and sum duration_minutes
    const sessionsByDate = new Map<string, number>();

    workSessions.forEach((session) => {
      // Ensure date is in YYYY-MM-DD format (handle both DATE and TIMESTAMP)
      const sessionDate = typeof session.date === 'string'
        ? session.date.split('T')[0]
        : session.date;

      const currentMinutes = sessionsByDate.get(sessionDate) || 0;
      sessionsByDate.set(sessionDate, currentMinutes + session.duration_minutes);
    });

    // Convert to array format with blocks
    const data = Array.from(sessionsByDate.entries()).map(([date, totalMinutes]) => ({
      date,
      value: totalMinutes / unitMinutes, // Convert to blocks
    }));

    // Add or update today's data with stored focus timer data
    const existingToday = data.find((d: any) => d.date === today);
    if (existingToday) {
      // Replace with stored work time
      existingToday.value = todayBlocks;
    } else if (todayBlocks > 0) {
      data.push({ date: today, value: todayBlocks });
    }

    console.log('Work sessions from DB:', workSessions);
    console.log('Sessions grouped by date:', Array.from(sessionsByDate.entries()));
    console.log('Processed work data:', data);

    return data;
  }, [workSessions, workHoursBlockUnit, totalFocusToday]);

  // Process Spotify data (memoized)
  // Convert milliseconds to blocks based on selected unit
  const spotifyData = useMemo(() => {
    // Convert block unit to milliseconds
    const unitMs = spotifyBlockUnit === '15min' ? 15 * 60 * 1000 : spotifyBlockUnit === '30min' ? 30 * 60 * 1000 : 60 * 60 * 1000;

    return spotifySessions.reduce((acc, session) => {
      const existing = acc.find((d: any) => d.date === session.date);
      // Convert ms to blocks based on selected unit (with decimal precision)
      const blocks = session.duration_ms / unitMs;
      if (existing) {
        existing.value += blocks;
      } else {
        acc.push({ date: session.date, value: blocks });
      }
      return acc;
    }, [] as { date: string; value: number }[]);
  }, [spotifySessions, spotifyBlockUnit]);

  const isPaid = profile?.subscription_tier === 'monthly' || profile?.subscription_tier === 'lifetime';

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gradient">{t('dashboard.title')}</h1>
              <p className="text-gray-400">{t('dashboard.description')}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* GitHub Sync Button - only show if GitHub is connected */}
              {profile?.github_connected && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGitHubSync}
                  disabled={isSyncing}
                  className="glass glass-hover px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSyncing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('dashboard.syncing')}
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {t('dashboard.syncButton')}
                    </>
                  )}
                </motion.button>
              )}
              <Link
                href="/settings"
                className="glass glass-hover px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                {t('dashboard.settings')}
              </Link>
            </div>
          </div>

          {/* Sync Status Messages */}
          {syncMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass rounded-lg px-4 py-2 text-sm mb-4 ${syncMessage.type === 'success' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
                }`}
            >
              {syncMessage.text}
            </motion.div>
          )}

          {/* Last Synced Time - only show if GitHub is connected */}
          {profile?.github_connected && (
            <div className="text-xs text-gray-500">
              {t('dashboard.lastSynced').replace('{time}', formatLastSynced(profile.github_last_synced_at))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="order-2 lg:order-1 lg:col-span-2 space-y-6">
            {/* Graphs */}
            <div className="space-y-6">
              {/* GitHub Grass */}
              {showGitHub && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-4"
                >
                  {profile?.github_connected ? (
                    <GrassGraph
                      data={githubData}
                      color={commitColor}
                      label={t('dashboard.github')}
                      type="commits"
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-4">{t('dashboard.connectGitHub')}</p>
                      <Link
                        href="/integrations/github"
                        className="inline-block glass glass-hover px-6 py-3 rounded-lg font-medium transition-all duration-200"
                      >
                        {t('dashboard.connect')}
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
                  className="glass-card p-4"
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
                  className="glass-card p-4"
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
                        <p className="text-gray-400 mb-4">{t('dashboard.connectSpotify')}</p>
                        <Link
                          href="/integrations/spotify"
                          className="inline-block glass glass-hover px-6 py-3 rounded-lg font-medium transition-all duration-200"
                        >
                          {t('dashboard.connect')}
                        </Link>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-4">{t('dashboard.spotifyPremiumRequired')}</p>
                      <Link
                        href="/pricing"
                        className="inline-block glass glass-hover px-6 py-3 rounded-lg font-medium transition-all duration-200"
                      >
                        {t('dashboard.upgrade')}
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}

              {/* GitHub Recent Commits */}
              {profile?.github_connected && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-card p-4"
                >
                  <GitHubRecentCommits locale={locale} />
                </motion.div>
              )}

              {/* Spotify Artists - shown at bottom on mobile */}
              {isPaid && profile?.spotify_connected && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="lg:hidden"
                >
                  <SpotifyArtists artists={spotifyArtists} isPaid={isPaid} />
                </motion.div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="order-1 lg:order-2 lg:col-span-1 space-y-6">
            {/* Focus Timer - shown first on mobile, at top of sidebar on desktop */}
            <div className="order-1 lg:order-1">
              <FocusTimer />
            </div>

            {/* Spotify Artists - shown in sidebar on desktop only */}
            {isPaid && profile?.spotify_connected && (
              <div className="hidden lg:block order-2 lg:order-2">
                <SpotifyArtists artists={spotifyArtists} isPaid={isPaid} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
