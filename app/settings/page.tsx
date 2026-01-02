'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useSettingsStore } from '@/lib/store/use-settings-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
  const t = useTranslations();
  const router = useRouter();
  const {
    includeSquashCommits,
    includeMergeCommits,
    includeBotCommits,
    commitColor,
    workHourColor,
    spotifyColor,
    showGitHub,
    showWorkHours,
    showSpotify,
    setGitHubSetting,
    setGrassColor,
    setDisplaySetting,
  } = useSettingsStore();

  const [currentLocale, setCurrentLocale] = useState<'en' | 'ja'>('en');

  const handleLocaleChange = (locale: 'en' | 'ja') => {
    setCurrentLocale(locale);
    // In a real implementation, this would use next-intl's locale switching
    // For now, we'll just update the state
    router.refresh();
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <h1 className="text-4xl font-bold text-gradient">
            {t('settings.title')}
          </h1>
          <Link
            href="/dashboard"
            className="glass glass-hover px-4 py-2 rounded-lg transition-all"
          >
            ← {t('dashboard.title')}
          </Link>
        </motion.div>

        <div className="space-y-6">
          {/* Language Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-semibold mb-4">{t('settings.language')}</h2>
            <div className="flex gap-3">
              <button
                onClick={() => handleLocaleChange('en')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  currentLocale === 'en'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'glass glass-hover'
                }`}
              >
                English
              </button>
              <button
                onClick={() => handleLocaleChange('ja')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  currentLocale === 'ja'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'glass glass-hover'
                }`}
              >
                日本語
              </button>
            </div>
          </motion.div>

          {/* GitHub Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-semibold mb-4">
              {t('settings.githubSettings')}
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">
                  {t('settings.includeSquashCommits')}
                </span>
                <input
                  type="checkbox"
                  checked={includeSquashCommits}
                  onChange={(e) =>
                    setGitHubSetting('includeSquashCommits', e.target.checked)
                  }
                  className="w-5 h-5 rounded accent-purple-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">
                  {t('settings.includeMergeCommits')}
                </span>
                <input
                  type="checkbox"
                  checked={includeMergeCommits}
                  onChange={(e) =>
                    setGitHubSetting('includeMergeCommits', e.target.checked)
                  }
                  className="w-5 h-5 rounded accent-purple-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">
                  {t('settings.includeBotCommits')}
                </span>
                <input
                  type="checkbox"
                  checked={includeBotCommits}
                  onChange={(e) =>
                    setGitHubSetting('includeBotCommits', e.target.checked)
                  }
                  className="w-5 h-5 rounded accent-purple-500"
                />
              </label>
            </div>
          </motion.div>

          {/* Grass Colors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-semibold mb-4">
              {t('settings.grassColors')}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">{t('settings.commitColor')}</span>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-white/10"
                    style={{ backgroundColor: commitColor }}
                  />
                  <input
                    type="color"
                    value={commitColor}
                    onChange={(e) => setGrassColor('commitColor', e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">
                  {t('settings.workHourColor')}
                </span>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-white/10"
                    style={{ backgroundColor: workHourColor }}
                  />
                  <input
                    type="color"
                    value={workHourColor}
                    onChange={(e) => setGrassColor('workHourColor', e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">
                  {t('settings.spotifyColor')}
                </span>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-white/10"
                    style={{ backgroundColor: spotifyColor }}
                  />
                  <input
                    type="color"
                    value={spotifyColor}
                    onChange={(e) => setGrassColor('spotifyColor', e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Display Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-semibold mb-4">{t('settings.display')}</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">{t('settings.showGitHub')}</span>
                <input
                  type="checkbox"
                  checked={showGitHub}
                  onChange={(e) =>
                    setDisplaySetting('showGitHub', e.target.checked)
                  }
                  className="w-5 h-5 rounded accent-purple-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">
                  {t('settings.showWorkHours')}
                </span>
                <input
                  type="checkbox"
                  checked={showWorkHours}
                  onChange={(e) =>
                    setDisplaySetting('showWorkHours', e.target.checked)
                  }
                  className="w-5 h-5 rounded accent-purple-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">{t('settings.showSpotify')}</span>
                <input
                  type="checkbox"
                  checked={showSpotify}
                  onChange={(e) =>
                    setDisplaySetting('showSpotify', e.target.checked)
                  }
                  className="w-5 h-5 rounded accent-purple-500"
                />
              </label>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
