import { describe, expect, it } from '@jest/globals';
import type { LatLng } from '@/domain/entities';
import { JsonRadarCameraRepository } from '@/data/radars/JsonRadarCameraRepository';
import { parseRadarFeed, type RadarFeed } from '@/data/radars/parseRadarFeed';
import { WORKING_SET_CONSUMER_RADII_M } from '@/domain/usecases/cameras/cameraRadii';
import { REFETCH_DISTANCE_M, WORKING_SET_RADIUS_M, WorkingSet } from '@/domain/usecases/cameras/workingSet';
import { haversineDistanceM } from '@/domain/usecases/drive/geo';
import { nearestSpeedLimit } from '@/domain/usecases/drive/nearestRoadName';
import { createRouteSpeedLimitLookup } from '@/features/drive/viewmodels/drivePointHandler';

// The bug this guards: a screen's radius grows, the working set does not, and
// markers or alerts quietly disappear at the edge of the set.
describe('the camera working set covers every consumer', () => {
  it.each(Object.entries(WORKING_SET_CONSUMER_RADII_M))(
    '%s reads within the set even at the refetch distance from its centre',
    (_consumer, radiusM) => {
      expect(radiusM).toBeLessThanOrEqual(WORKING_SET_RADIUS_M - REFETCH_DISTANCE_M);
    },
  );

  // The position `distanceM` from `from` along a bearing (spherical earth, as haversine).
  const destination = (from: LatLng, distanceM: number, bearingDeg: number): LatLng => {
    const R = 6_371_000;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const angular = distanceM / R;
    const bearing = toRad(bearingDeg);
    const lat1 = toRad(from.lat);
    const lng1 = toRad(from.lng);
    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(angular) + Math.cos(lat1) * Math.sin(angular) * Math.cos(bearing));
    const lng2 =
      lng1 + Math.atan2(Math.sin(bearing) * Math.sin(angular) * Math.cos(lat1), Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2));
    return { lat: (lat2 * 180) / Math.PI, lng: (lng2 * 180) / Math.PI };
  };

  it('misses no camera on the real road database, with the car at the refetch distance in any direction', () => {
    const all = parseRadarFeed(require('../assets/data/radars_eg.json') as RadarFeed);
    const radii = Object.values(WORKING_SET_CONSUMER_RADII_M);
    const widest = Math.max(...radii);
    let checked = 0;
    let missing = 0;
    // Every 29th camera as the car's position, the set centred 2 km behind it in four directions.
    for (let i = 0; i < all.length; i += 29) {
      const car = all[i];
      for (const bearing of [0, 90, 180, 270]) {
        const centre = destination(car, REFETCH_DISTANCE_M * 0.999, bearing);
        const inSet = new Set(all.filter((camera) => haversineDistanceM(centre, camera) <= WORKING_SET_RADIUS_M));
        const nearCar = all.filter((camera) => haversineDistanceM(car, camera) <= widest);
        checked += nearCar.length;
        missing += nearCar.filter((camera) => !inSet.has(camera)).length;
      }
    }
    expect(checked).toBeGreaterThan(10_000);
    expect(missing).toBe(0);
  });
});

describe('a simulated drive on a planned route', () => {
  it('gets the same speed limits along the whole route as the full database gave', async () => {
    const json = new JsonRadarCameraRepository();
    const all = parseRadarFeed(require('../assets/data/radars_eg.json') as RadarFeed);
    const withLimit = all.filter((camera) => camera.speedLimitKmh > 0);
    // A ~60 km route through real cameras, sampled every ~100 m: far beyond the working set.
    const from = withLimit[0];
    const to = withLimit.find((camera) => {
      const d = haversineDistanceM(from, camera);
      return d > 50_000 && d < 70_000;
    });
    expect(to).toBeDefined();
    const steps = 600;
    const route = Array.from({ length: steps + 1 }, (_, i) => ({
      lat: from.lat + ((to?.lat ?? from.lat) - from.lat) * (i / steps),
      lng: from.lng + ((to?.lng ?? from.lng) - from.lng) * (i / steps),
    }));
    const limitFor = await createRouteSpeedLimitLookup((bounds) => json.getInBounds(bounds), route, () => -1);
    const limits = route.map(limitFor);
    expect(limits).toEqual(route.map((point) => nearestSpeedLimit(point, all)));
    expect(limits.filter((limit) => limit > 0).length).toBeGreaterThan(1);
  });

  it('falls back to the working set when the route query fails', async () => {
    const limitFor = await createRouteSpeedLimitLookup(
      () => Promise.reject(new Error('database closed')),
      [{ lat: 30, lng: 31 }],
      () => 42,
    );
    expect(limitFor({ lat: 30, lng: 31 })).toBe(42);
  });
});

describe('the working set can only be read with a radius it was sized for (F11)', () => {
  const centre = { lat: 30, lng: 31 };
  const at = (km: number) => ({ lat: centre.lat + km / 111, lng: centre.lng });
  const camera = (id: string, km: number) => ({ ...at(km), id, heading: null, speedLimitKmh: 60, roadName: 'R', type: 'fixed' as const });
  const set = new WorkingSet(centre, [camera('near', 0.5), camera('mid', 1.5), camera('far', 9)]);

  it('a registered consumer gets only the cameras within its own registered radius', () => {
    expect(set.forConsumer('roadMatch', centre).map((c) => c.id)).toEqual(['near']);
    expect(set.forConsumer('activeAlerts', centre).map((c) => c.id)).toEqual(['near', 'mid']);
    expect(set.forConsumer('liveMap', centre).map((c) => c.id)).toEqual(['near', 'mid', 'far']);
  });

  it('an area reader gets null, not a partial list, outside what the set covers', () => {
    expect(set.inArea(centre, 10_000)).not.toBeNull();
    expect(set.inArea(at(3), 10_000)).toBeNull();
    expect(set.inArea(centre, 12_001)).toBeNull();
  });

  it('does not compile for an unregistered consumer or a direct read of the list', () => {
    // These lines are the test: tsc fails if either ever compiles.
    // @ts-expect-error an unregistered consumer has no radius the set was sized for
    expect(() => set.forConsumer('newScreen', centre)).toThrow();
    // @ts-expect-error the list is private: no reader can pick its own radius
    expect(set.cameras).toHaveLength(3);
  });
});
