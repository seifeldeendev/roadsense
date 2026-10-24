import { describe, expect, it } from '@jest/globals';
import type { Camera, Hazard, Settings } from '../src/domain/entities';
import { findUpcomingAlerts } from '../src/domain/usecases/drive/findUpcomingAlerts';
import { DEFAULT_SETTINGS } from '../src/shared/constants';

const ORIGIN = { lat: 30.07, lng: 31.338 };

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
  type: Hazard['type'],
  lat: number,
  lng: number,
  status: Hazard['status'] = 'active',
): Hazard {
  return {
    id,
    type,
    lat,
    lng,
    heading: 0,
    reportedBy: 'driver-test',
    createdAt: new Date(0).toISOString(),
    expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
    confirmations: 1,
    denials: 0,
    status,
  };
}

const settings = (overrides: Partial<Settings>): Settings => ({
  ...DEFAULT_SETTINGS,
  ...overrides,
});

describe('findUpcomingAlerts', () => {
  it('includes a camera straight ahead within range', () => {
    const result = findUpcomingAlerts(
      ORIGIN,
      0,
      [camera('cam-1', 30.072, ORIGIN.lng)],
      [],
      settings({}),
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ kind: 'camera', refId: 'cam-1' });
    expect(result[0].title).toBe('Speed camera ahead');
  });

  it('excludes items behind the driver', () => {
    const result = findUpcomingAlerts(
      ORIGIN,
      0,
      [camera('cam-behind', 30.068, ORIGIN.lng)],
      [],
      settings({}),
    );
    expect(result).toHaveLength(0);
  });

  it('excludes items out of range', () => {
    const result = findUpcomingAlerts(
      ORIGIN,
      0,
      [camera('cam-far', 30.074, ORIGIN.lng)],
      [],
      settings({}),
    );
    expect(result).toHaveLength(0);
  });

  it('excludes items outside the heading cone', () => {
    const result = findUpcomingAlerts(
      ORIGIN,
      0,
      [camera('cam-side', ORIGIN.lat, ORIGIN.lng + 0.002)],
      [],
      settings({}),
    );
    expect(result).toHaveLength(0);
  });

  it('excludes disabled hazard types', () => {
    const result = findUpcomingAlerts(
      ORIGIN,
      0,
      [],
      [hazard('hz-1', 'pothole', 30.0715, ORIGIN.lng)],
      settings({ enabledTypes: ['camera', 'accident'] }),
    );
    expect(result).toHaveLength(0);
  });

  it('excludes expired hazards', () => {
    const result = findUpcomingAlerts(
      ORIGIN,
      0,
      [],
      [hazard('hz-2', 'accident', 30.0715, ORIGIN.lng, 'expired')],
      settings({}),
    );
    expect(result).toHaveLength(0);
  });

  it('sorts results by distance', () => {
    const result = findUpcomingAlerts(
      ORIGIN,
      0,
      [camera('cam-near', 30.0705, ORIGIN.lng)],
      [hazard('hz-far', 'accident', 30.0725, ORIGIN.lng)],
      settings({}),
    );
    expect(result.map((a) => a.refId)).toEqual(['cam-near', 'hz-far']);
  });
});
