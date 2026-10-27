import type { AlertTarget, Camera, CameraType, LatLng } from '../../entities';
import type { MapFrame } from './fitRegion';
import { haversineDistanceM } from './geo';

export const SPEED_CAMERA_TYPES: readonly CameraType[] = ['fixed', 'average', 'red_light'];

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

// Visible-area radii: below 2 km the region is already street-level (show the
// 2 km around it anyway), above 50 km the national scale would pull in the
// whole database along the visible band, which defeats the cap.
const MIN_VIEW_RADIUS_M = 2_000;
const MAX_VIEW_RADIUS_M = 50_000;

// The points the map is looking at, after a pan: the nearest ones to the
// visible centre, within the visible span.
export function pointsInView<T extends LatLng>(
  points: readonly T[],
  region: MapFrame,
  maxCount: number,
): T[] {
  const center = { lat: region.latitude, lng: region.longitude };
  // Centre-to-corner is half of the diagonal span of the visible map.
  const halfDiagonalM = haversineDistanceM(center, {
    lat: region.latitude + region.latitudeDelta / 2,
    lng: region.longitude + region.longitudeDelta / 2,
  });
  const radiusM = Math.min(MAX_VIEW_RADIUS_M, Math.max(MIN_VIEW_RADIUS_M, halfDiagonalM));
  return nearestPoints(points, center, maxCount, radiusM);
}

const MIN_MOVE_M = 100;
const MIN_ZOOM_SHIFT = 0.1;

// True when a region change is the nudge of a routine pan rather than a move
// to a visibly different area, so the marker lists need not be recomputed.
export function isMinorRegionChange(previous: MapFrame | null, next: MapFrame): boolean {
  if (previous === null) return false;
  const movedM = haversineDistanceM(
    { lat: previous.latitude, lng: previous.longitude },
    { lat: next.latitude, lng: next.longitude },
  );
  const latZoomShift = Math.abs(previous.latitudeDelta - next.latitudeDelta) / previous.latitudeDelta;
  const lngZoomShift = Math.abs(previous.longitudeDelta - next.longitudeDelta) / previous.longitudeDelta;
  return movedM < MIN_MOVE_M && latZoomShift < MIN_ZOOM_SHIFT && lngZoomShift < MIN_ZOOM_SHIFT;
}
