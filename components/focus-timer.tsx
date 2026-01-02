'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('focus');
  const {
    isFocusing,
    focusStartTime,
    totalFocusToday,
    startFocus,
    stopFocus,
    updateActivity,
  } = useFocusStore();

  const [currentDuration, setCurrentDuration] = useState(0);

  useEffect(() => {
    if (isFocusing && focusStartTime) {
      const interval = setInterval(() => {
        setCurrentDuration(Date.now() - focusStartTime);
        updateActivity();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isFocusing, focusStartTime, updateActivity]);

  useEffect(() => {
    // Track user activity
    const handleActivity = () => {
      updateActivity();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [updateActivity]);

  const handleToggleFocus = () => {
    if (isFocusing) {
      stopFocus();
      setCurrentDuration(0);
    } else {
      startFocus();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6"
    >
      <h3 className="text-lg font-semibold mb-4">{t('focusMode')}</h3>

      <div className="flex flex-col items-center gap-4">
        {/* Timer Display */}
        <div className="text-4xl font-mono font-bold">
          {isFocusing ? formatDuration(currentDuration) : '0:00'}
        </div>

        {isFocusing && (
          <p className="text-sm text-gray-400">
            {t('activeFor', { duration: formatDuration(currentDuration) })}
          </p>
        )}

        {/* Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggleFocus}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
            isFocusing
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-glow'
          }`}
        >
          {isFocusing ? t('stopFocus') : t('startFocus')}
        </motion.button>

        {/* Total Today */}
        {totalFocusToday > 0 && (
          <div className="text-sm text-gray-400 mt-2">
            {t('totalToday', { duration: formatDuration(totalFocusToday) })}
          </div>
        )}

        {/* Pulsing indicator when active */}
        {isFocusing && (
          <motion.div
            className="w-3 h-3 bg-green-500 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
