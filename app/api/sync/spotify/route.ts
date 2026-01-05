import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getValidSpotifyToken, refreshSpotifyToken } from '@/lib/spotify';

interface SpotifyTrack {
  track: {
    name: string;
    artists: Array<{ name: string }>;
    duration_ms: number;
  };
  played_at: string;
}

/**
 * Sync Spotify listening history for authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile with Spotify tokens
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('spotify_access_token, spotify_refresh_token')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.spotify_access_token || !profile?.spotify_refresh_token) {
      return NextResponse.json(
        { error: 'Spotify not connected' },
        { status: 400 }
      );
    }

    // Get valid access token (refresh if needed)
    let accessToken: string;
    try {
      accessToken = await getValidSpotifyToken(
        profile.spotify_access_token,
        profile.spotify_refresh_token
      );

      // Update token if it was refreshed
      if (accessToken !== profile.spotify_access_token) {
        await supabase
          .from('user_profiles')
          .update({ spotify_access_token: accessToken })
          .eq('id', user.id);
      }
    } catch (error: any) {
      console.error('Failed to get valid token:', error);
      return NextResponse.json(
        { error: 'Failed to refresh Spotify token' },
        { status: 401 }
      );
    }

    // Calculate date range (last 50 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 50);

    const sessionsToInsert: Array<{
      user_id: string;
      date: string;
      artist_name: string;
      track_name: string;
      duration_ms: number;
      played_at: string;
    }> = [];

    // Fetch recently played tracks (Spotify API returns up to 50 tracks per request)
    let url = 'https://api.spotify.com/v1/me/player/recently-played?limit=50';
    let hasMore = true;
    let after = null;

    while (hasMore) {
      try {
        const requestUrl = after ? `${url}&after=${after}` : url;
        const response = await fetch(requestUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired, try to refresh
            try {
              accessToken = await refreshSpotifyToken(profile.spotify_refresh_token);
              await supabase
                .from('user_profiles')
                .update({ spotify_access_token: accessToken })
                .eq('id', user.id);
              
              // Retry with new token
              const retryResponse = await fetch(requestUrl, {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              });
              
              if (!retryResponse.ok) {
                throw new Error(`Spotify API error: ${retryResponse.statusText}`);
              }
              
              // Continue with retry response
              const retryData = await retryResponse.json();
              const tracks: SpotifyTrack[] = retryData.items || [];

              for (const item of tracks) {
                const playedAt = new Date(item.played_at);
                const dateStr = playedAt.toISOString().split('T')[0];

                // Skip if outside date range
                if (playedAt < startDate || playedAt > endDate) {
                  if (playedAt < startDate) {
                    hasMore = false;
                  }
                  continue;
                }

                sessionsToInsert.push({
                  user_id: user.id,
                  date: dateStr,
                  artist_name: item.track.artists[0]?.name || 'Unknown Artist',
                  track_name: item.track.name,
                  duration_ms: item.track.duration_ms,
                  played_at: item.played_at,
                });

                after = playedAt.getTime();
              }

              if (tracks.length < 50) {
                hasMore = false;
              }

              continue;
            } catch (refreshError) {
              throw new Error('Failed to refresh token');
            }
          } else {
            throw new Error(`Spotify API error: ${response.statusText}`);
          }
        }

        const data = await response.json();
        const tracks: SpotifyTrack[] = data.items || [];

        if (tracks.length === 0) {
          hasMore = false;
          break;
        }

        for (const item of tracks) {
          const playedAt = new Date(item.played_at);
          const dateStr = playedAt.toISOString().split('T')[0];

          // Skip if outside date range
          if (playedAt < startDate || playedAt > endDate) {
            if (playedAt < startDate) {
              hasMore = false;
            }
            continue;
          }

          sessionsToInsert.push({
            user_id: user.id,
            date: dateStr,
            artist_name: item.track.artists[0]?.name || 'Unknown Artist',
            track_name: item.track.name,
            duration_ms: item.track.duration_ms,
            played_at: item.played_at,
          });

          after = playedAt.getTime();
        }

        // Spotify API only returns up to 50 tracks, and we can only go back 50 days
        // So we break after first request (most recent 50 tracks)
        hasMore = false;
      } catch (error) {
        console.error('Error fetching Spotify data:', error);
        hasMore = false;
      }
    }

    // Clear existing sessions for this user in the date range
    await supabase
      .from('spotify_sessions')
      .delete()
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0]);

    // Insert new sessions
    if (sessionsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('spotify_sessions')
        .insert(sessionsToInsert);

      if (insertError) {
        throw new Error(`Failed to insert sessions: ${insertError.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      sessionsSynced: sessionsToInsert.length,
    });
  } catch (error: any) {
    console.error('Spotify sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync Spotify data' },
      { status: 500 }
    );
  }
}

