import type { Camera, LatLng } from '../../entities';
import { haversineDistanceM } from './geo';

const ROAD_MATCH_RADIUS_M = 600;

// The mock data has no road graph, so the road is named after the closest
// known camera when one is near enough; otherwise it is unknown.
export function nearestRoadName(
  position: LatLng,
  cameras: readonly Camera[],
  radiusM: number = ROAD_MATCH_RADIUS_M,
): string | null {
  let best: { name: string; distanceM: number } | null = null;
  for (const camera of cameras) {
    const distanceM = haversineDistanceM(position, camera);
    if (distanceM <= radiusM && (best === null || distanceM < best.distanceM)) {
      best = { name: camera.roadName, distanceM };
    }
  }
  return best?.name ?? null;
}
