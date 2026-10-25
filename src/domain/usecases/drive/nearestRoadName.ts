import type { Camera, LatLng } from '../../entities';
import { haversineDistanceM } from './geo';

const ROAD_MATCH_RADIUS_M = 600;

// The mock data has no road graph, so the current road (name and limit) is
// taken from the closest known camera when one is near enough.
export function nearestCamera(
  position: LatLng,
  cameras: readonly Camera[],
  radiusM: number = ROAD_MATCH_RADIUS_M,
): Camera | null {
  let best: { camera: Camera; distanceM: number } | null = null;
  for (const camera of cameras) {
    const distanceM = haversineDistanceM(position, camera);
    if (distanceM <= radiusM && (best === null || distanceM < best.distanceM)) {
      best = { camera, distanceM };
    }
  }
  return best?.camera ?? null;
}

export function nearestRoadName(position: LatLng, cameras: readonly Camera[]): string | null {
  return nearestCamera(position, cameras)?.roadName ?? null;
}

// 0 when unknown, matching the speed-status rule that 0 means "no limit".
export function nearestSpeedLimit(position: LatLng, cameras: readonly Camera[]): number {
  return nearestCamera(position, cameras)?.speedLimitKmh ?? 0;
}
