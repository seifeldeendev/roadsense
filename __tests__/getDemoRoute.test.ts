import { expect, test } from '@jest/globals';
import { DEMO_ROUTE } from '@/data/location';
import { DEMO_TRIP } from '@/data/mock/trips';

test('the demo route follows the Salah Salem trip points', () => {
  expect(DEMO_ROUTE).toHaveLength(DEMO_TRIP.points.length);
  for (const point of DEMO_ROUTE) {
    expect(typeof point.lat).toBe('number');
    expect(typeof point.lng).toBe('number');
  }
});
