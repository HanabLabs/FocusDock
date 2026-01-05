import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FocusState = 'idle' | 'active' | 'paused';

interface FocusStore {
  state: FocusState;
  sessionStartTime: number | null;
  pauseStartTime: number | null;
  totalPausedTime: number;
  totalFocusToday: number;
  lastDate: string | null;

  startFocus: () => void;
  pauseFocus: () => void;
  resumeFocus: () => void;
  endFocus: () => Promise<void>;
  resetDailyFocus: () => void;
  getCurrentWorkTime: () => number; // Get current work time including active session
}

// Helper function to get today's date string (YYYY-MM-DD)
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export const useFocusStore = create<FocusStore>()(
  persist(
    (set, get) => ({
      state: 'idle',
      sessionStartTime: null,
      pauseStartTime: null,
      totalPausedTime: 0,
      totalFocusToday: 0,
      lastDate: getTodayDateString(),

      startFocus: () => {
        const today = getTodayDateString();
        const { lastDate } = get();
        
        // Reset totalFocusToday if date has changed
        const updates: Partial<FocusStore> = {
          state: 'active',
          sessionStartTime: Date.now(),
          pauseStartTime: null,
          totalPausedTime: 0,
        };
        
        if (lastDate !== today) {
          updates.totalFocusToday = 0;
          updates.lastDate = today;
        }
        
        set(updates);
      },

      pauseFocus: () => {
        const { state, sessionStartTime, totalPausedTime, lastDate, totalFocusToday, pauseStartTime } = get();
        if (state === 'active' && sessionStartTime) {
          const today = getTodayDateString();
          
          // Check if date changed during active session
          const sessionStartDate = new Date(sessionStartTime).toISOString().split('T')[0];
          
          if (sessionStartDate !== today) {
            // Date changed - save previous date's work and start new day
            const midnight = new Date(today + 'T00:00:00').getTime();
            const timeBeforeMidnight = Math.max(0, midnight - sessionStartTime - totalPausedTime);
            
            // Reset for new day (previous day's work time would need DB save in real app)
            set({
              state: 'paused',
              pauseStartTime: Date.now(),
              sessionStartTime: midnight, // Reset session start to midnight
              totalPausedTime: 0,
              totalFocusToday: 0, // Start fresh for new day
              lastDate: today,
            });
          } else {
            // Same day, just pause
            set({
              state: 'paused',
              pauseStartTime: Date.now(),
            });
          }
        }
      },

      resumeFocus: () => {
        const { state, pauseStartTime, totalPausedTime, sessionStartTime, lastDate } = get();
        if (state === 'paused' && pauseStartTime && sessionStartTime) {
          const today = getTodayDateString();
          
          // Reset if date changed while paused
          if (lastDate !== today) {
            set({
              state: 'active',
              sessionStartTime: Date.now(),
              pauseStartTime: null,
              totalPausedTime: 0,
              totalFocusToday: 0,
              lastDate: today,
            });
          } else {
            // Same day, resume
            const pauseDuration = Date.now() - pauseStartTime;
            set({
              state: 'active',
              pauseStartTime: null,
              totalPausedTime: totalPausedTime + pauseDuration,
            });
          }
        }
      },

      endFocus: async () => {
        const { state, sessionStartTime, totalPausedTime, totalFocusToday, pauseStartTime, lastDate } = get();
        const today = getTodayDateString();

        if ((state === 'active' || state === 'paused') && sessionStartTime) {
          let totalSessionTime = Date.now() - sessionStartTime;
          let finalPausedTime = totalPausedTime;

          // If still paused when ending, add current pause duration
          if (state === 'paused' && pauseStartTime) {
            finalPausedTime += Date.now() - pauseStartTime;
          }

          // Net work time = total session time - total paused time
          const netWorkTime = totalSessionTime - finalPausedTime;

          // Calculate work time for previous date (if date changed during session)
          const sessionStartDate = new Date(sessionStartTime).toISOString().split('T')[0];

          if (sessionStartDate !== today) {
            // Date changed during session - split the work time
            const midnight = new Date(today + 'T00:00:00').getTime();
            const timeBeforeMidnight = Math.max(0, midnight - sessionStartTime - (state === 'paused' ? totalPausedTime + (pauseStartTime ? Date.now() - pauseStartTime : 0) : totalPausedTime));
            const timeAfterMidnight = Math.max(0, Date.now() - midnight - (state === 'paused' && pauseStartTime ? Date.now() - pauseStartTime : 0));

            // Save work session for previous date (before midnight)
            if (timeBeforeMidnight > 0) {
              const durationMinutes = timeBeforeMidnight / (1000 * 60);
              try {
                await fetch('/api/save-work-session', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    startedAt: sessionStartTime,
                    endedAt: midnight,
                    durationMinutes,
                  }),
                });
              } catch (error) {
                console.error('Failed to save work session:', error);
              }
            }

            // Only count time after midnight for today
            set({
              state: 'idle',
              sessionStartTime: null,
              pauseStartTime: null,
              totalPausedTime: 0,
              totalFocusToday: timeAfterMidnight > 0 ? timeAfterMidnight : 0,
              lastDate: today,
            });
            return;
          }

          // Save work session to database
          if (netWorkTime > 0) {
            const durationMinutes = netWorkTime / (1000 * 60);
            try {
              await fetch('/api/save-work-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  startedAt: sessionStartTime,
                  endedAt: Date.now(),
                  durationMinutes,
                }),
              });
            } catch (error) {
              console.error('Failed to save work session:', error);
            }
          }

          // Reset totalFocusToday if date has changed
          const newTotalFocusToday = lastDate === today ? totalFocusToday + netWorkTime : netWorkTime;

          set({
            state: 'idle',
            sessionStartTime: null,
            pauseStartTime: null,
            totalPausedTime: 0,
            totalFocusToday: newTotalFocusToday,
            lastDate: today,
          });
        }
      },

      resetDailyFocus: () => {
        set({ totalFocusToday: 0 });
      },

      getCurrentWorkTime: () => {
        const { state, sessionStartTime, totalPausedTime, totalFocusToday, pauseStartTime, lastDate } = get();
        const today = getTodayDateString();
        
        // Reset if date changed
        if (lastDate !== today) {
          // If active, calculate time from midnight
          if (state === 'active' && sessionStartTime) {
            const sessionStartDate = new Date(sessionStartTime).toISOString().split('T')[0];
            if (sessionStartDate !== today) {
              // Session started yesterday, calculate from midnight
              const midnight = new Date(today + 'T00:00:00').getTime();
              return Date.now() - midnight - totalPausedTime;
            }
            return Date.now() - sessionStartTime - totalPausedTime;
          }
          return 0;
        }

        // If active, add current session time
        if (state === 'active' && sessionStartTime) {
          const currentSessionTime = Date.now() - sessionStartTime - totalPausedTime;
          return totalFocusToday + currentSessionTime;
        }

        // If paused, add time up to pause
        if (state === 'paused' && sessionStartTime && pauseStartTime) {
          const pausedAtTime = pauseStartTime - sessionStartTime - totalPausedTime;
          return totalFocusToday + pausedAtTime;
        }

        // Otherwise return stored total
        return totalFocusToday;
      },
    }),
    {
      name: 'focusdock-focus-store',
      onRehydrateStorage: () => (state) => {
        // Reset totalFocusToday if date has changed when rehydrating
        if (state) {
          const today = getTodayDateString();
          if (state.lastDate && state.lastDate !== today) {
            state.totalFocusToday = 0;
            state.lastDate = today;
            // Reset active session if date changed
            if (state.state === 'active' || state.state === 'paused') {
              state.state = 'idle';
              state.sessionStartTime = null;
              state.pauseStartTime = null;
              state.totalPausedTime = 0;
            }
          } else if (!state.lastDate) {
            state.lastDate = today;
          }
        }
      },
    }
  )
);
