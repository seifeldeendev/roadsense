import { describe, expect, it } from '@jest/globals';
import type { Camera } from '../src/domain/entities';
import { parseRadarFeed, type RadarFeed } from '../src/data/radars/parseRadarFeed';
import { RadarCameraRepository } from '../src/data/radars';
import { JsonRadarCameraRepository } from '../src/data/radars/JsonRadarCameraRepository';
import { RADAR_SEED_VERSION } from '../src/data/radars/radarSeedVersion';
import { findUpcomingAlerts } from '../src/domain/usecases/drive/findUpcomingAlerts';
import { alertTargetFor, fixedPointTitle, isSpeedCamera, nearestPoints } from '../src/domain/usecases/drive/fixedPoints';
import { nearestSpeedLimit } from '../src/domain/usecases/drive/nearestRoadName';
import { describeRouteAlerts, getAlertsAlongRoute } from '../src/domain/usecases/routes/getAlertsAlongRoute';
import { DEFAULT_SETTINGS } from '../src/shared/constants';

const feed: RadarFeed = {
  radars: [
    { id: '1', latitude: '30.0700', longitude: '31.3380', type: 'F', speed_limit: '80', road_name: ' Salah Salem ' },
    { id: '2', latitude: '30.0710', longitude: '31.3380', type: 'C', speed_limit: '60', road_name: 'Nozha' },
    { id: '3', latitude: '30.0720', longitude: '31.3380', type: 'R', speed_limit: '0', road_name: 'Omar' },
    { id: '4', latitude: '30.0730', longitude: '31.3380', type: 'SB', speed_limit: '0', road_name: 'Omar' },
    { id: '5', latitude: '30.0740', longitude: '31.3380', type: 'PN', speed_limit: '0', road_name: 'Skipped' },
    { id: '6', latitude: 'oops', longitude: '31.3380', type: 'F', speed_limit: '80', road_name: 'Bad' },
  ],
};

describe('parseRadarFeed', () => {
  it('maps the known type codes, converts strings and skips unknown or broken rows', () => {
    const cameras = parseRadarFeed(feed);
    expect(cameras.map((c) => c.type)).toEqual(['fixed', 'police', 'speed_bump', 'bump_zone']);
    expect(cameras[0]).toMatchObject({ id: 'eg-1', lat: 30.07, lng: 31.338, speedLimitKmh: 80, roadName: 'Salah Salem' });
    expect(cameras[2].speedLimitKmh).toBe(0);
  });

  it('loads the bundled Egypt database', async () => {
    const all = await new RadarCameraRepository().getAll();
    expect(all.length).toBeGreaterThan(4000);
    expect(all.every((c: Camera) => Number.isFinite(c.lat) && Number.isFinite(c.lng))).toBe(true);
  });

  it('seeds SQLite with exactly what the JSON export parses to, on every platform', async () => {
    const fromSqlite = await new RadarCameraRepository().getAll();
    const fromJson = await new JsonRadarCameraRepository().getAll();
    expect(fromSqlite).toEqual(fromJson);
  });

  it('carries the seed version of the current export (run npm run build:radars after updating it)', () => {
    const { currentRadarSeedVersion } = require('../test-support/radarSeed') as { currentRadarSeedVersion: () => string };
    expect(RADAR_SEED_VERSION).toBe(currentRadarSeedVersion());
  });
});

describe('fixed points', () => {
  const [radar, police, bump, zone] = parseRadarFeed(feed) as [Camera, Camera, Camera, Camera];

  it('classifies points into alert switches and titles', () => {
    expect([radar, police, bump, zone].map((c) => alertTargetFor(c.type))).toEqual(['camera', 'police', 'bump', 'bump']);
    expect(fixedPointTitle('police')).toBe('Police ahead');
    expect(fixedPointTitle('bump_zone')).toBe('Speed bump zone ahead');
    expect(isSpeedCamera(radar)).toBe(true);
    expect(isSpeedCamera(bump)).toBe(false);
  });

  it('keeps only the nearest points inside the radius', () => {
    const picked = nearestPoints([zone, bump, police, radar], { lat: 30.07, lng: 31.338 }, 2, 500);
    expect(picked.map((c) => c.id)).toEqual(['eg-1', 'eg-2']);
    expect(nearestPoints([zone], { lat: 31, lng: 32 }, 5, 500)).toEqual([]);
  });

  it('takes road limits only from points that state one', () => {
    expect(nearestSpeedLimit({ lat: 30.0721, lng: 31.338 }, [bump, police])).toBe(60);
    expect(nearestSpeedLimit({ lat: 30.0721, lng: 31.338 }, [bump])).toBe(0);
  });

  it('honours the per-type alert switches', () => {
    const origin = { lat: 30.0695, lng: 31.338 };
    const all = findUpcomingAlerts(origin, 0, [radar, police, bump], [], DEFAULT_SETTINGS, 1000);
    expect(all.map((a) => a.title)).toEqual(['Speed camera ahead', 'Police ahead', 'Speed bump ahead']);
    expect(all[0].speedLimitKmh).toBe(80);
    expect(all[1].speedLimitKmh).toBeUndefined();
    const noBumps = { ...DEFAULT_SETTINGS, enabledTypes: DEFAULT_SETTINGS.enabledTypes.filter((t) => t !== 'bump') };
    expect(findUpcomingAlerts(origin, 0, [radar, bump], [], noBumps, 1000).map((a) => a.refId)).toEqual(['eg-1']);
  });

  it('summarises what lies along a route by kind and ignores far-away points', () => {
    const route = [
      { lat: 30.069, lng: 31.338 },
      { lat: 30.075, lng: 31.338 },
    ];
    const far = { ...radar, id: 'eg-far', lat: 31.2, lng: 29.9 };
    const alerts = getAlertsAlongRoute(route, [radar, police, bump, zone, far], []);
    expect(alerts.map((a) => a.refId)).toEqual(['eg-1', 'eg-2', 'eg-3', 'eg-4']);
    expect(describeRouteAlerts(alerts)).toBe('1 camera · 1 police post · 2 bumps');
    expect(describeRouteAlerts([])).toBe('Nothing reported on the way');
  });
});
