'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Locale = 'en' | 'ja';

const messages = {
  en: {
    common: {
      appName: 'FocusDock',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
    },
    auth: {
      login: 'Log In',
      signup: 'Sign Up',
      logout: 'Log Out',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot password?',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      loginWithGitHub: 'Continue with GitHub',
      checkEmail: 'Check your email for the login link',
      common: {
        loading: 'Loading...',
      },
    },
    dashboard: {
      title: 'FocusDock',
      description: 'Visualize your development journey',
      welcome: 'Welcome back',
      github: 'GitHub',
      githubCommits: 'GitHub Commits',
      workHours: 'Work Hours',
      spotify: 'Spotify',
      settings: 'Settings',
      last30Days: 'Last 30 days',
      commits: 'commits',
      hours: 'hours',
      minutes: 'minutes',
      noData: 'No data available',
      connectGitHub: 'Connect GitHub',
      connectSpotify: 'Connect Spotify',
      connect: 'Connect',
      upgrade: 'Upgrade',
      spotifyPremiumRequired: 'Spotify integration requires a premium subscription',
      upgradeForSpotify: 'Upgrade to access Spotify features',
      syncButton: 'Sync',
      syncing: 'Syncing...',
      lastSynced: 'Last synced: {time}',
      syncSuccess: 'Sync completed',
      syncError: 'Sync failed',
      neverSynced: 'Never synced',
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      theme: 'Theme',
      githubSettings: 'GitHub Settings',
      includeSquashCommits: 'Include squash commits',
      includeMergeCommits: 'Include merge commits',
      includeBotCommits: 'Include bot commits',
      integrations: 'Integrations',
      disconnectGitHub: 'Disconnect GitHub',
      disconnectSpotify: 'Disconnect Spotify',
      disconnectConfirm: 'Disconnect {service}?',
      disconnectMessage: 'Are you sure you want to disconnect {service}?',
      disconnectSuccess: 'Successfully disconnected',
      connected: 'Connected',
      notConnected: 'Not connected',
      grassColors: 'Graph Colors',
      commitColor: 'Commit Color',
      workHourColor: 'Work Hour Color',
      spotifyColor: 'Spotify Color',
      blockUnitSettings: 'Block Unit Settings',
      workHoursBlockUnit: 'Work Hours Block Unit',
      spotifyBlockUnit: 'Spotify Block Unit',
      blockUnit15min: '15min',
      blockUnit30min: '30min',
      blockUnit1hour: '1hour',
      display: 'Display',
      showGitHub: 'Show GitHub',
      showWorkHours: 'Show Work Hours',
      showSpotify: 'Show Spotify',
      upgrade: 'Upgrade',
      donate: 'Donate',
    },
    pricing: {
      title: 'Upgrade Your Experience',
      monthly: 'Monthly',
      lifetime: 'Lifetime',
      donate: 'Donate',
      perMonth: '/month',
      oneTime: 'One-time payment',
      customAmount: 'Custom amount',
      features: {
        spotify: 'Spotify integration',
        artistRankings: 'Artist rankings',
        advancedAnalytics: 'Advanced analytics',
        prioritySupport: 'Priority support',
      },
      subscribe: 'Subscribe',
      purchase: 'Purchase',
      donateNow: 'Donate',
      thankYou: 'Thank you for your support!',
      paymentSuccess: 'Payment successful',
      alreadySubscribed: 'You already have an active monthly subscription',
      alreadyLifetime: 'You already have a lifetime subscription',
      lifetimeCannotSubscribe: 'Lifetime users cannot subscribe to monthly plans',
      cancelMonthlyFirst: 'Please cancel your monthly subscription before purchasing lifetime',
      backToDashboard: 'Back to Dashboard',
      backToPlans: 'Back to plans',
      mostPopular: 'Most Popular',
      supportDevelopment: 'Support the development',
    },
    grass: {
      commits: '{count} commits',
      hours: '{count} hours',
      listeningTime: '{minutes} minutes',
      plays: '{count} plays',
    },
    spotify: {
      topArtists: 'Top Artists',
      playTime: 'Play Time',
      tracks: 'Tracks',
      noArtists: 'No listening data yet',
    },
    focus: {
      focusMode: 'Focus Mode',
      startWork: 'Start Work',
      pauseWork: 'Pause',
      resumeWork: 'Resume',
      endWork: 'End Work',
      statusActive: 'Working',
      statusPaused: 'Paused',
      totalToday: 'Total today: {duration}',
    },
  },
  ja: {
    common: {
      appName: 'FocusDock',
      loading: '読み込み中...',
      error: 'エラー',
      success: '成功',
      cancel: 'キャンセル',
      save: '保存',
      delete: '削除',
      edit: '編集',
      close: '閉じる',
    },
    auth: {
      login: 'ログイン',
      signup: '新規登録',
      logout: 'ログアウト',
      email: 'メールアドレス',
      password: 'パスワード',
      forgotPassword: 'パスワードを忘れた方',
      noAccount: 'アカウントをお持ちでない方',
      hasAccount: '既にアカウントをお持ちの方',
      loginWithGitHub: 'GitHubで続ける',
      checkEmail: 'ログインリンクをメールでご確認ください',
      common: {
        loading: '読み込み中...',
      },
    },
    dashboard: {
      title: 'FocusDock',
      description: '開発の軌跡を可視化',
      welcome: 'お帰りなさい',
      github: 'GitHub',
      githubCommits: 'GitHubコミット',
      workHours: '作業時間',
      spotify: 'Spotify',
      settings: '設定',
      last30Days: '過去30日',
      commits: 'コミット',
      hours: '時間',
      minutes: '分',
      noData: 'データがありません',
      connectGitHub: 'GitHubを接続',
      connectSpotify: 'Spotifyを接続',
      connect: '接続',
      upgrade: 'アップグレード',
      spotifyPremiumRequired: 'Spotify連携にはプレミアムサブスクリプションが必要です',
      upgradeForSpotify: 'Spotify機能を利用するにはアップグレードしてください',
      syncButton: '同期',
      syncing: '同期中...',
      lastSynced: '最終同期: {time}',
      syncSuccess: '同期が完了しました',
      syncError: '同期に失敗しました',
      neverSynced: '未同期',
    },
    settings: {
      title: '設定',
      language: '言語',
      theme: 'テーマ',
      githubSettings: 'GitHub設定',
      includeSquashCommits: 'スカッシュコミットを含める',
      includeMergeCommits: 'マージコミットを含める',
      includeBotCommits: 'ボットコミットを含める',
      integrations: '連携設定',
      disconnectGitHub: 'GitHub連携を解除',
      disconnectSpotify: 'Spotify連携を解除',
      disconnectConfirm: '{service}を解除しますか？',
      disconnectMessage: '{service}の連携を解除しますか？',
      disconnectSuccess: '連携を解除しました',
      connected: '接続済み',
      notConnected: '未接続',
      grassColors: 'グラフの色',
      commitColor: 'コミットの色',
      workHourColor: '作業時間の色',
      spotifyColor: 'Spotifyの色',
      blockUnitSettings: 'ブロック単位設定',
      workHoursBlockUnit: '作業時間のブロック単位',
      spotifyBlockUnit: 'Spotifyのブロック単位',
      blockUnit15min: '15分',
      blockUnit30min: '30分',
      blockUnit1hour: '1時間',
      display: '表示',
      showGitHub: 'GitHubを表示',
      showWorkHours: '作業時間を表示',
      showSpotify: 'Spotifyを表示',
      upgrade: 'アップグレード',
      donate: '寄付',
    },
    pricing: {
      title: 'プランをアップグレード',
      monthly: '月額プラン',
      lifetime: '買い切り',
      donate: '寄付',
      perMonth: '/月',
      oneTime: '一回払い',
      customAmount: '金額を指定',
      features: {
        spotify: 'Spotify連携',
        artistRankings: 'アーティストランキング',
        advancedAnalytics: '高度な分析',
        prioritySupport: '優先サポート',
      },
      subscribe: '購読する',
      purchase: '購入する',
      donateNow: '寄付する',
      thankYou: 'ご支援ありがとうございます!',
      paymentSuccess: 'お支払いが完了しました',
      alreadySubscribed: '既に月額サブスクリプションをお持ちです',
      alreadyLifetime: '既に買い切りプランをお持ちです',
      lifetimeCannotSubscribe: '買い切りプランをお持ちの方は月額サブスクリプションに加入できません',
      cancelMonthlyFirst: '買い切りプランを購入する前に、月額サブスクリプションをキャンセルしてください',
      backToDashboard: 'ダッシュボードに戻る',
      backToPlans: 'プラン一覧に戻る',
      mostPopular: '人気No.1',
      supportDevelopment: '開発を支援',
    },
    grass: {
      commits: '{count}コミット',
      hours: '{count}時間',
      listeningTime: '{minutes}分',
      plays: '{count}回再生',
    },
    spotify: {
      topArtists: 'トップアーティスト',
      playTime: '再生時間',
      tracks: 'トラック',
      noArtists: 'まだ再生データがありません',
    },
    focus: {
      focusMode: 'フォーカスモード',
      startWork: '作業開始',
      pauseWork: '一時休憩',
      resumeWork: '作業再開',
      endWork: '作業終了',
      statusActive: '作業中',
      statusPaused: '休憩中',
      totalToday: '今日の合計: {duration}',
    },
  },
};

type Messages = typeof messages.en;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    // Load locale from localStorage or default to 'en'
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale === 'en' || savedLocale === 'ja') {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages[locale];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

