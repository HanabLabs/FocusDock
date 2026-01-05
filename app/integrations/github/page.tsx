import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { GitHubIntegrationClient } from './github-client';

export default async function GitHubIntegrationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('github_connected, github_username')
    .eq('id', user.id)
    .single();

  return <GitHubIntegrationClient profile={profile} />;
}
