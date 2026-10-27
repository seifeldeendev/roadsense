import type { Trip } from '@/domain/entities';
import type { WeeklyStats } from '@/domain/usecases/trips/weeklyStats';
import { formatDayTitle } from '@/domain/usecases/trips/groupTripsByDay';
import { addDays } from '@/domain/usecases/trips/weeklyStats';
import { formatDistance, formatDuration } from '@/shared/format';

const DAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export type WeekBar = {
  id: string;
  initial: string;
  km: number;
  isPeak: boolean;
};

export type StatsTile = { label: string; value: string };

export type TripChip = { id: string; label: string };

export function weekRangeLabel(weekStart: Date): string {
  const last = addDays(weekStart, 6);
  return `${weekStart.getDate()} – ${last.getDate()} ${MONTH_NAMES[last.getMonth()]}`;
}

export function buildWeekBars(stats: WeeklyStats): WeekBar[] {
  const maxKm = Math.max(...stats.days.map((day) => day.distanceKm), 1);
  return stats.days.map((day, index) => ({
    id: `day-${index}`,
    initial: DAY_INITIALS[index],
    km: day.distanceKm,
    isPeak: day.distanceKm === maxKm && day.distanceKm > 0,
  }));
}

export function buildWeekTiles(stats: WeeklyStats): StatsTile[] {
  return [
    { label: 'Total distance', value: `${stats.totalKm.toFixed(1)} km` },
    { label: 'Drive time', value: formatDuration(stats.driveTimeS) },
    { label: 'Avg speed', value: `${stats.avgSpeedKmh} km/h` },
    { label: 'Over-limit points', value: String(stats.overLimitCount) },
    { label: 'Alerts', value: String(stats.alertsCount) },
    { label: 'Within limit', value: `${stats.pctWithinLimit}%` },
  ];
}

export function buildTripChips(trips: readonly Trip[], today: Date): TripChip[] {
  return trips.map((trip) => ({
    id: trip.id,
    label: `${formatDayTitle(new Date(trip.startedAt), today)} · ${formatDistance(trip.distanceM)}`,
  }));
}
