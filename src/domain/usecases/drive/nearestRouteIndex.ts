import type { LatLng } from '../../entities';
import { haversineDistanceM } from './geo';

export function nearestRouteIndex(
  route: readonly LatLng[],
  position: LatLng,
): number {
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < route.length; index += 1) {
    const distance = haversineDistanceM(route[index], position);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  }
  return best;
}
