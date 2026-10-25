import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from './persistStorage';
import type { AlertTarget, MapType, Settings, SoundMode } from '../domain/entities';
import { DEFAULT_SETTINGS } from '../shared/constants';

interface SettingsState extends Settings {
  setAlertDistance(alertDistanceM: Settings['alertDistanceM']): void;
  toggleType(type: AlertTarget): void;
  setVoiceEnabled(voiceEnabled: boolean): void;
  setSoundEnabled(soundEnabled: boolean): void;
  setAmberThreshold(amberThresholdPct: Settings['amberThresholdPct']): void;
  setSoundMode(soundMode: SoundMode): void;
  setMapType(mapType: MapType): void;
  setShowTraffic(showTraffic: boolean): void;
  setNorthUp(northUp: boolean): void;
  setShowRoadName(showRoadName: boolean): void;
  setSpeedAlarm(speedAlarmKmh: number | null): void;
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
      setSoundMode: (soundMode) => set({ soundMode }),
      setMapType: (mapType) => set({ mapType }),
      setShowTraffic: (showTraffic) => set({ showTraffic }),
      setNorthUp: (northUp) => set({ northUp }),
      setShowRoadName: (showRoadName) => set({ showRoadName }),
      setSpeedAlarm: (speedAlarmKmh) => set({ speedAlarmKmh }),
      reset: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      name: 'roadsense.settings',
      storage: persistStorage,
    },
  ),
);
