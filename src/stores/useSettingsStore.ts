import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from './persistStorage';
import type { AlertTarget, LocationSourceKind, MapType, Settings, SoundMode } from '../domain/entities';
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
  setLocationSource(locationSource: LocationSourceKind): void;
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
      setLocationSource: (locationSource) => set({ locationSource }),
      reset: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      name: 'roadsense.settings',
      storage: persistStorage,
      // v1 added the police and speed-bump alert switches; turn them on for saved settings.
      version: 1,
      migrate: (persisted, version) => {
        const state = persisted as Partial<Settings>;
        if (version < 1 && state.enabledTypes !== undefined) {
          const added: AlertTarget[] = ['police', 'bump'];
          state.enabledTypes = [...state.enabledTypes, ...added.filter((t) => !state.enabledTypes?.includes(t))];
        }
        return state as SettingsState;
      },
    },
  ),
);
