import type { LatLng, Trip, TripPoint } from '../../domain/entities';
import { bearingDeg, haversineDistanceM } from '../../domain/usecases/drive/geo';

const WAYPOINTS: LatLng[] = [
  { lat: 30.072, lng: 31.335 },
  { lat: 30.078, lng: 31.338 },
  { lat: 30.0838, lng: 31.3409 },
  { lat: 30.09, lng: 31.344 },
];

const LIMIT_KMH = 80;
const POINT_COUNT = 120;
const STEP_MS = 1000;

function speedAt(t: number): number {
  if (t < 20) return (t / 20) * 70;
  if (t < 60) return 70 + ((t - 20) / 40) * 25;
  return Math.max(0, 95 * (1 - (t - 60) / 60));
}

function buildPoints(startedMs: number): TripPoint[] {
  const segmentEnds = WAYPOINTS.map((wp) =>
    haversineDistanceM(WAYPOINTS[0], wp),
  );
  const points: TripPoint[] = [];
  let travelled = 0;

  for (let i = 0; i < POINT_COUNT; i += 1) {
    if (i > 0) travelled += speedAt(i - 1) / 3.6;
    let segIdx = 1;
    while (segIdx < segmentEnds.length - 1 && travelled > segmentEnds[segIdx]) {
      segIdx += 1;
    }
    const segStart = segmentEnds[segIdx - 1];
    const segEnd = segmentEnds[segIdx];
    const segLength = Math.max(segEnd - segStart, 0.001);
    const f = Math.min(Math.max((travelled - segStart) / segLength, 0), 1);
    const a = WAYPOINTS[segIdx - 1];
    const b = WAYPOINTS[segIdx];
    points.push({
      lat: a.lat + f * (b.lat - a.lat),
      lng: a.lng + f * (b.lng - a.lng),
      ts: startedMs + i * STEP_MS,
      speedKmh: Math.round(speedAt(i) * 10) / 10,
      heading: Math.round(bearingDeg(a, b)),
      limitKmh: LIMIT_KMH,
    });
  }
  return points;
}

function buildDemoTrip(): Trip {
  const startedMs = Date.now();
  const points = buildPoints(startedMs);
  let distanceM = 0;
  let maxSpeedKmh = 0;
  let speedSum = 0;
  let overLimitCount = 0;
  for (const point of points) {
    if (point.speedKmh > maxSpeedKmh) maxSpeedKmh = point.speedKmh;
    speedSum += point.speedKmh;
    if (point.speedKmh > point.limitKmh) overLimitCount += 1;
  }
  for (let i = 1; i < points.length; i += 1) {
    distanceM += haversineDistanceM(points[i - 1], points[i]);
  }
  return {
    id: 'trip-demo-salah-salem',
    startedAt: startedMs,
    endedAt: startedMs + (POINT_COUNT - 1) * STEP_MS,
    distanceM: Math.round(distanceM),
    durationS: POINT_COUNT - 1,
    maxSpeedKmh: Math.round(maxSpeedKmh),
    avgSpeedKmh: Math.round(speedSum / points.length),
    overLimitCount,
    points,
    alerts: [],
  };
}

export const DEMO_TRIP: Trip = buildDemoTrip();
