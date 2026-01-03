import { create } from 'zustand';

type FocusState = 'idle' | 'active' | 'paused';

interface FocusStore {
  state: FocusState;
  sessionStartTime: number | null;
  pauseStartTime: number | null;
  totalPausedTime: number;
  totalFocusToday: number;

  startFocus: () => void;
  pauseFocus: () => void;
  resumeFocus: () => void;
  endFocus: () => void;
  resetDailyFocus: () => void;
}

export const useFocusStore = create<FocusStore>((set, get) => ({
  state: 'idle',
  sessionStartTime: null,
  pauseStartTime: null,
  totalPausedTime: 0,
  totalFocusToday: 0,

  startFocus: () => {
    set({
      state: 'active',
      sessionStartTime: Date.now(),
      pauseStartTime: null,
      totalPausedTime: 0,
    });
  },

  pauseFocus: () => {
    const { state } = get();
    if (state === 'active') {
      set({
        state: 'paused',
        pauseStartTime: Date.now(),
      });
    }
  },

  resumeFocus: () => {
    const { state, pauseStartTime, totalPausedTime } = get();
    if (state === 'paused' && pauseStartTime) {
      const pauseDuration = Date.now() - pauseStartTime;
      set({
        state: 'active',
        pauseStartTime: null,
        totalPausedTime: totalPausedTime + pauseDuration,
      });
    }
  },

  endFocus: () => {
    const { state, sessionStartTime, totalPausedTime, totalFocusToday, pauseStartTime } = get();

    if ((state === 'active' || state === 'paused') && sessionStartTime) {
      let totalSessionTime = Date.now() - sessionStartTime;
      let finalPausedTime = totalPausedTime;

      // If still paused when ending, add current pause duration
      if (state === 'paused' && pauseStartTime) {
        finalPausedTime += Date.now() - pauseStartTime;
      }

      // Net work time = total session time - total paused time
      const netWorkTime = totalSessionTime - finalPausedTime;

      set({
        state: 'idle',
        sessionStartTime: null,
        pauseStartTime: null,
        totalPausedTime: 0,
        totalFocusToday: totalFocusToday + netWorkTime,
      });
    }
  },

  resetDailyFocus: () => {
    set({ totalFocusToday: 0 });
  },
}));
