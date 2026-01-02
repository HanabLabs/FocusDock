import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

  // Actions
  setGitHubSetting: (key: string, value: boolean) => void;
  setGrassColor: (key: string, value: string) => void;
  setDisplaySetting: (key: string, value: boolean) => void;
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

      setGitHubSetting: (key, value) =>
        set((state) => ({ ...state, [key]: value })),

      setGrassColor: (key, value) =>
        set((state) => ({ ...state, [key]: value })),

      setDisplaySetting: (key, value) =>
        set((state) => ({ ...state, [key]: value })),
    }),
    {
      name: 'focusdock-settings',
    }
  )
);
