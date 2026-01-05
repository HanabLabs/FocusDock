'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { useFocusStore } from '@/lib/store/use-focus-store';

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function FocusTimer() {
  const { t } = useI18n();
  const {
    state,
    sessionStartTime,
    pauseStartTime,
    totalPausedTime,
    totalFocusToday,
    startFocus,
    pauseFocus,
    resumeFocus,
    endFocus,
  } = useFocusStore();

  const [currentDuration, setCurrentDuration] = useState(0);

  useEffect(() => {
    if (state === 'active' && sessionStartTime) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - sessionStartTime - totalPausedTime;
        setCurrentDuration(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    } else if (state === 'paused' && sessionStartTime && pauseStartTime) {
      // Keep showing the duration when paused (frozen)
      const pausedAt = pauseStartTime - sessionStartTime - totalPausedTime;
      setCurrentDuration(pausedAt);
    } else if (state === 'idle') {
      setCurrentDuration(0);
    }
  }, [state, sessionStartTime, pauseStartTime, totalPausedTime]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6"
    >
        <h3 className="text-lg font-semibold mb-4">{t('focus.focusMode')}</h3>

      <div className="flex flex-col items-center gap-4">
        {/* Timer Display */}
        <div className="text-4xl font-mono font-bold">
          {formatDuration(currentDuration)}
        </div>

        {/* Status indicator */}
        {state !== 'idle' && (
          <div className="flex items-center gap-2">
            <motion.div
              className={`w-3 h-3 rounded-full ${
                state === 'active' ? 'bg-green-500' : 'bg-yellow-500'
              }`}
              animate={
                state === 'active'
                  ? {
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.7, 1],
                    }
                  : {}
              }
              transition={
                state === 'active'
                  ? {
                      repeat: Infinity,
                      duration: 2,
                    }
                  : {}
              }
            />
            <p className="text-sm text-gray-400">
              {state === 'active' ? t('focus.statusActive') : t('focus.statusPaused')}
            </p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex flex-col gap-3 w-full">
          {state === 'idle' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startFocus}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-glow transition-all duration-300"
            >
                {t('focus.startWork')}
            </motion.button>
          )}

          {state === 'active' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={pauseFocus}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 rounded-lg font-semibold transition-all duration-300"
              >
                {t('focus.pauseWork')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={endFocus}
                className="w-full py-3 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition-all duration-300"
              >
                {t('focus.endWork')}
              </motion.button>
            </>
          )}

          {state === 'paused' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resumeFocus}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-glow transition-all duration-300"
              >
                {t('focus.resumeWork')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={endFocus}
                className="w-full py-3 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition-all duration-300"
              >
                {t('focus.endWork')}
              </motion.button>
            </>
          )}
        </div>

        {/* Total Today */}
        {totalFocusToday > 0 && (
          <div className="text-sm text-gray-400 mt-2">
            {t('focus.totalToday').replace('{duration}', formatDuration(totalFocusToday))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
