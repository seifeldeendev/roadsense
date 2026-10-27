export type SpeedStatus = 'ok' | 'near' | 'over';

export function getSpeedStatus(
  speedKmh: number,
  limitKmh: number,
  amberThresholdPct: number = 90,
): SpeedStatus {
  if (speedKmh > limitKmh) {
    return 'over';
  }
  if (speedKmh >= (limitKmh * amberThresholdPct) / 100) {
    return 'near';
  }
  return 'ok';
}
