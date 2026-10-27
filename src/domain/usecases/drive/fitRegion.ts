import type { LatLng } from '../../entities';

export type MapFrame = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const PADDING_FRACTION = 1.5;
const MIN_LATITUDE_DELTA = 0.004;
const MIN_LONGITUDE_DELTA = 0.004;

// Central Cairo, used when there is nothing to frame.
const FALLBACK_FRAME: MapFrame = {
  latitude: 30.0444,
  longitude: 31.2357,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export function fitRouteRegion(coordinates: readonly LatLng[]): MapFrame {
  if (coordinates.length === 0) return FALLBACK_FRAME;
  const lats = coordinates.map((c) => c.lat);
  const lngs = coordinates.map((c) => c.lng);
  const latSpan = Math.max(...lats) - Math.min(...lats);
  const lngSpan = Math.max(...lngs) - Math.min(...lngs);
  return {
    latitude: (Math.max(...lats) + Math.min(...lats)) / 2,
    longitude: (Math.max(...lngs) + Math.min(...lngs)) / 2,
    latitudeDelta: Math.max(latSpan * PADDING_FRACTION, MIN_LATITUDE_DELTA),
    longitudeDelta: Math.max(lngSpan * PADDING_FRACTION, MIN_LONGITUDE_DELTA),
  };
}
