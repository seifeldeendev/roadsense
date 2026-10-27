import type { GeoBounds, LatLng } from '../../entities';

// ~111 km per degree of latitude.
const METRES_PER_DEGREE = 111_000;

// The box around some points, widened by a margin in metres. Longitude degrees
// shrink with latitude, so the longitude margin is scaled at the northernmost
// point; the box always holds everything within the margin of the points.
export function boundsAround(points: readonly LatLng[], marginM: number): GeoBounds {
  const marginDeg = marginM / METRES_PER_DEGREE;
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const lngMarginDeg = marginDeg / Math.cos((Math.max(...lats) * Math.PI) / 180);
  return {
    minLat: Math.min(...lats) - marginDeg,
    maxLat: Math.max(...lats) + marginDeg,
    minLng: Math.min(...lngs) - lngMarginDeg,
    maxLng: Math.max(...lngs) + lngMarginDeg,
  };
}

export function isInBounds(point: LatLng, bounds: GeoBounds): boolean {
  return point.lat >= bounds.minLat && point.lat <= bounds.maxLat && point.lng >= bounds.minLng && point.lng <= bounds.maxLng;
}
