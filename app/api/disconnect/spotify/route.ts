import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update user profile to disconnect Spotify
    const { error } = await supabase
      .from('user_profiles')
      .update({
        spotify_connected: false,
        spotify_access_token: null,
        spotify_refresh_token: null,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error disconnecting Spotify:', error);
      return NextResponse.json({ error: 'Failed to disconnect Spotify' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in disconnect Spotify API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

