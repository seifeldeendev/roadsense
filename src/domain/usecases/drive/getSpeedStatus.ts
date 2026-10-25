export type SpeedStatus = 'ok' | 'near' | 'over';

export function getSpeedStatus(
  speedKmh: number,
  limitKmh: number,
  amberThresholdPct: number = 90,
): SpeedStatus {
  // No known limit (0) means there is nothing to compare against.
  if (limitKmh <= 0) {
    return 'ok';
  }
  if (speedKmh > limitKmh) {
    return 'over';
  }
  if (speedKmh >= (limitKmh * amberThresholdPct) / 100) {
    return 'near';
  }
  return 'ok';
}
