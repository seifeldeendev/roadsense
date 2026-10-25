import type { HazardType } from './hazard-type';

export type AlertTarget = HazardType | 'camera';

export type SoundMode = 'all' | 'cameras' | 'vibrate' | 'muted';

export type MapType = 'standard' | 'satellite';

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
}
