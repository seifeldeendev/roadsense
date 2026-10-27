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
