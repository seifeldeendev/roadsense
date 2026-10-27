import { expect, test } from '@jest/globals';
import { groupTripsByDay } from './groupTripsByDay';
import type { Trip } from '../../entities';

const HOUR_MS = 60 * 60 * 1000;

function tripAt(id: string, ts: number): Trip {
  return {
    id,
    startedAt: ts,
    endedAt: ts,
    distanceM: 0,
    durationS: 0,
    maxSpeedKmh: 0,
    avgSpeedKmh: 0,
    overLimitCount: 0,
    points: [],
    alerts: [],
  };
}

const NOW = new Date(2026, 9, 24, 12, 0);

test('trips group into Today, Yesterday and dated sections', () => {
  const sections = groupTripsByDay(
    [
      tripAt('today', new Date(2026, 9, 24, 8, 10).getTime()),
      tripAt('yesterday', new Date(2026, 9, 23, 18, 30).getTime()),
      tripAt('d5', new Date(2026, 9, 19, 9, 0).getTime()),
    ],
    NOW,
  );
  expect(sections.map((s) => s.title)).toStrictEqual(['Today', 'Yesterday', 'Mon 19 Oct']);
  expect(sections.map((s) => s.trips[0].id)).toStrictEqual(['today', 'yesterday', 'd5']);
});

test('trips on the same day share one section', () => {
  const sections = groupTripsByDay(
    [
      tripAt('a', new Date(2026, 9, 24, 20, 5).getTime()),
      tripAt('b', new Date(2026, 9, 24, 8, 0).getTime()),
    ],
    NOW,
  );
  expect(sections).toHaveLength(1);
  expect(sections[0].title).toBe('Today');
  expect(sections[0].trips.map((t) => t.id)).toStrictEqual(['a', 'b']);
});

test('a trip just before midnight yesterday is still Yesterday', () => {
  const sections = groupTripsByDay([tripAt('late', NOW.getTime() - 13 * HOUR_MS)], NOW);
  expect(sections[0].title).toBe('Yesterday');
});
