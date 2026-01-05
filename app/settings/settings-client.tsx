'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { useSettingsStore } from '@/lib/store/use-settings-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserProfile } from '@/lib/types/database.types';
import { DisconnectDialog } from '@/components/disconnect-dialog';
import { Footer } from '@/components/footer';

interface SettingsClientProps {
  profile: UserProfile | null;
}

export function SettingsClient({ profile }: SettingsClientProps) {
  const { t, locale, setLocale } = useI18n();
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
    workHoursBlockUnit,
    spotifyBlockUnit,
    setGitHubSetting,
    setGrassColor,
    setDisplaySetting,
    setBlockUnit,
  } = useSettingsStore();

  const isPaid = profile?.subscription_tier === 'monthly' || profile?.subscription_tier === 'lifetime';

  const commitColorInputRef = useRef<HTMLInputElement>(null);
  const workHourColorInputRef = useRef<HTMLInputElement>(null);
  const spotifyColorInputRef = useRef<HTMLInputElement>(null);

  const handleLocaleChange = (newLocale: 'en' | 'ja') => {
    setLocale(newLocale);
  };

  const [disconnecting, setDisconnecting] = useState<'github' | 'spotify' | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogService, setDialogService] = useState<'GitHub' | 'Spotify'>('GitHub');
  const [dialogPendingService, setDialogPendingService] = useState<'github' | 'spotify' | null>(null);

  const handleDisconnectClick = (service: 'github' | 'spotify') => {
    setDialogService(service === 'github' ? 'GitHub' : 'Spotify');
    setDialogPendingService(service);
    setDialogOpen(true);
  };

  const handleDisconnectConfirm = async () => {
    if (!dialogPendingService) return;

    setDisconnecting(dialogPendingService);
    setDialogOpen(false);
    
    try {
      const response = await fetch(`/api/disconnect/${dialogPendingService}`, {
        method: 'POST',
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to disconnect');
      }
    } catch (error) {
      console.error(`Error disconnecting ${dialogPendingService}:`, error);
      alert('Failed to disconnect');
    } finally {
      setDisconnecting(null);
      setDialogPendingService(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      <div className="max-w-5xl mx-auto w-full">
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
            transition={{ delay: 0.05 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-semibold mb-4">{t('settings.language')}</h2>
            <div className="flex gap-3">
              <button
                onClick={() => handleLocaleChange('en')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  locale === 'en'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'glass glass-hover'
                }`}
              >
                English
              </button>
              <button
                onClick={() => handleLocaleChange('ja')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  locale === 'ja'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'glass glass-hover'
                }`}
              >
                日本語
              </button>
            </div>
          </motion.div>

          {/* Subscription/Donate Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            {isPaid ? (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  {t('settings.donate')}
                </h2>
                <Link
                  href="/pricing?plan=donate"
                  className="inline-block px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-glow transition-all duration-300"
                >
                  {t('settings.donate')}
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  {t('settings.upgrade')}
                </h2>
                <Link
                  href="/pricing"
                  className="inline-block px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-glow transition-all duration-300"
                >
                  {t('settings.upgrade')}
                </Link>
              </>
            )}
          </motion.div>

          {/* Display Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-semibold mb-4">{t('settings.display')}</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">{t('settings.showGitHub')}</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showGitHub}
                    onChange={(e) =>
                      setDisplaySetting('showGitHub', e.target.checked)
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                      showGitHub ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                        showGitHub ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`}
                    />
                  </div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">
                  {t('settings.showWorkHours')}
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showWorkHours}
                    onChange={(e) =>
                      setDisplaySetting('showWorkHours', e.target.checked)
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                      showWorkHours ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                        showWorkHours ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`}
                    />
                  </div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">{t('settings.showSpotify')}</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showSpotify}
                    onChange={(e) =>
                      setDisplaySetting('showSpotify', e.target.checked)
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                      showSpotify ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                        showSpotify ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`}
                    />
                  </div>
                </div>
              </label>
            </div>
          </motion.div>

          {/* Block Unit Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-semibold mb-4">
              {t('settings.blockUnitSettings')}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">
                  {t('settings.workHoursBlockUnit')}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBlockUnit('workHoursBlockUnit', '15min')}
                    className={`px-2 py-1.5 text-sm rounded-lg font-medium transition-all whitespace-nowrap ${
                      workHoursBlockUnit === '15min'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'glass glass-hover'
                    }`}
                  >
                    {t('settings.blockUnit15min')}
                  </button>
                  <button
                    onClick={() => setBlockUnit('workHoursBlockUnit', '30min')}
                    className={`px-2 py-1.5 text-sm rounded-lg font-medium transition-all whitespace-nowrap ${
                      workHoursBlockUnit === '30min'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'glass glass-hover'
                    }`}
                  >
                    {t('settings.blockUnit30min')}
                  </button>
                  <button
                    onClick={() => setBlockUnit('workHoursBlockUnit', '1hour')}
                    className={`px-2 py-1.5 text-sm rounded-lg font-medium transition-all whitespace-nowrap ${
                      workHoursBlockUnit === '1hour'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'glass glass-hover'
                    }`}
                  >
                    {t('settings.blockUnit1hour')}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">
                  {t('settings.spotifyBlockUnit')}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBlockUnit('spotifyBlockUnit', '15min')}
                    className={`px-2 py-1.5 text-sm rounded-lg font-medium transition-all whitespace-nowrap ${
                      spotifyBlockUnit === '15min'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'glass glass-hover'
                    }`}
                  >
                    {t('settings.blockUnit15min')}
                  </button>
                  <button
                    onClick={() => setBlockUnit('spotifyBlockUnit', '30min')}
                    className={`px-2 py-1.5 text-sm rounded-lg font-medium transition-all whitespace-nowrap ${
                      spotifyBlockUnit === '30min'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'glass glass-hover'
                    }`}
                  >
                    {t('settings.blockUnit30min')}
                  </button>
                  <button
                    onClick={() => setBlockUnit('spotifyBlockUnit', '1hour')}
                    className={`px-2 py-1.5 text-sm rounded-lg font-medium transition-all whitespace-nowrap ${
                      spotifyBlockUnit === '1hour'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'glass glass-hover'
                    }`}
                  >
                    {t('settings.blockUnit1hour')}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Grass Colors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-semibold mb-4">
              {t('settings.grassColors')}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">{t('settings.commitColor')}</span>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <input
                      ref={commitColorInputRef}
                      type="color"
                      value={commitColor}
                      onChange={(e) => setGrassColor('commitColor', e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div
                      className="w-10 h-10 rounded-lg border-2 border-white/10 transition-colors group"
                      style={{ backgroundColor: commitColor }}
                    >
                      <div className="w-full h-full rounded-lg group-hover:border-white/20 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">
                  {t('settings.workHourColor')}
                </span>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <input
                      ref={workHourColorInputRef}
                      type="color"
                      value={workHourColor}
                      onChange={(e) => setGrassColor('workHourColor', e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div
                      className="w-10 h-10 rounded-lg border-2 border-white/10 transition-colors group"
                      style={{ backgroundColor: workHourColor }}
                    >
                      <div className="w-full h-full rounded-lg group-hover:border-white/20 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">
                  {t('settings.spotifyColor')}
                </span>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <input
                      ref={spotifyColorInputRef}
                      type="color"
                      value={spotifyColor}
                      onChange={(e) => setGrassColor('spotifyColor', e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div
                      className="w-10 h-10 rounded-lg border-2 border-white/10 transition-colors group"
                      style={{ backgroundColor: spotifyColor }}
                    >
                      <div className="w-full h-full rounded-lg group-hover:border-white/20 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Integrations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-semibold mb-4">{t('settings.integrations')}</h2>
            
            <div className="space-y-4">
              {/* GitHub Integration */}
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div>
                  <p className="font-medium">GitHub</p>
                  <p className="text-sm text-gray-400">
                    {profile?.github_connected ? t('settings.connected') : t('settings.notConnected')}
                  </p>
                </div>
                {profile?.github_connected && (
                  <button
                    onClick={() => handleDisconnectClick('github')}
                    disabled={disconnecting === 'github'}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all duration-200"
                  >
                    {disconnecting === 'github' ? t('common.loading') : t('settings.disconnectGitHub')}
                  </button>
                )}
              </div>

              {/* Spotify Integration */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Spotify</p>
                  <p className="text-sm text-gray-400">
                    {profile?.spotify_connected ? t('settings.connected') : t('settings.notConnected')}
                  </p>
                </div>
                {profile?.spotify_connected && (
                  <button
                    onClick={() => handleDisconnectClick('spotify')}
                    disabled={disconnecting === 'spotify'}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all duration-200"
                  >
                    {disconnecting === 'spotify' ? t('common.loading') : t('settings.disconnectSpotify')}
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* GitHub Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={includeSquashCommits}
                    onChange={(e) =>
                      setGitHubSetting('includeSquashCommits', e.target.checked)
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                      includeSquashCommits ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                        includeSquashCommits ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`}
                    />
                  </div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">
                  {t('settings.includeMergeCommits')}
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={includeMergeCommits}
                    onChange={(e) =>
                      setGitHubSetting('includeMergeCommits', e.target.checked)
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                      includeMergeCommits ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                        includeMergeCommits ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`}
                    />
                  </div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">
                  {t('settings.includeBotCommits')}
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={includeBotCommits}
                    onChange={(e) =>
                      setGitHubSetting('includeBotCommits', e.target.checked)
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                      includeBotCommits ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                        includeBotCommits ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`}
                    />
                  </div>
                </div>
              </label>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Disconnect Dialog */}
      <DisconnectDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleDisconnectConfirm}
        serviceName={dialogService}
        isLoading={disconnecting !== null}
      />
      <Footer />
    </div>
  );
}

