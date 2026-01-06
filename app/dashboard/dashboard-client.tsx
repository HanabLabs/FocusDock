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
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    
    const data = workSessions.reduce((acc, session) => {
      // Ensure date is in YYYY-MM-DD format (handle both DATE and TIMESTAMP)
      const sessionDate = typeof session.date === 'string' 
        ? session.date.split('T')[0] 
        : session.date;
      
      const existing = acc.find((d: any) => d.date === sessionDate);
      // Convert minutes to blocks based on selected unit
      const blocks = session.duration_minutes / unitMinutes;
      if (existing) {
        existing.value += blocks;
      } else {
        acc.push({ date: sessionDate, value: blocks });
      }
      return acc;
    }, [] as { date: string; value: number }[]);
    
    // Add or update today's data with stored focus timer data
    const existingToday = data.find((d: any) => d.date === today);
    if (existingToday) {
      // Replace with stored work time
      existingToday.value = todayBlocks;
    } else if (todayBlocks > 0) {
      data.push({ date: today, value: todayBlocks });
    }
    
    console.log('Work sessions from DB:', workSessions);
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gradient">{t('dashboard.title')}</h1>
              <p className="text-gray-400">{t('dashboard.description')}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/settings"
                className="glass glass-hover px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                {t('dashboard.settings')}
              </Link>
            </div>
          </div>
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
