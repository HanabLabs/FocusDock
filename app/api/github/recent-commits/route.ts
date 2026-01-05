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

    // Get user profile with GitHub token
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('github_access_token, github_username')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.github_access_token || !profile?.github_username) {
      return NextResponse.json(
        { error: 'GitHub not connected' },
        { status: 400 }
      );
    }

    const accessToken = profile.github_access_token;
    const username = profile.github_username;

    // Get user's repositories (only recent ones)
    const reposResponse = await fetch('https://api.github.com/user/repos?per_page=10&sort=updated', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!reposResponse.ok) {
      const error = await reposResponse.json();
      throw new Error(`Failed to fetch repositories: ${error.message || 'Unknown error'}`);
    }

    const repos = await reposResponse.json();
    
    // Calculate date range (last 30 days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const commitsWithMessages: Array<{
      repository: string;
      message: string;
      date: string;
    }> = [];

    // Fetch commits from repositories (limit to 5 repositories to avoid rate limits)
    for (const repo of repos.slice(0, 5)) {
      try {
        const commitsUrl = `https://api.github.com/repos/${repo.full_name}/commits?author=${username}&since=${startDate.toISOString()}&per_page=5`;
        
        const commitsResponse = await fetch(commitsUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });

        if (!commitsResponse.ok) {
          console.error(`Failed to fetch commits for ${repo.full_name}:`, commitsResponse.statusText);
          continue;
        }

        const commits: GitHubCommit[] = await commitsResponse.json();

        for (const commit of commits) {
          commitsWithMessages.push({
            repository: repo.name,
            message: commit.commit.message.split('\n')[0], // First line of commit message
            date: commit.commit.author.date,
          });
        }

        // Rate limiting: wait a bit between requests
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error processing repository ${repo.full_name}:`, error);
        continue;
      }
    }

    // Sort by date (most recent first) and limit to 5
    commitsWithMessages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let recentCommits = commitsWithMessages.slice(0, 5);

    // Return dummy data for testing if no commits found (only for riiriricon@gmail.com)
    if (recentCommits.length === 0 && user.email === 'riiriricon@gmail.com') {
      const now = new Date();
      recentCommits = [
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
    }

    return NextResponse.json({
      commits: recentCommits,
    });
  } catch (error: any) {
    console.error('GitHub recent commits error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recent commits' },
      { status: 500 }
    );
  }
}

