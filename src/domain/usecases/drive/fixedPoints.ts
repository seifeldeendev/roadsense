import type { AlertTarget, Camera, CameraType, LatLng } from '../../entities';
import { haversineDistanceM } from './geo';

const SPEED_CAMERA_TYPES: readonly CameraType[] = ['fixed', 'average', 'red_light'];

export function isSpeedCamera(camera: Pick<Camera, 'type'>): boolean {
  return SPEED_CAMERA_TYPES.includes(camera.type);
}

// The alert switch (in settings) that governs this kind of fixed point.
export function alertTargetFor(type: CameraType): AlertTarget {
  if (type === 'police') return 'police';
  if (type === 'speed_bump' || type === 'bump_zone') return 'bump';
  return 'camera';
}

export function fixedPointTitle(type: CameraType): string {
  switch (type) {
    case 'police':
      return 'Police ahead';
    case 'speed_bump':
      return 'Speed bump ahead';
    case 'bump_zone':
      return 'Speed bump zone ahead';
    default:
      return 'Speed camera ahead';
  }
}

// The closest points to a centre, for drawing a dense national dataset on a map
// without thousands of markers.
export function nearestPoints<T extends LatLng>(
  points: readonly T[],
  center: LatLng,
  maxCount: number,
  maxRadiusM: number,
): T[] {
  return points
    .map((point) => ({ point, distanceM: haversineDistanceM(center, point) }))
    .filter((entry) => entry.distanceM <= maxRadiusM)
    .sort((a, b) => a.distanceM - b.distanceM)
    .slice(0, maxCount)
    .map((entry) => entry.point);
}
