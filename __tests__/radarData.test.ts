import { describe, expect, it } from '@jest/globals';
import type { Camera } from '../src/domain/entities';
import { parseRadarFeed, type RadarFeed } from '../src/data/radars/parseRadarFeed';
import { RadarCameraRepository } from '../src/data/radars';
import { JsonRadarCameraRepository } from '../src/data/radars/JsonRadarCameraRepository';
import { openRadarDatabase } from '../src/data/radars/openRadarDatabase';
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

  describe('every query answers the same on SQLite and on the JSON (web) path', () => {
    // Deterministic pseudo-random numbers, so a failure reproduces.
    const random = (() => {
      let seed = 20261027;
      return () => {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        return seed / 2147483648;
      };
    })();
    const sqlite = new RadarCameraRepository();
    const json = new JsonRadarCameraRepository();

    it('getInBounds over many random boxes, from city-sized to country-sized, plus empty ones', async () => {
      const all = await json.getAll();
      let nonEmpty = 0;
      for (let i = 0; i < 200; i += 1) {
        // Centre on a real camera most of the time so boxes are not all empty.
        const anchor = all[Math.floor(random() * all.length)];
        const centre = i % 10 === 0 ? { lat: 20 + random() * 15, lng: 22 + random() * 15 } : anchor;
        const halfLat = 0.001 + random() * (i % 3 === 0 ? 3 : 0.2);
        const halfLng = 0.001 + random() * (i % 3 === 0 ? 3 : 0.2);
        const bounds = {
          minLat: centre.lat - halfLat,
          maxLat: centre.lat + halfLat,
          minLng: centre.lng - halfLng,
          maxLng: centre.lng + halfLng,
        };
        const [fromSqlite, fromJson] = await Promise.all([sqlite.getInBounds(bounds), json.getInBounds(bounds)]);
        expect(fromSqlite).toEqual(fromJson);
        if (fromJson.length > 0) nonEmpty += 1;
      }
      expect(nonEmpty).toBeGreaterThan(150);
    });

    it('includes a camera lying exactly on the box edge', async () => {
      const [camera] = await json.getAll();
      const edge = { minLat: camera.lat, maxLat: camera.lat + 0.01, minLng: camera.lng - 0.01, maxLng: camera.lng };
      expect((await sqlite.getInBounds(edge)).map((c: Camera) => c.id)).toContain(camera.id);
      expect(await sqlite.getInBounds(edge)).toEqual(await json.getInBounds(edge));
    });

    it('getByIds over random id sets, including unknown ids and an empty set', async () => {
      const all = await json.getAll();
      for (let i = 0; i < 50; i += 1) {
        const ids = Array.from({ length: Math.floor(random() * 12) }, () => all[Math.floor(random() * all.length)].id);
        if (i % 5 === 0) ids.push('eg-does-not-exist');
        expect(await sqlite.getByIds(ids)).toEqual(await json.getByIds(ids));
      }
      expect(await sqlite.getByIds([])).toEqual([]);
    });

    it('getFirstSpeedCamera', async () => {
      const first = await sqlite.getFirstSpeedCamera();
      expect(first).not.toBeNull();
      expect(first).toEqual(await json.getFirstSpeedCamera());
      expect(first).toEqual((await json.getAll()).find(isSpeedCamera));
    });
  });

  it('carries the seed version of the current export (run npm run build:radars after changing it or the schema)', () => {
    const { currentRadarSeedVersion } = require('../test-support/radarSeed') as { currentRadarSeedVersion: () => string };
    expect(RADAR_SEED_VERSION).toBe(currentRadarSeedVersion());
  });

  it('ships a database rebuilt for the current seed, with the lat/lng index', async () => {
    const db = await openRadarDatabase();
    const seed = await db.getFirstAsync<{ value: string }>("SELECT value FROM meta WHERE key = 'seed_version'");
    expect(seed?.value).toBe(RADAR_SEED_VERSION);
    const indexes = await db.getAllAsync<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'index'");
    expect(indexes.map((row) => row.name)).toContain('cameras_lat_lng');
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
