import type { Hazard } from '../../entities';
import { HAZARD_DENIAL_LIMIT } from '../../../shared/constants';

export function isHazardExpired(hazard: Hazard, now: Date): boolean {
  if (hazard.status === 'expired') return true;
  if (hazard.denials >= HAZARD_DENIAL_LIMIT) return true;
  return now.getTime() >= new Date(hazard.expiresAt).getTime();
}
