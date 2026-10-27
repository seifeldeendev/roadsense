import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AlertTarget, Settings } from '../domain/entities';
import { DEFAULT_SETTINGS } from '../shared/constants';

interface SettingsState extends Settings {
  setAlertDistance(alertDistanceM: Settings['alertDistanceM']): void;
  toggleType(type: AlertTarget): void;
  setVoiceEnabled(voiceEnabled: boolean): void;
  setSoundEnabled(soundEnabled: boolean): void;
  setAmberThreshold(amberThresholdPct: Settings['amberThresholdPct']): void;
  reset(): void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setAlertDistance: (alertDistanceM) => set({ alertDistanceM }),
      toggleType: (type) =>
        set((state) => ({
          enabledTypes: state.enabledTypes.includes(type)
            ? state.enabledTypes.filter((t) => t !== type)
            : [...state.enabledTypes, type],
        })),
      setVoiceEnabled: (voiceEnabled) => set({ voiceEnabled }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setAmberThreshold: (amberThresholdPct) => set({ amberThresholdPct }),
      reset: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      name: 'roadsense.settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
