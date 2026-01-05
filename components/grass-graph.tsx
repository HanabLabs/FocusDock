'use client';

import { useMemo } from 'react';
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

export function GrassGraph({ data, color, label }: GrassGraphProps) {

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


  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-gray-400 mb-4">{label}</h3>
      <div className="flex justify-center">
        <div className="flex gap-[2px] overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
          {days.map((day) => {
            const value = getValueForDay(day);
            const { blocks, overflow } = getBlocks(value);

            return (
              <div
                key={day}
                className="flex flex-col-reverse gap-[2px] min-w-[12px] h-[110px] relative"
              >
                {/* Blocks */}
                {Array.from({ length: MAX_BLOCKS }).map((_, blockIndex) => {
                  const isActive = blockIndex < blocks;
                  const isOverflow = overflow > 0 && blockIndex === MAX_BLOCKS - 1;

                  return (
                    <div
                      key={blockIndex}
                      className="relative w-full h-[10px] rounded-sm transition-all duration-200"
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
