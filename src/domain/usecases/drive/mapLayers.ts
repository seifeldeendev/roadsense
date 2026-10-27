import type { AlertTarget, Camera, Hazard } from '../../entities';
import { alertTargetFor } from './fixedPoints';

// Drops the kinds of point the driver chose to hide from the maps.
export function visibleOnMap<T extends Camera | Hazard>(
  points: readonly T[],
  hidden: readonly AlertTarget[],
): T[] {
  if (hidden.length === 0) return [...points];
  return points.filter((point) => {
    const target = 'speedLimitKmh' in point ? alertTargetFor(point.type) : point.type;
    return !hidden.includes(target);
  });
}
