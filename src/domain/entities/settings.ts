import type { HazardType } from './hazard-type';

// What a driver can switch alerts on and off for.
export type AlertTarget = HazardType | 'camera' | 'police' | 'bump';

export type SoundMode = 'all' | 'cameras' | 'vibrate' | 'muted';

export type MapType = 'standard' | 'satellite';

// Real GPS, or the recorded demo drive for testing indoors.
export type LocationSourceKind = 'gps' | 'demo';

export interface Settings {
  alertDistanceM: 200 | 300 | 500 | 800;
  enabledTypes: AlertTarget[];
  voiceEnabled: boolean;
  soundEnabled: boolean;
  units: 'kmh';
  amberThresholdPct: 85 | 90 | 95;
  soundMode: SoundMode;
  mapType: MapType;
  showTraffic: boolean;
  northUp: boolean;
  showRoadName: boolean;
  // Personal over-speed warning, independent of the road limit; null = off.
  speedAlarmKmh: number | null;
  locationSource: LocationSourceKind;
  // Kinds of point kept off the maps (they can still alert; see enabledTypes).
  hiddenOnMap: AlertTarget[];
  // Drive screen elements the driver can hide.
  showLimitSign: boolean;
  showSpeedometer: boolean;
  showAlertsAhead: boolean;
}
