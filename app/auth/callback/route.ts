import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const from = searchParams.get('from');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // If this is from GitHub integration page, update user profile
      if (from === 'github-integration') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.provider_token) {
            try {
              // Get GitHub user info
              const userResponse = await fetch('https://api.github.com/user', {
                headers: {
                  Authorization: `Bearer ${session.provider_token}`,
                },
              });
              const githubUser = await userResponse.json();

              // Update user profile
              await supabase
                .from('user_profiles')
                .update({
                  github_connected: true,
                  github_username: githubUser.login,
                  github_access_token: session.provider_token,
                })
                .eq('id', user.id);

              // Trigger sync in background
              const syncUrl = new URL('/api/sync/github', origin);
              fetch(syncUrl.toString(), {
                method: 'POST',
                headers: {
                  Cookie: request.headers.get('Cookie') || '',
                },
              }).catch(err => console.error('Failed to trigger GitHub sync:', err));
            } catch (error) {
              console.error('Error updating GitHub integration:', error);
            }
          }
        }
        return NextResponse.redirect(`${origin}/dashboard?github=connected`);
      }
      
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login`);
}
