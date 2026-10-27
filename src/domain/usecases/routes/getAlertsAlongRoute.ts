import type { AlertKind, Camera, CameraType, Hazard, HazardType, LatLng } from '../../entities';
import { fixedPointTitle, isSpeedCamera } from '../drive/fixedPoints';
import { haversineDistanceM, pointToSegmentDistanceM } from '../drive/geo';
import { boundsAround, isInBounds } from '../geo/bounds';
import { isHazardExpired } from '../hazards/isHazardExpired';

export type RouteAlert = {
  kind: AlertKind;
  refId: string;
  title: string;
  distanceAlongM: number;
  distanceFromRouteM: number;
  speedLimitKmh?: number;
  hazardType?: HazardType;
  featureType?: CameraType;
};

// How far from the route a point may lie and still count as on the way.
export const ROUTE_ALERT_DISTANCE_M = 50;

// The only points getAlertsAlongRoute can report: everything else lies outside
// the route's box, so callers may fetch just these.
export function routeAlertBounds(points: readonly LatLng[], maxDistanceM = ROUTE_ALERT_DISTANCE_M) {
  return boundsAround(points, maxDistanceM);
}

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
  maxDistanceM = ROUTE_ALERT_DISTANCE_M,
  now: Date = new Date(),
): RouteAlert[] {
  if (points.length < 2) return [];
  const alerts: RouteAlert[] = [];
  const box = routeAlertBounds(points, maxDistanceM);
  const inBox = (p: LatLng) => isInBounds(p, box);

  for (const camera of cameras) {
    if (!inBox(camera)) continue;
    const proj = projectOntoRoute(points, camera);
    if (proj.distanceFromRouteM > maxDistanceM) continue;
    alerts.push({
      kind: 'camera',
      refId: camera.id,
      title: isSpeedCamera(camera) ? `${camera.roadName} speed camera` : fixedPointTitle(camera.type).replace(' ahead', ''),
      distanceAlongM: proj.distanceAlongM,
      distanceFromRouteM: proj.distanceFromRouteM,
      speedLimitKmh: isSpeedCamera(camera) && camera.speedLimitKmh > 0 ? camera.speedLimitKmh : undefined,
      featureType: camera.type,
    });
  }

  for (const hazard of hazards) {
    if (isHazardExpired(hazard, now) || !inBox(hazard)) continue;
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

// "4 cameras · 12 bumps · 1 hazard" — only the kinds present on the route.
export function describeRouteAlerts(alerts: readonly RouteAlert[]): string {
  const counts = { camera: 0, police: 0, bump: 0, hazard: 0 };
  for (const alert of alerts) {
    if (alert.kind === 'hazard') counts.hazard += 1;
    else if (alert.featureType === 'police') counts.police += 1;
    else if (alert.featureType === 'speed_bump' || alert.featureType === 'bump_zone') counts.bump += 1;
    else counts.camera += 1;
  }
  const part = (n: number, one: string, many: string) => (n === 0 ? null : `${n} ${n === 1 ? one : many}`);
  const parts = [
    part(counts.camera, 'camera', 'cameras'),
    part(counts.police, 'police post', 'police posts'),
    part(counts.bump, 'bump', 'bumps'),
    part(counts.hazard, 'hazard', 'hazards'),
  ].filter((text): text is string => text !== null);
  return parts.length === 0 ? 'Nothing reported on the way' : parts.join(' · ');
}
