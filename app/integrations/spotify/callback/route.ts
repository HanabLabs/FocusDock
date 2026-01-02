import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard?error=no_code', request.url));
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Check if user has paid subscription
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    if (profile?.subscription_tier === 'free') {
      return NextResponse.redirect(
        new URL('/pricing?error=spotify_requires_subscription', request.url)
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/integrations/spotify/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error);
    }

    // Update user profile
    await supabase
      .from('user_profiles')
      .update({
        spotify_connected: true,
        spotify_access_token: tokenData.access_token,
        spotify_refresh_token: tokenData.refresh_token,
      })
      .eq('id', user.id);

    return NextResponse.redirect(new URL('/dashboard?spotify=connected', request.url));
  } catch (error) {
    console.error('Spotify OAuth error:', error);
    return NextResponse.redirect(new URL('/dashboard?error=spotify_failed', request.url));
  }
}
