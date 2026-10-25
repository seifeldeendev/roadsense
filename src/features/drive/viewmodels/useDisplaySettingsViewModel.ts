import type { LocationSourceKind, SoundMode } from '@/domain/entities';
import { useSettingsStore } from '@/stores/useSettingsStore';

// 0 stands for "off" so the segmented control can hold a plain number.
export type SpeedAlarmChoice = 0 | 80 | 100 | 120;

export type DisplaySettingsViewModel = {
  locationSource: LocationSourceKind;
  setLocationSource: (source: LocationSourceKind) => void;
  soundMode: SoundMode;
  setSoundMode: (mode: SoundMode) => void;
  satellite: boolean;
  setSatellite: (on: boolean) => void;
  showTraffic: boolean;
  setShowTraffic: (on: boolean) => void;
  northUp: boolean;
  setNorthUp: (on: boolean) => void;
  showRoadName: boolean;
  setShowRoadName: (on: boolean) => void;
  speedAlarm: SpeedAlarmChoice;
  setSpeedAlarm: (choice: SpeedAlarmChoice) => void;
};

export function useDisplaySettingsViewModel(): DisplaySettingsViewModel {
  const settings = useSettingsStore();
  return {
    locationSource: settings.locationSource,
    setLocationSource: settings.setLocationSource,
    soundMode: settings.soundMode,
    setSoundMode: settings.setSoundMode,
    satellite: settings.mapType === 'satellite',
    setSatellite: (on) => settings.setMapType(on ? 'satellite' : 'standard'),
    showTraffic: settings.showTraffic,
    setShowTraffic: settings.setShowTraffic,
    northUp: settings.northUp,
    setNorthUp: settings.setNorthUp,
    showRoadName: settings.showRoadName,
    setShowRoadName: settings.setShowRoadName,
    speedAlarm: (settings.speedAlarmKmh ?? 0) as SpeedAlarmChoice,
    setSpeedAlarm: (choice) => settings.setSpeedAlarm(choice === 0 ? null : choice),
  };
}
