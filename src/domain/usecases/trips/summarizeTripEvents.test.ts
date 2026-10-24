import { expect, test } from '@jest/globals';
import { summarizeTripEvents } from './summarizeTripEvents';
import type { AlertEvent, Trip, TripPoint } from '../../entities';

const SECOND = 1000;
const LIMIT = 80;

function points(speeds: number[], stepSeconds = 1): TripPoint[] {
  return speeds.map((speed, i) => ({
    lat: 30.0,
    lng: 31.2,
    ts: 1000 + i * stepSeconds * SECOND,
    speedKmh: speed,
    heading: 0,
    limitKmh: LIMIT,
  }));
}

function trip(points: TripPoint[], alerts: AlertEvent[]): Trip {
  return {
    id: 't',
    startedAt: points[0].ts,
    endedAt: points[points.length - 1].ts,
    distanceM: 0,
    durationS: 0,
    maxSpeedKmh: 0,
    avgSpeedKmh: 0,
    overLimitCount: 0,
    points,
    alerts,
  };
}

test('runs of over-limit points collapse into one event per stretch', () => {
  const overEvent = summarizeTripEvents(trip(points([70, 90, 96, 78]), []));
  expect(overEvent).toHaveLength(1);
  expect(overEvent[0]).toStrictEqual({
    kind: 'over',
    startTs: 1000 + 1 * SECOND,
    endTs: 1000 + 2 * SECOND,
    maxSpeedKmh: 96,
    limitKmh: LIMIT,
  });
});

test('a zone change splits over-limit stretches', () => {
  const pts = points([90, 110]);
  const zoneChange = pts.map((p, i) => (i === 1 ? { ...p, limitKmh: 100 } : p));
  const result = summarizeTripEvents(trip(zoneChange, []));
  expect(result).toHaveLength(2);
  expect(result[0].kind === 'over' && result[0].limitKmh).toBe(LIMIT);
  expect(result[1].kind === 'over' && result[1].limitKmh).toBe(100);
});

test('alerts are merged chronologically with over-limit stretches', () => {
  const alerts: AlertEvent[] = [
    { ts: 1000 + 3 * SECOND, kind: 'camera', refId: 'cam-1', distanceM: 300 },
    { ts: 500, kind: 'hazard', refId: 'hz-1', distanceM: 70 },
  ];
  const result = summarizeTripEvents(trip(points([80, 90, 80]), alerts));
  expect(result.map((e) => (e.kind === 'alert' ? e.ts : e.startTs))).toStrictEqual([
    500,
    1000 + 1 * SECOND,
    1000 + 3 * SECOND,
  ]);
  expect(result[0]).toMatchObject({ kind: 'alert', refKind: 'hazard', distanceM: 70 });
  expect(result[1]).toMatchObject({ kind: 'over', maxSpeedKmh: 90 });
  expect(result[1]).toMatchObject({ kind: 'over', maxSpeedKmh: 90 });
  expect(result[2]).toMatchObject({ kind: 'alert', refKind: 'camera', distanceM: 300 });
});

test('a clean trip has no events', () => {
  expect(summarizeTripEvents(trip(points([50, 60]), []))).toStrictEqual([]);
});
