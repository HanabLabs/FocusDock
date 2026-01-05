import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update user profile to disconnect GitHub
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        github_connected: false,
        github_access_token: null,
        github_username: null,
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error disconnecting GitHub:', profileError);
      return NextResponse.json({ error: 'Failed to disconnect GitHub' }, { status: 500 });
    }

    // Delete all GitHub commits for this user
    const { error: commitsError } = await supabase
      .from('github_commits')
      .delete()
      .eq('user_id', user.id);

    if (commitsError) {
      console.error('Error deleting GitHub commits:', commitsError);
      // Don't fail the request if commits deletion fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in disconnect GitHub API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

