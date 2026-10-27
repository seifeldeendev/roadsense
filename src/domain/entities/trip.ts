import type { AlertEvent } from './alert-event';
import type { TripPoint } from './trip-point';

export interface Trip {
  id: string;
  startedAt: number;
  endedAt: number;
  distanceM: number;
  durationS: number;
  maxSpeedKmh: number;
  avgSpeedKmh: number;
  overLimitCount: number;
  points: TripPoint[];
  alerts: AlertEvent[];
}
