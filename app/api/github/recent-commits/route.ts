import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get recent GitHub commits from database for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recent commits from database
    const { data: recentCommits, error: commitsError } = await supabase
      .from('github_recent_commits')
      .select('repository, message, date')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(5);

    if (commitsError) {
      console.error('Failed to fetch recent commits from database:', commitsError);
      return NextResponse.json(
        { error: 'Failed to fetch recent commits' },
        { status: 500 }
      );
    }

    const commits = (recentCommits || []).map((commit) => ({
      repository: commit.repository,
      message: commit.message,
      date: commit.date,
    }));

    return NextResponse.json({
      commits,
    });
  } catch (error: any) {
    console.error('GitHub recent commits error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recent commits' },
      { status: 500 }
    );
  }
}

