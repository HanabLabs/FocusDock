export type SubscriptionTier = 'free' | 'monthly' | 'lifetime';

export interface UserProfile {
  id: string;
  email: string;
  subscription_tier: SubscriptionTier;
  github_connected: boolean;
  github_username: string | null;
  github_access_token: string | null;
  spotify_connected: boolean;
  spotify_access_token: string | null;
  spotify_refresh_token: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GitHubCommit {
  id: string;
  user_id: string;
  date: string;
  commit_count: number;
  repository: string;
  is_squash: boolean;
  is_merge: boolean;
  is_bot: boolean;
  created_at: string;
}

export interface WorkSession {
  id: string;
  user_id: string;
  date: string;
  duration_minutes: number;
  started_at: string;
  ended_at: string;
  created_at: string;
}

export interface SpotifySession {
  id: string;
  user_id: string;
  date: string;
  artist_name: string;
  track_name: string;
  duration_ms: number;
  played_at: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      github_commits: {
        Row: GitHubCommit;
        Insert: Omit<GitHubCommit, 'id' | 'created_at'>;
        Update: Partial<Omit<GitHubCommit, 'id' | 'user_id' | 'created_at'>>;
      };
      work_sessions: {
        Row: WorkSession;
        Insert: Omit<WorkSession, 'id' | 'created_at'>;
        Update: Partial<Omit<WorkSession, 'id' | 'user_id' | 'created_at'>>;
      };
      spotify_sessions: {
        Row: SpotifySession;
        Insert: Omit<SpotifySession, 'id' | 'created_at'>;
        Update: Partial<Omit<SpotifySession, 'id' | 'user_id' | 'created_at'>>;
      };
    };
  };
}
