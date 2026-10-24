import { expect, test } from '@jest/globals';
import { buildSpeedSegments } from './buildSpeedSegments';
import type { TripPoint } from '../../entities';

function point(speedKmh: number, limitKmh: number, i: number): TripPoint {
  return { lat: 30.0 + i * 0.001, lng: 31.2, ts: i * 1000, speedKmh, heading: 0, limitKmh };
}

const limit = 100;

test('an empty trip has no segments', () => {
  expect(buildSpeedSegments([], 90)).toEqual([]);
});

test('a single point forms one segment', () => {
  const segments = buildSpeedSegments([point(50, limit, 0)], 90);
  expect(segments).toHaveLength(1);
  expect(segments[0].status).toBe('ok');
  expect(segments[0].points).toHaveLength(1);
});

test('adjacent runs share their boundary point', () => {
  const points = [
    point(50, limit, 0),
    point(95, limit, 1),
    point(95, limit, 2),
    point(40, limit, 3),
  ];
  const segments = buildSpeedSegments(points, 90);
  expect(segments.map((s) => s.status)).toEqual(['ok', 'near', 'ok']);
  const shared = { lat: points[1].lat, lng: points[1].lng };
  expect(segments[0]).toStrictEqual({ status: 'ok', points: [{ lat: points[0].lat, lng: points[0].lng }, shared] });
  expect(segments[1].status).toBe('near');
  expect(segments[1].points[0]).toEqual(shared);
  expect(segments[1].points).toHaveLength(3);
  expect(segments[1].points[2]).toEqual({ lat: points[3].lat, lng: points[3].lng });
  expect(segments[2]).toStrictEqual({ status: 'ok', points: [{ lat: points[3].lat, lng: points[3].lng }] });
});

test('a run over the limit is reported as over', () => {
  const points = [point(100, limit, 0), point(120, limit, 1), point(120, limit, 2)];
  const segments = buildSpeedSegments(points, 90);
  expect(segments.map((s) => s.status)).toEqual(['near', 'over']);
});

test('a custom amber threshold changes run boundaries', () => {
  const points = [point(80, limit, 0), point(95, limit, 1)];
  const segments = buildSpeedSegments(points, 80);
  expect(segments.map((s) => s.status)).toEqual(['near']);
});
