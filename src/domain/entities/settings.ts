import type { HazardType } from './hazard-type';

export type AlertTarget = HazardType | 'camera';

export interface Settings {
  alertDistanceM: 200 | 300 | 500 | 800;
  enabledTypes: AlertTarget[];
  voiceEnabled: boolean;
  soundEnabled: boolean;
  units: 'kmh';
  amberThresholdPct: 85 | 90 | 95;
}
