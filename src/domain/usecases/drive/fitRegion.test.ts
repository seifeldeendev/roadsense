import { expect, test } from '@jest/globals';
import { fitRouteRegion } from './fitRegion';
import type { LatLng } from '../../entities';

test('centres the frame on the route bounding box with edge padding', () => {
  const route: LatLng[] = [
    { lat: 30.0, lng: 31.0 },
    { lat: 30.02, lng: 31.0 },
    { lat: 30.02, lng: 31.04 },
  ];
  const frame = fitRouteRegion(route);
  expect(frame.latitude).toBeCloseTo(30.01);
  expect(frame.longitude).toBeCloseTo(31.02);
  expect(frame.latitudeDelta).toBeGreaterThanOrEqual(0.02);
  expect(frame.longitudeDelta).toBeCloseTo(0.06);
});

test('falls back to central Cairo for an empty route', () => {
  const frame = fitRouteRegion([]);
  expect(Number.isFinite(frame.latitude)).toBe(true);
  expect(Number.isFinite(frame.latitudeDelta)).toBe(true);
});

test('keeps a minimum span when the coordinates collapse to one point', () => {
  const frame = fitRouteRegion([{ lat: 30.072, lng: 31.335 }]);
  expect(frame.latitude).toBeCloseTo(30.072);
  expect(frame.longitude).toBeCloseTo(31.335);
  expect(frame.latitudeDelta).toBeGreaterThan(0);
  expect(frame.longitudeDelta).toBeGreaterThan(0);
});
