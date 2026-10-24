import { expect, test } from '@jest/globals';
import { nearestRouteIndex } from './nearestRouteIndex';
import type { LatLng } from '../../entities';

// ~1112 m per 0.01 of latitude — far larger than positional noise.
const route: LatLng[] = [
  { lat: 30.0, lng: 31.0 },
  { lat: 30.01, lng: 31.0 },
  { lat: 30.02, lng: 31.0 },
  { lat: 30.03, lng: 31.0 },
];

test('finds the closest route point index', () => {
  const position: LatLng = { lat: 30.0179, lng: 31.0 };
  expect(nearestRouteIndex(route, position)).toBe(2);
});

test('snaps to the first point at the route start', () => {
  expect(nearestRouteIndex(route, { lat: 30.0, lng: 31.0 })).toBe(0);
});

test('snaps to the last point past the route end', () => {
  expect(nearestRouteIndex(route, { lat: 30.04, lng: 31.0 })).toBe(3);
});
