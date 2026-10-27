import type { Hazard } from '../../entities';

// A report this many drivers say is gone counts as expired.
const HAZARD_DENIAL_LIMIT = 3;

export function isHazardExpired(hazard: Hazard, now: Date): boolean {
  if (hazard.status === 'expired') return true;
  if (hazard.denials >= HAZARD_DENIAL_LIMIT) return true;
  return now.getTime() >= new Date(hazard.expiresAt).getTime();
}
