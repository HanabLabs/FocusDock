import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
  } | null;
  repository: {
    name: string;
    full_name: string;
  };
}

/**
 * Sync GitHub commits for authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile with GitHub token
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('github_access_token, github_username')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.github_access_token) {
      return NextResponse.json(
        { error: 'GitHub not connected' },
        { status: 400 }
      );
    }

    const accessToken = profile.github_access_token;

    // Get user's repositories
    const reposResponse = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
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
    
    // Calculate date range (last 50 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 50);
    
    const commitsToInsert: Array<{
      user_id: string;
      date: string;
      commit_count: number;
      repository: string;
      is_squash: boolean;
      is_merge: boolean;
      is_bot: boolean;
    }> = [];

    // Fetch commits from each repository
    for (const repo of repos) {
      try {
        // Fetch commits with pagination to get all commits from the last 50 days
        let allCommits: GitHubCommit[] = [];
        let page = 1;
        const perPage = 100;
        let hasMore = true;

        while (hasMore) {
          const commitsUrl = `https://api.github.com/repos/${repo.full_name}/commits?since=${startDate.toISOString()}&author=${profile.github_username}&per_page=${perPage}&page=${page}`;
          
          const commitsResponse = await fetch(commitsUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
          });

          if (!commitsResponse.ok) {
            console.error(`Failed to fetch commits for ${repo.full_name}:`, commitsResponse.statusText);
            break;
          }

          const commits: GitHubCommit[] = await commitsResponse.json();
          
          if (commits.length === 0) {
            hasMore = false;
          } else {
            allCommits = allCommits.concat(commits);
            
            // Stop if we got less than perPage results (last page)
            if (commits.length < perPage) {
              hasMore = false;
            } else {
              page++;
            }
          }

          // Rate limiting: wait a bit between pages
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const commits = allCommits;

        // Process commits and group by date
        const commitsByDate = new Map<string, {
          count: number;
          isSquash: boolean;
          isMerge: boolean;
          isBot: boolean;
        }>();

        for (const commit of commits) {
          const commitDate = new Date(commit.commit.author.date);
          const dateStr = commitDate.toISOString().split('T')[0];

          // Skip if outside date range
          if (commitDate < startDate || commitDate > endDate) {
            continue;
          }

          const message = commit.commit.message.toLowerCase();
          const isSquash = message.includes('squash') || message.includes('fixup');
          const isMerge = commit.commit.message.startsWith('Merge');
          const isBot = commit.author?.login?.endsWith('[bot]') || false;

          const existing = commitsByDate.get(dateStr) || {
            count: 0,
            isSquash: false,
            isMerge: false,
            isBot: false,
          };

          commitsByDate.set(dateStr, {
            count: existing.count + 1,
            isSquash: existing.isSquash || isSquash,
            isMerge: existing.isMerge || isMerge,
            isBot: existing.isBot || isBot,
          });
        }

        // Convert to insert format
        for (const [date, data] of commitsByDate.entries()) {
          commitsToInsert.push({
            user_id: user.id,
            date,
            commit_count: data.count,
            repository: repo.name,
            is_squash: data.isSquash,
            is_merge: data.isMerge,
            is_bot: data.isBot,
          });
        }

        // Rate limiting: wait a bit between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing repository ${repo.full_name}:`, error);
        continue;
      }
    }

    // Clear existing commits for this user
    await supabase
      .from('github_commits')
      .delete()
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0]);

    // Insert new commits (using upsert to handle conflicts)
    if (commitsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('github_commits')
        .upsert(commitsToInsert, {
          onConflict: 'user_id,date,repository',
        });

      if (insertError) {
        throw new Error(`Failed to insert commits: ${insertError.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      commitsSynced: commitsToInsert.length,
    });
  } catch (error: any) {
    console.error('GitHub sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync GitHub data' },
      { status: 500 }
    );
  }
}

