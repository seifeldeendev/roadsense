import { describe, expect, it } from '@jest/globals';
import { haversineDistanceM } from '../src/domain/usecases/drive/geo';
import { estimateRoute } from '../src/domain/usecases/routes/estimateRoute';

describe('estimateRoute', () => {
  const from = { lat: 30.0, lng: 31.2 };
  const to = { lat: 30.05, lng: 31.3 };

  it('runs from the start to the destination through evenly spaced points', () => {
    const route = estimateRoute('dest-x', from, to);
    expect(route.destinationId).toBe('dest-x');
    expect(route.points[0]).toEqual(from);
    expect(route.points[route.points.length - 1].lat).toBeCloseTo(to.lat, 6);
    expect(route.points.length).toBeGreaterThan(10);
  });

  it('adds a road detour factor and a time at urban speed', () => {
    const straight = haversineDistanceM(from, to);
    const route = estimateRoute('dest-x', from, to);
    expect(route.distanceM).toBeGreaterThan(straight);
    expect(route.durationS).toBeCloseTo(route.distanceM / (45 / 3.6), -1);
  });
});
