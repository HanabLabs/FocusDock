import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type BlockUnit = '15min' | '30min' | '1hour';

interface SettingsStore {
  // GitHub settings
  includeSquashCommits: boolean;
  includeMergeCommits: boolean;
  includeBotCommits: boolean;

  // Grass colors
  commitColor: string;
  workHourColor: string;
  spotifyColor: string;

  // Display settings
  showGitHub: boolean;
  showWorkHours: boolean;
  showSpotify: boolean;

  // Block unit settings
  workHoursBlockUnit: BlockUnit;
  spotifyBlockUnit: BlockUnit;

  // Actions
  setGitHubSetting: (key: string, value: boolean) => void;
  setGrassColor: (key: string, value: string) => void;
  setDisplaySetting: (key: string, value: boolean) => void;
  setBlockUnit: (key: 'workHoursBlockUnit' | 'spotifyBlockUnit', value: BlockUnit) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // Default values
      includeSquashCommits: true,
      includeMergeCommits: false,
      includeBotCommits: false,

      commitColor: '#8b5cf6',
      workHourColor: '#ec4899',
      spotifyColor: '#1db954',

      showGitHub: true,
      showWorkHours: true,
      showSpotify: true,

      workHoursBlockUnit: '1hour',
      spotifyBlockUnit: '1hour',

      setGitHubSetting: (key, value) =>
        set((state) => ({ ...state, [key]: value })),

      setGrassColor: (key, value) =>
        set((state) => ({ ...state, [key]: value })),

      setDisplaySetting: (key, value) =>
        set((state) => ({ ...state, [key]: value })),

      setBlockUnit: (key, value) =>
        set((state) => ({ ...state, [key]: value })),
    }),
    {
      name: 'focusdock-settings',
    }
  )
);
