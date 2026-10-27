import type { Hazard } from '../../entities';
import { isHazardExpired } from './isHazardExpired';

export function applyVote(hazard: Hazard, stillThere: boolean, now: Date): Hazard {
  const updated: Hazard = {
    ...hazard,
    confirmations: stillThere ? hazard.confirmations + 1 : hazard.confirmations,
    denials: stillThere ? hazard.denials : hazard.denials + 1,
  };
  return isHazardExpired(updated, now) ? { ...updated, status: 'expired' } : updated;
}
