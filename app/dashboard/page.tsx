import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardClient } from './dashboard-client';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch GitHub commits (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: githubCommits } = await supabase
    .from('github_commits')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: true });

  // Fetch work sessions (last 30 days)
  const { data: workSessions } = await supabase
    .from('work_sessions')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: true });

  // Fetch Spotify sessions (last 30 days) - only if paid
  let spotifySessions = null;
  let spotifyArtists = null;

  if (profile?.subscription_tier !== 'free') {
    const { data: sessions } = await supabase
      .from('spotify_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
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
