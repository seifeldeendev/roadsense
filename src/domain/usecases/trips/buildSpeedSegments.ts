import type { LatLng, TripPoint } from '../../entities';
import { getSpeedStatus, type SpeedStatus } from '../drive/getSpeedStatus';

export type SpeedSegment = {
  status: SpeedStatus;
  points: LatLng[];
};

// Splits a trip into consecutive runs of points that share the same speed
// status. Adjacent runs share their boundary point, so drawing one polyline
// per segment keeps the route line continuous.
export function buildSpeedSegments(
  points: readonly TripPoint[],
  amberThresholdPct: number = 90,
): SpeedSegment[] {
  const segments: SpeedSegment[] = [];
  if (points.length === 0) return segments;

  const asLatLng = (point: TripPoint): LatLng => ({ lat: point.lat, lng: point.lng });
  let run: SpeedSegment = {
    status: getSpeedStatus(points[0].speedKmh, points[0].limitKmh, amberThresholdPct),
    points: [asLatLng(points[0])],
  };

  for (let i = 1; i < points.length; i += 1) {
    const point = points[i];
    const status = getSpeedStatus(point.speedKmh, point.limitKmh, amberThresholdPct);
    if (status === run.status) {
      run.points.push(asLatLng(point));
      continue;
    }
    run.points.push(asLatLng(point));
    segments.push(run);
    run = {
      status,
      points: [asLatLng(point)],
    };
  }
  segments.push(run);
  return segments;
}
