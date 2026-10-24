import { expect, test } from '@jest/globals';
import { addDays, getWeeklyStats, startOfWeek } from './weeklyStats';
import type { Trip, TripPoint } from '../../entities';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function pointAt(dayOffsetFromWeekStart: number, hour: number, speedKmh: number): TripPoint {
  const ts = new Date(2026, 9, 19 + dayOffsetFromWeekStart, hour).getTime();
  return { lat: 30, lng: 31.3, ts, speedKmh, heading: 0, limitKmh: 80 };
}

function tripAt(ts: number, distanceM: number, limits: TripPoint[]): Trip {
  return {
    id: `trip-${ts}`,
    startedAt: ts,
    endedAt: ts,
    distanceM,
    durationS: 600,
    maxSpeedKmh: 0,
    avgSpeedKmh: 0,
    overLimitCount: 0,
    points: limits,
    alerts: [],
  };
}

test('startOfWeek returns Monday midnight', () => {
  const saturday = new Date(2026, 9, 24, 15, 42);
  const monday = startOfWeek(saturday);
  expect(monday.getDay()).toBe(1);
  expect(monday.toDateString()).toBe(new Date(2026, 9, 19).toDateString());
  expect(startOfWeek(monday).getTime()).toBe(monday.getTime());
});

test('weekly totals aggregate distance, time, alerts and over-limit points', () => {
  const wednesdayTrip = tripAt(pointAt(2, 8, 120).ts, 5250, [
    pointAt(2, 8, 50),
    pointAt(2, 8, 120),
  ]);
  const mondayTrip = tripAt(pointAt(0, 7, 60).ts, 2200, [pointAt(0, 7, 60)]);
  const result = getWeeklyStats([wednesdayTrip, mondayTrip], new Date(2026, 9, 19));
  expect(result.days.map((d) => d.distanceKm)).toStrictEqual([
    2.2, 0, 5.3, 0, 0, 0, 0,
  ]);
  expect(result.totalKm).toBe(7.5);
  expect(result.driveTimeS).toBe(1200);
  expect(result.avgSpeedKmh).toBe(Math.round((7450 / 1200) * 3.6));
  expect(result.overLimitCount).toBe(1);
  expect(result.alertsCount).toBe(0);
  expect(result.pctWithinLimit).toBe(67);
});

test('trips outside the week are ignored', () => {
  const lateTrip = tripAt(pointAt(8, 9, 60).ts, 1000, [pointAt(8, 9, 60)]);
  const earlyTrip = tripAt(pointAt(-1, 9, 60).ts, 1000, [pointAt(-1, 9, 60)]);
  const result = getWeeklyStats([lateTrip, earlyTrip], new Date(2026, 9, 19));
  expect(result.totalKm).toBe(0);
  expect(result.days.every((d) => d.distanceKm === 0)).toBe(true);
  expect(result.driveTimeS).toBe(0);
});

test('an empty selection yields zeros without NaN', () => {
  const result = getWeeklyStats([], new Date(2026, 9, 19));
  expect(result).toStrictEqual({
    days: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(new Date(2026, 9, 19).getTime() + i * MS_PER_DAY),
      distanceKm: 0,
    })),
    totalKm: 0,
    driveTimeS: 0,
    avgSpeedKmh: 0,
    overLimitCount: 0,
    alertsCount: 0,
    pctWithinLimit: 0,
  });
});

test('addDays and the week days land on local midnights of consecutive dates', () => {
  // Egypt leaves daylight saving on the last Thursday of October 2026.
  const weekStart = new Date(2026, 9, 26);
  const stats = getWeeklyStats([], weekStart);
  stats.days.forEach((day, index) => {
    expect(day.date.getHours()).toBe(0);
    expect(day.date.toDateString()).toBe(new Date(2026, 9, 26 + index).toDateString());
  });
  expect(addDays(weekStart, 7).getDay()).toBe(1);
  expect(addDays(weekStart, -7).getHours()).toBe(0);
});
