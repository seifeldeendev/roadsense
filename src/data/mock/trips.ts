import type { AlertEvent, LatLng, Trip, TripPoint } from '../../domain/entities';
import { bearingDeg, haversineDistanceM } from '../../domain/usecases/drive/geo';
import { ROAD_TRIP_SPECS, SECOND_MS, startedOn, type AlertSpec } from './roadTrips';

const WAYPOINTS: LatLng[] = [
  { lat: 30.072, lng: 31.335 },
  { lat: 30.078, lng: 31.338 },
  { lat: 30.0838, lng: 31.3409 },
  { lat: 30.09, lng: 31.344 },
];

const LIMIT_KMH = 80;
const POINT_COUNT = 120;
const STEP_MS = 1000;

type RouteSpec = {
  waypoints: readonly LatLng[];
  limitKmh: number;
  stepMs: number;
  pointCount: number;
  speedAt: (tS: number) => number;
};

const DEMO_ROUTE: RouteSpec = {
  waypoints: WAYPOINTS,
  limitKmh: LIMIT_KMH,
  stepMs: STEP_MS,
  pointCount: POINT_COUNT,
  speedAt(t) {
    if (t < 20) return (t / 20) * 70;
    if (t < 60) return 70 + ((t - 20) / 40) * 25;
    return Math.max(0, 95 * (1 - (t - 60) / 60));
  },
};

// Reusable route builder: walks the waypoints at the given speed profile,
// recording one point every stepMs milliseconds.
function buildPoints(spec: RouteSpec, startedMs: number): TripPoint[] {
  const segmentEnds = spec.waypoints.map((wp) => haversineDistanceM(spec.waypoints[0], wp));
  const stepSeconds = spec.stepMs / SECOND_MS;
  const points: TripPoint[] = [];
  let travelled = 0;

  for (let i = 0; i < spec.pointCount; i += 1) {
    if (i > 0) travelled += (spec.speedAt((i - 1) * stepSeconds) * stepSeconds) / 3.6;
    let segIdx = 1;
    while (segIdx < segmentEnds.length - 1 && travelled > segmentEnds[segIdx]) {
      segIdx += 1;
    }
    const segStart = segmentEnds[segIdx - 1];
    const segEnd = segmentEnds[segIdx];
    const segLength = Math.max(segEnd - segStart, 0.001);
    const f = Math.min(Math.max((travelled - segStart) / segLength, 0), 1);
    const a = spec.waypoints[segIdx - 1];
    const b = spec.waypoints[segIdx];
    points.push({
      lat: a.lat + f * (b.lat - a.lat),
      lng: a.lng + f * (b.lng - a.lng),
      ts: startedMs + i * spec.stepMs,
      speedKmh: Math.round(spec.speedAt(i * stepSeconds) * 10) / 10,
      heading: Math.round(bearingDeg(a, b)),
      limitKmh: spec.limitKmh,
    });
  }
  return points;
}

function summarizePoints(points: readonly TripPoint[], startedMs: number, stepMs: number) {
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
    startedAt: startedMs,
    endedAt: startedMs + (points.length - 1) * stepMs,
    distanceM: Math.round(distanceM),
    durationS: Math.round(((points.length - 1) * stepMs) / SECOND_MS),
    maxSpeedKmh: Math.round(maxSpeedKmh),
    avgSpeedKmh: points.length > 0 ? Math.round(speedSum / points.length) : 0,
    overLimitCount,
  };
}

function buildAlerts(alertSpecs: readonly AlertSpec[], startedMs: number): AlertEvent[] {
  return alertSpecs.map((spec) => ({
    ts: startedMs + spec.afterS * SECOND_MS,
    kind: spec.kind,
    refId: spec.refId,
    distanceM: spec.distanceM,
  }));
}

function buildTrip(id: string, spec: RouteSpec, startedMs: number, alertSpecs: readonly AlertSpec[]): Trip {
  const points = buildPoints(spec, startedMs);
  return {
    id,
    ...summarizePoints(points, startedMs, spec.stepMs),
    points,
    alerts: buildAlerts(alertSpecs, startedMs),
  };
}

function buildDemoTrip(): Trip {
  return buildTrip('trip-demo-salah-salem', DEMO_ROUTE, Date.now(), []);
}

export const DEMO_TRIP: Trip = buildDemoTrip();

export const MOCK_TRIPS: Trip[] = [
  DEMO_TRIP,
  ...ROAD_TRIP_SPECS.map((roadSpec) => {
    const startedMs = startedOn(
      Date.now(),
      roadSpec.startedAgo.days,
      roadSpec.startedAgo.hour,
      roadSpec.startedAgo.minute,
    );
    return buildTrip(
      roadSpec.id,
      {
        waypoints: roadSpec.waypoints,
        limitKmh: roadSpec.limitKmh,
        stepMs: roadSpec.stepMs,
        pointCount: Math.round((roadSpec.durationS * SECOND_MS) / roadSpec.stepMs) + 1,
        speedAt: roadSpec.speedAt,
      },
      startedMs,
      roadSpec.alerts,
    );
  }),
];
