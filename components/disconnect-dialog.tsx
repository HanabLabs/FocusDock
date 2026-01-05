'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

interface DisconnectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  serviceName: 'GitHub' | 'Spotify';
  isLoading?: boolean;
}

export function DisconnectDialog({
  isOpen,
  onClose,
  onConfirm,
  serviceName,
  isLoading = false,
}: DisconnectDialogProps) {
  const { t } = useI18n();

  const disconnectLabel = serviceName === 'GitHub' 
    ? t('settings.disconnectGitHub')
    : t('settings.disconnectSpotify');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold mb-4">
                {t('settings.disconnectConfirm').replace('{service}', serviceName)}
              </h3>
              <p className="text-gray-400 mb-6">
                {t('settings.disconnectMessage').replace('{service}', serviceName)}
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 glass glass-hover rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all duration-200"
                >
                  {isLoading ? t('common.loading') : disconnectLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

