import { expect, jest, test } from '@jest/globals';
import { MOCK_TRIPS } from '@/data/mock/trips';
import {
  createDemoLocationSource,
  getDemoRoute,
  getDriveRoute,
  setDriveRoutePoints,
  subscribeDriveRoute,
} from '@/services/location';

test('a queued replay is published to the drive map and the demo returns afterwards', () => {
  const replayTrip = MOCK_TRIPS[1];
  const listener = jest.fn();
  const unsubscribe = subscribeDriveRoute(listener);

  expect(getDriveRoute()).toBe(getDemoRoute());

  setDriveRoutePoints(replayTrip.points);
  expect(listener).toHaveBeenCalledTimes(1);
  const queued = getDriveRoute();
  expect(queued).toHaveLength(replayTrip.points.length);
  expect(queued[0]).toEqual({ lat: replayTrip.points[0].lat, lng: replayTrip.points[0].lng });

  // Starting the replay keeps the same snapshot (no extra re-render).
  createDemoLocationSource().stop();
  expect(getDriveRoute()).toBe(queued);
  expect(listener).toHaveBeenCalledTimes(1);

  // The next drive falls back to the demo route.
  createDemoLocationSource().stop();
  expect(getDriveRoute()).toBe(getDemoRoute());
  expect(listener).toHaveBeenCalledTimes(2);

  unsubscribe();
});

test('a demo drive follows the planned route, and a replay replaces the plan', () => {
  jest.useFakeTimers();
  const { showPlannedRoute } = require('@/services/location');
  const planned = [
    { lat: 30.2, lng: 31.5 },
    { lat: 30.21, lng: 31.5 },
  ];
  showPlannedRoute(planned);
  const firstPoint = (source: { start: (cb: (p: { lat: number }) => void) => void; stop: () => void }) => {
    let seen: { lat: number } | null = null;
    source.start((p) => {
      seen ??= p;
    });
    jest.advanceTimersByTime(1000);
    source.stop();
    return seen;
  };
  expect(firstPoint(createDemoLocationSource(() => 60))).toMatchObject({ lat: 30.2 });

  setDriveRoutePoints(MOCK_TRIPS[1].points);
  expect(firstPoint(createDemoLocationSource())).toMatchObject({ lat: MOCK_TRIPS[1].points[0].lat });
  showPlannedRoute(null);
  jest.useRealTimers();
});

test('routes from the fallback are marked as estimates when road routing is unreachable', async () => {
  const { OsrmRouteRepository } = require('@/data/osrm/OsrmRouteRepository');
  const { MockRouteRepository } = require('@/data/mock/routes');
  const original = globalThis.fetch;
  globalThis.fetch = jest.fn(() => Promise.reject(new Error('offline'))) as unknown as typeof fetch;
  try {
    const repo = new OsrmRouteRepository(new MockRouteRepository());
    const route = await repo.getRoute(
      { id: 'dest-x', name: 'X', area: '', lat: 30.3, lng: 31.6 },
      { lat: 30.2, lng: 31.5 },
    );
    expect(route.estimated).toBe(true);
    expect(route.points.length).toBeGreaterThan(2);
  } finally {
    globalThis.fetch = original;
  }
});
