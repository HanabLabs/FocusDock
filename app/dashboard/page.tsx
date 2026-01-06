import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardClient } from './dashboard-client';
import { headers } from 'next/headers';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const headersList = await headers();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Auto-sync GitHub if connected and last sync was more than 5 minutes ago (or never synced)
  if (profile?.github_connected) {
    const shouldSync = !profile.github_last_synced_at || 
      (new Date(profile.github_last_synced_at).getTime() < Date.now() - (5 * 60 * 1000));
    
    if (shouldSync) {
      // Trigger sync in background (don't wait for it)
      // Pass cookies from current request to maintain authentication
      const cookieHeader = headersList.get('cookie') || '';
      const syncUrl = new URL('/api/sync/github', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
      fetch(syncUrl.toString(), {
        method: 'POST',
        headers: {
          'Cookie': cookieHeader,
        },
      }).catch(err => console.error('Failed to trigger GitHub sync:', err));
    }
  }

  // Auto-sync Spotify if connected and last sync was more than 5 minutes ago (or never synced)
  if (profile?.spotify_connected && (profile?.subscription_tier === 'monthly' || profile?.subscription_tier === 'lifetime')) {
    const shouldSync = !profile.spotify_last_synced_at || 
      (new Date(profile.spotify_last_synced_at).getTime() < Date.now() - (5 * 60 * 1000));
    
    if (shouldSync) {
      // Trigger sync in background (don't wait for it)
      // Pass cookies from current request to maintain authentication
      const cookieHeader = headersList.get('cookie') || '';
      const syncUrl = new URL('/api/sync/spotify', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
      fetch(syncUrl.toString(), {
        method: 'POST',
        headers: {
          'Cookie': cookieHeader,
        },
      }).catch(err => console.error('Failed to trigger Spotify sync:', err));
    }
  }

  // Calculate date 50 days ago
  const fiftyDaysAgo = new Date();
  fiftyDaysAgo.setDate(fiftyDaysAgo.getDate() - 50);
  const fiftyDaysAgoString = fiftyDaysAgo.toISOString().split('T')[0];

  // Fetch GitHub commits (last 50 days) - only if connected
  let githubCommits = null;
  if (profile?.github_connected) {
    const { data: commits } = await supabase
      .from('github_commits')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', fiftyDaysAgoString)
      .order('date', { ascending: true });
    
    githubCommits = commits;
  }

  // Fetch work sessions (last 50 days)
  const { data: workSessions } = await supabase
    .from('work_sessions')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', fiftyDaysAgoString)
    .order('date', { ascending: true });

  // Fetch Spotify sessions (last 50 days) - only if paid
  let spotifySessions = null;
  let spotifyArtists = null;

  if (profile?.subscription_tier === 'monthly' || profile?.subscription_tier === 'lifetime') {
    const { data: sessions } = await supabase
      .from('spotify_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', fiftyDaysAgoString)
      .order('played_at', { ascending: true });

    spotifySessions = sessions;

    // Aggregate artists
    if (sessions && sessions.length > 0) {
      const artistMap = new Map<string, { playTimeMs: number; trackCount: number }>();

      sessions.forEach((session) => {
        const existing = artistMap.get(session.artist_name) || { playTimeMs: 0, trackCount: 0 };
        artistMap.set(session.artist_name, {
          playTimeMs: existing.playTimeMs + session.duration_ms,
          trackCount: existing.trackCount + 1,
        });
      });

      spotifyArtists = Array.from(artistMap.entries())
        .map(([name, data]) => ({
          name,
          ...data,
          rank: 0,
        }))
        .sort((a, b) => b.playTimeMs - a.playTimeMs)
        .slice(0, 10)
        .map((artist, index) => ({
          ...artist,
          rank: index + 1,
        }));
    }
  }

  return (
    <DashboardClient
      user={user}
      profile={profile}
      githubCommits={githubCommits || []}
      workSessions={workSessions || []}
      spotifySessions={spotifySessions || []}
      spotifyArtists={spotifyArtists || []}
    />
  );
}
