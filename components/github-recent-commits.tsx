'use client';

import { useEffect, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useI18n } from '@/lib/i18n';

interface RecentCommit {
  repository: string;
  message: string;
  date: string;
}

interface GitHubRecentCommitsProps {
  locale?: 'en' | 'ja';
  label?: string;
}

export function GitHubRecentCommits({ locale: propLocale, label }: GitHubRecentCommitsProps) {
  const { t, locale: i18nLocale } = useI18n();
  const locale = propLocale || i18nLocale;
  const [commits, setCommits] = useState<RecentCommit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const response = await fetch('/api/github/recent-commits');
        if (response.ok) {
          const data = await response.json();
          setCommits(data.commits || []);
        }
      } catch (error) {
        console.error('Failed to fetch recent commits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (locale === 'ja') {
      return format(date, 'M月d日 HH:mm');
    }
    return format(date, 'MMM d, HH:mm');
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return formatDistanceToNow(date, { 
      addSuffix: true,
      locale: locale === 'ja' ? ja : undefined,
    });
  };

  const displayLabel = label || (locale === 'ja' ? '最近のコミット' : 'Recent Commits');

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-gray-400 mb-4">{displayLabel}</h3>
      {loading ? (
        <div className="text-center py-4 text-gray-400 text-sm">
          {locale === 'ja' ? '読み込み中...' : 'Loading...'}
        </div>
      ) : !commits || commits.length === 0 ? (
        <div className="text-center py-4 text-gray-400 text-sm">
          {locale === 'ja' ? 'コミットがありません' : 'No commits found'}
        </div>
      ) : (
        <div className="space-y-3">
          {commits.map((commit, index) => (
            <div
              key={`${commit.repository}-${commit.date}-${index}`}
              className="flex flex-col gap-1 pb-3 border-b border-white/10 last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-200">
                  {commit.repository}
                </span>
                <span className="text-xs text-gray-400">
                  {formatRelativeTime(commit.date)}
                </span>
              </div>
              <div className="text-sm text-gray-300 break-words">
                {commit.message}
              </div>
              <div className="text-xs text-gray-400">
                {formatDate(commit.date)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

