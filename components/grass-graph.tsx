'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { format, subDays } from 'date-fns';

const MAX_BLOCKS = 10;

interface GrassData {
  date: string;
  value: number;
}

interface GrassGraphProps {
  data: GrassData[];
  color: string;
  label: string;
  type: 'commits' | 'hours' | 'spotify';
}

export function GrassGraph({ data, color, label, type }: GrassGraphProps) {
  const t = useTranslations('grass');
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  // Generate last 30 days
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    return format(date, 'yyyy-MM-dd');
  });

  const getValueForDay = (day: string) => {
    const item = data.find((d) => d.date === day);
    return item ? item.value : 0;
  };

  const getBlocks = (value: number) => {
    const blocks = Math.min(value, MAX_BLOCKS);
    const overflow = value > MAX_BLOCKS ? value - MAX_BLOCKS : 0;
    return { blocks, overflow };
  };

  const getTooltipText = (day: string, value: number) => {
    const dateFormatted = format(new Date(day), 'MMM d');
    if (type === 'commits') {
      return `${dateFormatted} - ${t('commits', { count: value })}`;
    } else if (type === 'hours') {
      return `${dateFormatted} - ${t('hours', { count: value })}`;
    } else {
      return `${dateFormatted} - ${t('listeningTime', { minutes: value })}`;
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-gray-400 mb-4">{label}</h3>
      <div className="flex gap-[2px] overflow-x-auto pb-2">
        {days.map((day, dayIndex) => {
          const value = getValueForDay(day);
          const { blocks, overflow } = getBlocks(value);
          const isHovered = hoveredDay === day;

          return (
            <div
              key={day}
              className="flex flex-col-reverse gap-[2px] min-w-[12px] h-[120px] relative"
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              {/* Blocks */}
              {Array.from({ length: MAX_BLOCKS }).map((_, blockIndex) => {
                const isActive = blockIndex < blocks;
                const isOverflow = overflow > 0 && blockIndex === MAX_BLOCKS - 1;

                return (
                  <motion.div
                    key={blockIndex}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: isActive ? 1 : 0.1,
                      scale: isActive ? 1 : 0.95,
                    }}
                    transition={{
                      delay: dayIndex * 0.02 + blockIndex * 0.01,
                      duration: 0.3,
                    }}
                    className="relative w-full h-[10px] rounded-sm transition-all"
                    style={{
                      backgroundColor: isActive ? color : 'rgba(255,255,255,0.05)',
                      backdropFilter: isActive ? 'blur(8px)' : 'none',
                      opacity: isActive ? (isHovered ? 1 : 0.8) : 0.1,
                      boxShadow: isActive && isHovered
                        ? `0 0 10px ${color}40`
                        : 'none',
                    }}
                  >
                    {/* Overflow shimmer effect */}
                    {isActive && isOverflow && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                        animate={{
                          x: ['-100%', '100%'],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                          ease: 'linear',
                        }}
                      />
                    )}
                  </motion.div>
                );
              })}

              {/* Tooltip */}
              {isHovered && value > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap"
                >
                  <div className="glass-card px-3 py-2 text-xs text-white shadow-lg">
                    {getTooltipText(day, value)}
                    {overflow > 0 && (
                      <div className="text-xs text-purple-300 mt-1">
                        +{overflow} more
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
