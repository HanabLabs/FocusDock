import { create } from 'zustand';

interface FocusStore {
  isFocusing: boolean;
  focusStartTime: number | null;
  totalFocusToday: number;
  lastActivityTime: number;

  startFocus: () => void;
  stopFocus: () => void;
  updateActivity: () => void;
  resetDailyFocus: () => void;
}

const INACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutes

export const useFocusStore = create<FocusStore>((set, get) => ({
  isFocusing: false,
  focusStartTime: null,
  totalFocusToday: 0,
  lastActivityTime: Date.now(),

  startFocus: () => {
    set({
      isFocusing: true,
      focusStartTime: Date.now(),
      lastActivityTime: Date.now(),
    });
  },

  stopFocus: () => {
    const { focusStartTime, totalFocusToday } = get();
    if (focusStartTime) {
      const sessionDuration = Date.now() - focusStartTime;
      set({
        isFocusing: false,
        focusStartTime: null,
        totalFocusToday: totalFocusToday + sessionDuration,
      });
    }
  },

  updateActivity: () => {
    const { isFocusing, lastActivityTime, focusStartTime, totalFocusToday } = get();
    const now = Date.now();

    if (isFocusing && focusStartTime) {
      // Check for inactivity
      if (now - lastActivityTime > INACTIVITY_THRESHOLD) {
        // Stop focus due to inactivity
        const sessionDuration = lastActivityTime - focusStartTime;
        set({
          isFocusing: false,
          focusStartTime: null,
          totalFocusToday: totalFocusToday + sessionDuration,
        });
      } else {
        set({ lastActivityTime: now });
      }
    }
  },

  resetDailyFocus: () => {
    set({ totalFocusToday: 0 });
  },
}));
