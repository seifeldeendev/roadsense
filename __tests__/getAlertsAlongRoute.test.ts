import { describe, expect, it } from '@jest/globals';
import type { Camera, Hazard, LatLng } from '../src/domain/entities';
import { getAlertsAlongRoute } from '../src/domain/usecases/routes/getAlertsAlongRoute';

const ROUTE: LatLng[] = [
  { lat: 30.07, lng: 31.335 },
  { lat: 30.075, lng: 31.34 },
  { lat: 30.08, lng: 31.345 },
];

function camera(id: string, lat: number, lng: number): Camera {
  return {
    id,
    lat,
    lng,
    heading: null,
    speedLimitKmh: 80,
    roadName: 'Salah Salem',
    type: 'fixed',
  };
}

function hazard(
  id: string,
  lat: number,
  lng: number,
  overrides: Partial<Hazard> = {},
): Hazard {
  return {
    id,
    type: 'pothole',
    lat,
    lng,
    heading: null,
    reportedBy: 'driver-test',
    createdAt: new Date(0).toISOString(),
    expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
    confirmations: 1,
    denials: 0,
    status: 'active',
    ...overrides,
  };
}

describe('getAlertsAlongRoute', () => {
  it('finds a camera sitting on a waypoint and reports its limit', () => {
    const alerts = getAlertsAlongRoute(
      ROUTE,
      [camera('cam-1', 30.075, 31.34)],
      [],
      50,
    );
    expect(alerts).toHaveLength(1);
    expect(alerts[0].kind).toBe('camera');
    expect(alerts[0].refId).toBe('cam-1');
    expect(alerts[0].speedLimitKmh).toBe(80);
    expect(alerts[0].distanceFromRouteM).toBeCloseTo(0, 0);
  });

  it('includes an active hazard within the threshold and excludes a distant one', () => {
    // ~55 m southeast of the second waypoint puts it outside the 50 m limit.
    const near = { lat: 30.0751, lng: 31.3407 };
    const far = { lat: 30.083, lng: 31.352 };
    const alerts = getAlertsAlongRoute(
      ROUTE,
      [],
      [hazard('hz-near', near.lat, near.lng), hazard('hz-far', far.lat, far.lng)],
      50,
    );
    expect(alerts.map((alert) => alert.refId)).toEqual(['hz-near']);
  });

  it('skips expired hazards', () => {
    const alerts = getAlertsAlongRoute(
      ROUTE,
      [],
      [hazard('hz-expired', 30.075, 31.34, { status: 'expired' })],
      50,
    );
    expect(alerts).toHaveLength(0);
  });

  it('orders alerts by distance along the route', () => {
    const first = camera('cam-first', 30.0725, 31.3375);
    const last = hazard('hz-last', 30.0795, 31.3445);
    const alerts = getAlertsAlongRoute(ROUTE, [first], [last], 50);
    expect(alerts.map((alert) => alert.refId)).toEqual(['cam-first', 'hz-last']);
    expect(alerts[0].distanceAlongM).toBeLessThan(alerts[1].distanceAlongM);
  });

  it('returns an empty list for a degenerate route', () => {
    expect(getAlertsAlongRoute([ROUTE[0]], [camera('cam-1', 30.07, 31.335)], [])).toEqual([]);
  });
});
