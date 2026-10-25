import type { LatLng, PlannedRoute } from '../../entities';
import { haversineDistanceM } from '../drive/geo';

// Roads are longer than the straight line; a typical urban detour factor.
const ROAD_FACTOR = 1.3;
const AVERAGE_SPEED_KMH = 45;
const POINT_COUNT = 60;

// Straight-line estimate used until a directions service is connected: a
// densified line from start to destination with road-adjusted distance and time.
export function estimateRoute(destinationId: string, from: LatLng, to: LatLng): PlannedRoute {
  const points: LatLng[] = Array.from({ length: POINT_COUNT + 1 }, (_, index) => {
    const f = index / POINT_COUNT;
    return { lat: from.lat + f * (to.lat - from.lat), lng: from.lng + f * (to.lng - from.lng) };
  });
  const distanceM = Math.round(haversineDistanceM(from, to) * ROAD_FACTOR);
  return {
    destinationId,
    points,
    distanceM,
    durationS: Math.round(distanceM / (AVERAGE_SPEED_KMH / 3.6)),
  };
}
