import type { Trip } from '../../entities';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type WeekDayStat = {
  date: Date;
  distanceKm: number;
};

export type WeeklyStats = {
  days: WeekDayStat[];
  totalKm: number;
  driveTimeS: number;
  avgSpeedKmh: number;
  overLimitCount: number;
  alertsCount: number;
  pctWithinLimit: number;
};

// Local midnight `days` calendar days after the given date. Adding multiples of
// 24 h would drift by an hour across a daylight-saving change.
export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

// Monday 00:00 of the week containing the given date.
export function startOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysSinceMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - daysSinceMonday);
  start.setHours(0, 0, 0, 0);
  return start;
}

function startOfDay(ms: number): number {
  const day = new Date(ms);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
}

// Aggregates the given trips into a Monday–Sunday week: per-day distance plus
// totals. Trips outside the week are ignored; an empty selection yields zeros.
export function getWeeklyStats(trips: readonly Trip[], weekStart: Date): WeeklyStats {
  const weekStartMs = startOfDay(weekStart.getTime());
  const days: WeekDayStat[] = Array.from({ length: 7 }, (_, index) => ({
    date: addDays(weekStart, index),
    distanceKm: 0,
  }));
  const weekMeters = Array.from({ length: 7 }, () => 0);

  let distanceM = 0;
  let driveTimeS = 0;
  let overLimitCount = 0;
  let alertsCount = 0;
  let pointsWithinLimit = 0;
  let pointCount = 0;

  for (const trip of trips) {
    const dayIndex = Math.round((startOfDay(trip.startedAt) - weekStartMs) / MS_PER_DAY);
    if (dayIndex < 0 || dayIndex >= 7) continue;
    weekMeters[dayIndex] += trip.distanceM;
    distanceM += trip.distanceM;
    driveTimeS += trip.durationS;
    alertsCount += trip.alerts.length;
    for (const point of trip.points) {
      pointCount += 1;
      if (point.speedKmh > point.limitKmh) {
        overLimitCount += 1;
      } else {
        pointsWithinLimit += 1;
      }
    }
  }

  for (let i = 0; i < 7; i += 1) {
    days[i].distanceKm = round1(weekMeters[i] / 1000);
  }

  return {
    days,
    totalKm: round1(distanceM / 1000),
    driveTimeS,
    avgSpeedKmh: driveTimeS > 0 ? Math.round((distanceM / driveTimeS) * 3.6) : 0,
    overLimitCount,
    alertsCount,
    pctWithinLimit: pointCount === 0 ? 0 : Math.round((pointsWithinLimit / pointCount) * 100),
  };
}

function round1(km: number): number {
  return Math.round(km * 10) / 10;
}
