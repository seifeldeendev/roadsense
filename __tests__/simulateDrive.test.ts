import { describe, expect, it } from '@jest/globals';
import { haversineDistanceM } from '../src/domain/usecases/drive/geo';
import { simulateDrive } from '../src/domain/usecases/routes/simulateDrive';

describe('simulateDrive', () => {
  // ~1.1 km due north.
  const route = [
    { lat: 30.0, lng: 31.0 },
    { lat: 30.005, lng: 31.0 },
    { lat: 30.01, lng: 31.0 },
  ];

  it('follows the route from start to destination, one reading per second', () => {
    const points = simulateDrive(route, 1000, () => 60);
    expect(points[0]).toMatchObject({ lat: 30.0, lng: 31.0, ts: 1000 });
    const last = points[points.length - 1];
    expect(haversineDistanceM(last, route[2])).toBeLessThan(1);
    expect(last.speedKmh).toBe(0);
    expect(points[1].ts - points[0].ts).toBe(1000);
    expect(points.every((p) => p.limitKmh === 60)).toBe(true);
  });

  it('speeds up to cruise, heads along the road and stays near the line', () => {
    const points = simulateDrive(route, 0, () => 0);
    expect(Math.max(...points.map((p) => p.speedKmh))).toBe(50);
    expect(points[0].speedKmh).toBeLessThan(10);
    expect(points[5].heading).toBe(0);
    expect(points.every((p) => Math.abs(p.lng - 31.0) < 1e-9)).toBe(true);
  });

  it('returns nothing for a route without length', () => {
    expect(simulateDrive([route[0]], 0, () => 0)).toEqual([]);
  });
});
