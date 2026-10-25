import type { HazardType, Settings } from '../domain/entities';

const HOUR_MS = 3_600_000;

export const DEFAULT_SETTINGS: Settings = {
  alertDistanceM: 300,
  enabledTypes: ['camera', 'accident', 'pothole', 'checkpoint', 'flooding'],
  voiceEnabled: true,
  soundEnabled: true,
  units: 'kmh',
  amberThresholdPct: 90,
  soundMode: 'all',
  mapType: 'standard',
  showTraffic: false,
  northUp: false,
  showRoadName: true,
  speedAlarmKmh: null,
  locationSource: 'gps',
};

export const SPEED_ALARM_OPTIONS = [80, 100, 120] as const;

export const ALERT_DISTANCE_OPTIONS = [200, 300, 500, 800] as const;
export const AMBER_OPTIONS = [85, 90, 95] as const;
export const HEADING_CONE_DEG = 45;
export const HAZARD_DENIAL_LIMIT = 3;

export const HAZARD_TTL_MS: Record<HazardType, number> = {
  accident: 2 * HOUR_MS,
  checkpoint: 4 * HOUR_MS,
  flooding: 24 * HOUR_MS,
  pothole: 7 * 24 * HOUR_MS,
};

export const DEMO_CREDENTIALS = {
  email: 'demo@roadsense.app',
  password: 'Drive2026',
} as const;
