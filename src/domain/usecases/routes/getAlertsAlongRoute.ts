import type { AlertKind, Camera, Hazard, HazardType, LatLng } from '../../entities';
import { haversineDistanceM, pointToSegmentDistanceM } from '../drive/geo';
import { isHazardExpired } from '../hazards/isHazardExpired';

export type RouteAlert = {
  kind: AlertKind;
  refId: string;
  title: string;
  distanceAlongM: number;
  distanceFromRouteM: number;
  speedLimitKmh?: number;
  hazardType?: HazardType;
};

const HAZARD_TITLES: Record<HazardType, string> = {
  accident: 'Accident',
  pothole: 'Pothole',
  checkpoint: 'Checkpoint',
  flooding: 'Flooding',
};

function projectOntoRoute(
  points: readonly LatLng[],
  point: LatLng,
): { distanceAlongM: number; distanceFromRouteM: number } {
  let cumulative = 0;
  let best = { distanceAlongM: Number.POSITIVE_INFINITY, distanceFromRouteM: Number.POSITIVE_INFINITY };
  for (let i = 1; i < points.length; i += 1) {
    const proj = pointToSegmentDistanceM(point, points[i - 1], points[i]);
    if (proj.distanceM < best.distanceFromRouteM) {
      best = {
        distanceAlongM: cumulative + proj.alongM,
        distanceFromRouteM: proj.distanceM,
      };
    }
    cumulative += haversineDistanceM(points[i - 1], points[i]);
  }
  return best;
}

export function getAlertsAlongRoute(
  points: readonly LatLng[],
  cameras: readonly Camera[],
  hazards: readonly Hazard[],
  maxDistanceM = 50,
  now: Date = new Date(),
): RouteAlert[] {
  if (points.length < 2) return [];
  const alerts: RouteAlert[] = [];

  for (const camera of cameras) {
    const proj = projectOntoRoute(points, camera);
    if (proj.distanceFromRouteM > maxDistanceM) continue;
    alerts.push({
      kind: 'camera',
      refId: camera.id,
      title: `${camera.roadName} speed camera`,
      distanceAlongM: proj.distanceAlongM,
      distanceFromRouteM: proj.distanceFromRouteM,
      speedLimitKmh: camera.speedLimitKmh,
    });
  }

  for (const hazard of hazards) {
    if (isHazardExpired(hazard, now)) continue;
    const proj = projectOntoRoute(points, hazard);
    if (proj.distanceFromRouteM > maxDistanceM) continue;
    alerts.push({
      kind: 'hazard',
      refId: hazard.id,
      title: HAZARD_TITLES[hazard.type],
      hazardType: hazard.type,
      distanceAlongM: proj.distanceAlongM,
      distanceFromRouteM: proj.distanceFromRouteM,
    });
  }

  return alerts.sort((a, b) => a.distanceAlongM - b.distanceAlongM);
}
