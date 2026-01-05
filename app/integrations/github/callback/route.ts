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

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error);
    }

    // Get GitHub user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const githubUser = await userResponse.json();

    // Update user profile
    await supabase
      .from('user_profiles')
      .update({
        github_connected: true,
        github_username: githubUser.login,
        github_access_token: tokenData.access_token,
      })
      .eq('id', user.id);

    // Trigger sync in background (don't wait for it)
    const syncUrl = new URL('/api/sync/github', request.nextUrl.origin);
    fetch(syncUrl.toString(), {
      method: 'POST',
      headers: {
        Cookie: request.headers.get('Cookie') || '',
      },
    }).catch(err => console.error('Failed to trigger GitHub sync:', err));

    return NextResponse.redirect(new URL('/dashboard?github=connected', request.url));
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return NextResponse.redirect(new URL('/dashboard?error=github_failed', request.url));
  }
}
