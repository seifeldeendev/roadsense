import type { LatLng } from '../../entities';

const EARTH_RADIUS_M = 6_371_000;

const toRad = (deg: number): number => (deg * Math.PI) / 180;

const toDeg = (rad: number): number => (rad * 180) / Math.PI;

export function haversineDistanceM(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function bearingDeg(a: LatLng, b: LatLng): number {
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLng = toRad(b.lng - a.lng);
  const x = Math.sin(dLng) * Math.cos(lat2);
  const y =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const deg = toDeg(Math.atan2(x, y));
  return (deg + 360) % 360;
}

export function angleDiffDeg(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

export type SegmentProjection = {
  distanceM: number;
  alongM: number;
};

const METRES_PER_DEG_LAT = 110_540;
const METRES_PER_DEG_LNG_AT_EQUATOR = 111_320;

// Local planar approximation in metres, accurate enough for short segments.
function toPlanarMetres(from: LatLng, to: LatLng, cosLat: number): { dx: number; dy: number } {
  return {
    dx: (to.lng - from.lng) * METRES_PER_DEG_LNG_AT_EQUATOR * cosLat,
    dy: (to.lat - from.lat) * METRES_PER_DEG_LAT,
  };
}

export function pointToSegmentDistanceM(
  point: LatLng,
  segStart: LatLng,
  segEnd: LatLng,
): SegmentProjection {
  const cosLat = Math.cos(toRad((segStart.lat + segEnd.lat) / 2));
  const ab = toPlanarMetres(segStart, segEnd, cosLat);
  const ap = toPlanarMetres(segStart, point, cosLat);
  const segLenSq = ab.dx * ab.dx + ab.dy * ab.dy;
  if (segLenSq < 1e-6) {
    return { distanceM: haversineDistanceM(point, segStart), alongM: 0 };
  }
  const t = Math.min(Math.max((ap.dx * ab.dx + ap.dy * ab.dy) / segLenSq, 0), 1);
  const projLat = segStart.lat + t * (segEnd.lat - segStart.lat);
  const projLng = segStart.lng + t * (segEnd.lng - segStart.lng);
  return {
    distanceM: haversineDistanceM(point, { lat: projLat, lng: projLng }),
    alongM: Math.sqrt(segLenSq) * t,
  };
}
