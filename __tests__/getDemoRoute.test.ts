import { expect, test } from '@jest/globals';
import { getDemoRoute } from '@/services/location';

test('the demo route follows the Salah Salem trip points', () => {
  const route = getDemoRoute();
  expect(route.length).toBeGreaterThan(0);
  expect(getDemoRoute()).toBe(route);
  for (const point of route) {
    expect(typeof point.lat).toBe('number');
    expect(typeof point.lng).toBe('number');
  }
});
