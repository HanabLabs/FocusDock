import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SpotifyClient } from './spotify-client';

export default async function SpotifyIntegrationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  const isPaid = profile?.subscription_tier === 'monthly' || profile?.subscription_tier === 'lifetime';

  return <SpotifyClient isPaid={isPaid} />;
}
