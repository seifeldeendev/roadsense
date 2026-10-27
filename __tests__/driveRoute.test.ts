import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import type { LocationSource } from '@/domain/repositories';
import { createDemoLocationSource, DEMO_ROUTE } from '@/data/location';
import { MOCK_TRIPS } from '@/data/mock/trips';
import { useNavigationStore } from '@/composition/stores';

jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const nav = () => useNavigationStore.getState();

beforeEach(() => {
  nav().reset();
});

// A test that fails on fake timers must not leave them to the tests after it.
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

test('a queued replay is published to the drive map and the demo returns afterwards', () => {
  const replayTrip = MOCK_TRIPS[1];
  const listener = jest.fn();
  const unsubscribe = useNavigationStore.subscribe((state, previous) => {
    if (state.driveRoute !== previous.driveRoute) listener();
  });

  expect(nav().driveRoute).toBe(DEMO_ROUTE);

  nav().setDriveRoutePoints(replayTrip.points);
  expect(listener).toHaveBeenCalledTimes(1);
  const queued = nav().driveRoute;
  expect(queued).toHaveLength(replayTrip.points.length);
  expect(queued[0]).toEqual({ lat: replayTrip.points[0].lat, lng: replayTrip.points[0].lng });

  // Starting the replay keeps the same snapshot (no extra re-render).
  expect(nav().takeDemoPlayback()).toEqual({ kind: 'replay', points: replayTrip.points });
  expect(nav().driveRoute).toBe(queued);
  expect(listener).toHaveBeenCalledTimes(1);

  // The next drive falls back to the demo route.
  expect(nav().takeDemoPlayback()).toEqual({ kind: 'demo' });
  expect(nav().driveRoute).toBe(DEMO_ROUTE);
  expect(listener).toHaveBeenCalledTimes(2);

  unsubscribe();
});

test('a demo drive follows the planned route, and a replay replaces the plan', () => {
  jest.useFakeTimers();
  const planned = [
    { lat: 30.2, lng: 31.5 },
    { lat: 30.21, lng: 31.5 },
  ];
  nav().showPlannedRoute(planned);
  expect(nav().driveRoute).toBe(planned);
  const firstPoint = (source: LocationSource) => {
    let seen: { lat: number } | null = null;
    const unwatch = source.watch((p) => {
      seen ??= p;
    });
    jest.advanceTimersByTime(1000);
    unwatch();
    return seen;
  };
  expect(firstPoint(createDemoLocationSource(nav().takeDemoPlayback(), () => 60))).toMatchObject({ lat: 30.2 });

  nav().setDriveRoutePoints(MOCK_TRIPS[1].points);
  expect(nav().plannedRoute).toBeNull();
  expect(firstPoint(createDemoLocationSource(nav().takeDemoPlayback()))).toMatchObject({
    lat: MOCK_TRIPS[1].points[0].lat,
  });
});

test('reset clears queued and planned routes', () => {
  nav().showPlannedRoute([{ lat: 1, lng: 2 }]);
  nav().setDriveRoutePoints(MOCK_TRIPS[1].points);
  nav().reset();
  expect(nav().driveRoute).toBe(DEMO_ROUTE);
  expect(nav().plannedRoute).toBeNull();
  expect(nav().pendingRoutePoints).toBeNull();
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
