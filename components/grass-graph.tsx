'use client';

import { useMemo, useState } from 'react';
import { format, subDays } from 'date-fns';
import { ja } from 'date-fns/locale';

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
  locale?: string;
  blockUnit?: '15min' | '30min' | '1hour'; // For hours and spotify types
}

export function GrassGraph({ data, color, label, type, locale = 'en', blockUnit = '1hour' }: GrassGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  // Memoize days array (50 days)
  const days = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const date = subDays(new Date(), 49 - i);
      return format(date, 'yyyy-MM-dd');
    });
  }, []);

  // Memoize data map for faster lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((item) => {
      map.set(item.date, item.value);
    });
    return map;
  }, [data]);

  const getValueForDay = (day: string) => {
    return dataMap.get(day) || 0;
  };

  const getBlocks = (value: number) => {
    // Round to nearest integer for block count
    const blockCount = Math.round(value);
    const blocks = Math.min(blockCount, MAX_BLOCKS);
    const overflow = blockCount > MAX_BLOCKS ? blockCount - MAX_BLOCKS : 0;
    return { blocks, overflow };
  };

  // Format value based on type
  const formatValue = (value: number) => {
    const roundedValue = Math.round(value);

    if (type === 'commits') {
      return locale === 'ja'
        ? `${roundedValue}コミット`
        : `${roundedValue} ${roundedValue === 1 ? 'commit' : 'commits'}`;
    } else if (type === 'hours') {
      // Convert blocks to actual time based on blockUnit
      let minutes = 0;
      if (blockUnit === '15min') {
        minutes = roundedValue * 15;
      } else if (blockUnit === '30min') {
        minutes = roundedValue * 30;
      } else {
        minutes = roundedValue * 60;
      }

      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      if (locale === 'ja') {
        if (hours > 0 && remainingMinutes > 0) {
          return `${hours}時間${remainingMinutes}分`;
        } else if (hours > 0) {
          return `${hours}時間`;
        } else {
          return `${remainingMinutes}分`;
        }
      } else {
        if (hours > 0 && remainingMinutes > 0) {
          return `${hours}h ${remainingMinutes}m`;
        } else if (hours > 0) {
          return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
        } else {
          return `${remainingMinutes} min`;
        }
      }
    } else {
      // spotify - also use blockUnit
      let minutes = 0;
      if (blockUnit === '15min') {
        minutes = roundedValue * 15;
      } else if (blockUnit === '30min') {
        minutes = roundedValue * 30;
      } else {
        minutes = roundedValue * 60;
      }

      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      if (locale === 'ja') {
        if (hours > 0 && remainingMinutes > 0) {
          return `${hours}時間${remainingMinutes}分`;
        } else if (hours > 0) {
          return `${hours}時間`;
        } else {
          return `${remainingMinutes}分`;
        }
      } else {
        if (hours > 0 && remainingMinutes > 0) {
          return `${hours}h ${remainingMinutes}m`;
        } else if (hours > 0) {
          return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
        } else {
          return `${remainingMinutes} min`;
        }
      }
    }
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (locale === 'ja') {
      return format(date, 'M月d日 (E)', { locale: ja });
    }
    return format(date, 'MMM d, E');
  };

  return (
    <div className="w-full">
      {/* Header with label and hover info */}
      <div className="flex items-center justify-between mb-4 min-h-[20px]">
        <h3 className="text-sm font-medium text-gray-400">{label}</h3>
        {hoveredDay && (
          <div className="text-xs text-gray-300 flex items-center gap-2 animate-in fade-in duration-150">
            <span className="font-semibold">{formatDate(hoveredDay)}</span>
            <span className="text-gray-400">·</span>
            <span>{formatValue(getValueForDay(hoveredDay))}</span>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <div className="flex gap-[2px] overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
          {days.map((day) => {
            const value = getValueForDay(day);
            const { blocks, overflow } = getBlocks(value);

            return (
              <div
                key={day}
                className="flex flex-col-reverse gap-[2px] min-w-[12px] h-[110px] relative group"
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Blocks */}
                {Array.from({ length: MAX_BLOCKS }).map((_, blockIndex) => {
                  const isActive = blockIndex < blocks;
                  const isOverflow = overflow > 0 && blockIndex === MAX_BLOCKS - 1;

                  return (
                    <div
                      key={blockIndex}
                      className="relative w-full h-[10px] rounded-sm transition-all duration-200 group-hover:opacity-100"
                      style={{
                        backgroundColor: isActive ? color : 'rgba(255,255,255,0.05)',
                        backdropFilter: isActive ? 'blur(8px)' : 'none',
                        opacity: isActive ? 0.8 : 0.1,
                      }}
                    >
                      {/* Overflow shimmer effect */}
                      {isActive && isOverflow && (
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"
                          style={{
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
