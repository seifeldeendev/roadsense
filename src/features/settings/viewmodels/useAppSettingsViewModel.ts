import type { AlertTarget, LocationSourceKind, Settings, SoundMode } from '@/domain/entities';
import { speak } from '@/services/speech';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useThemeStore, type ThemePreference } from '@/stores/useThemeStore';

// Shared by the Map & layers, Sound & voice, Drive screen and Appearance pages.
export type AppSettingsViewModel = {
  locationSource: LocationSourceKind;
  setLocationSource: (source: LocationSourceKind) => void;
  satellite: boolean;
  setSatellite: (on: boolean) => void;
  showTraffic: boolean;
  setShowTraffic: (on: boolean) => void;
  northUp: boolean;
  setNorthUp: (on: boolean) => void;
  isShownOnMap: (target: AlertTarget) => boolean;
  toggleShownOnMap: (target: AlertTarget) => void;
  soundMode: SoundMode;
  setSoundMode: (mode: SoundMode) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (on: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (on: boolean) => void;
  testVoice: () => void;
  isOn: (key: DriveScreenToggle) => boolean;
  setOn: (key: DriveScreenToggle, on: boolean) => void;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
};

export type DriveScreenToggle = 'showLimitSign' | 'showSpeedometer' | 'showRoadName' | 'showAlertsAhead';

export function useAppSettingsViewModel(): AppSettingsViewModel {
  const settings = useSettingsStore();
  const themePreference = useThemeStore((s) => s.preference);
  const setThemePreference = useThemeStore((s) => s.setPreference);
  const set = (patch: Partial<Settings>) => settings.update(patch);

  return {
    locationSource: settings.locationSource,
    setLocationSource: (locationSource) => set({ locationSource }),
    satellite: settings.mapType === 'satellite',
    setSatellite: (on) => set({ mapType: on ? 'satellite' : 'standard' }),
    showTraffic: settings.showTraffic,
    setShowTraffic: (showTraffic) => set({ showTraffic }),
    northUp: settings.northUp,
    setNorthUp: (northUp) => set({ northUp }),
    isShownOnMap: (target) => !settings.hiddenOnMap.includes(target),
    toggleShownOnMap: settings.toggleHiddenOnMap,
    soundMode: settings.soundMode,
    setSoundMode: (soundMode) => set({ soundMode }),
    voiceEnabled: settings.voiceEnabled,
    setVoiceEnabled: (voiceEnabled) => set({ voiceEnabled }),
    soundEnabled: settings.soundEnabled,
    setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
    testVoice: () => {
      if (settings.voiceEnabled) speak('Speed camera in 300 metres');
    },
    isOn: (key) => settings[key],
    setOn: (key, on) => set({ [key]: on }),
    themePreference,
    setThemePreference,
  };
}
