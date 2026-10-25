import type { LatLng, TripPoint } from '../../entities';
import { bearingDeg, haversineDistanceM } from '../drive/geo';

const CRUISE_KMH = 50;
const ACCELERATION_S = 8;

// A one-reading-per-second drive along a route, for testing a planned trip
// indoors: speeds up to cruise, holds it, and slows into the destination.
export function simulateDrive(
  route: readonly LatLng[],
  startTs: number,
  limitFor: (position: LatLng) => number,
  cruiseKmh: number = CRUISE_KMH,
): TripPoint[] {
  if (route.length < 2) return [];
  const cumulative = [0];
  for (let i = 1; i < route.length; i += 1) {
    cumulative.push(cumulative[i - 1] + haversineDistanceM(route[i - 1], route[i]));
  }
  const total = cumulative[cumulative.length - 1];
  const cruiseMs = cruiseKmh / 3.6;

  const points: TripPoint[] = [];
  let travelled = 0;
  let segment = 1;
  for (let t = 0; travelled < total; t += 1) {
    const remaining = total - travelled;
    // Ease in at the start and out over the last ~100 m.
    const speedMs = Math.max(1, Math.min(cruiseMs, (cruiseMs * (t + 1)) / ACCELERATION_S, remaining / 4));
    while (segment < route.length - 1 && cumulative[segment] < travelled) segment += 1;
    const a = route[segment - 1];
    const b = route[segment];
    const length = Math.max(cumulative[segment] - cumulative[segment - 1], 0.001);
    const f = Math.min(1, Math.max(0, (travelled - cumulative[segment - 1]) / length));
    const position = { lat: a.lat + f * (b.lat - a.lat), lng: a.lng + f * (b.lng - a.lng) };
    points.push({
      ...position,
      ts: startTs + t * 1000,
      speedKmh: Math.round(speedMs * 3.6),
      heading: Math.round(bearingDeg(a, b)),
      limitKmh: limitFor(position),
    });
    travelled += speedMs;
  }
  const end = route[route.length - 1];
  points.push({ ...end, ts: startTs + points.length * 1000, speedKmh: 0, heading: points[points.length - 1]?.heading ?? 0, limitKmh: limitFor(end) });
  return points;
}
