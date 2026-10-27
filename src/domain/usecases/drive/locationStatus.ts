// Both location sources deliver one reading a second; five missed readings in
// a row mean the position on screen is no longer live.
export const READING_STALE_MS = 5_000;

// live: readings arriving (or the drive only just started). waiting: no first
// reading yet. lost: readings stopped. failed: the source could not start.
export type LocationStatus = 'live' | 'waiting' | 'lost' | 'failed';

export function driveLocationStatus(
  now: number,
  drivingSince: number,
  lastReadingAt: number | null,
  sourceFailed: boolean,
): LocationStatus {
  if (sourceFailed) return 'failed';
  if (lastReadingAt === null) return now - drivingSince > READING_STALE_MS ? 'waiting' : 'live';
  return now - lastReadingAt > READING_STALE_MS ? 'lost' : 'live';
}
