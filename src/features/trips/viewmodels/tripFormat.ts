import { type AlertKind, type Trip, type TripPoint } from '@/domain/entities';

export function hhmm(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function tripTimeRange(trip: Pick<Trip, 'startedAt' | 'endedAt'>): string {
  return `${hhmm(new Date(trip.startedAt))} – ${hhmm(new Date(trip.endedAt))}`;
}

export function mmss(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export const ALERT_LABELS: Record<AlertKind, string> = {
  camera: 'Speed camera alert',
  hazard: 'Hazard alert',
};

export function currentPointOf(trip: Trip, index: number): TripPoint | null {
  return trip.points[index] ?? null;
}
