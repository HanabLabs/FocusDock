import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      date: string;
    };
  };
  repository: {
    name: string;
    full_name: string;
  };
}

/**
 * Get recent GitHub commits with messages for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return dummy data for testing (only for riiriricon@gmail.com)
    if (user.email === 'riiriricon@gmail.com') {
      const now = new Date();
      const dummyCommits = [
        {
          repository: 'FocusDock',
          message: 'feat: Add GitHub recent commits display feature',
          date: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        },
        {
          repository: 'FocusDock',
          message: 'fix: Update Spotify graph layout and styling',
          date: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        },
        {
          repository: 'my-project',
          message: 'chore: Update dependencies and fix security issues',
          date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        },
        {
          repository: 'FocusDock',
          message: 'refactor: Improve dashboard performance and UI',
          date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        },
        {
          repository: 'my-project',
          message: 'docs: Update README with new features and setup guide',
          date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        },
      ];

      return NextResponse.json({
        commits: dummyCommits,
      });
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

