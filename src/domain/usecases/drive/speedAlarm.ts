// True only on the reading that crosses above the alarm speed, so the warning
// fires once per crossing and re-arms after the driver drops back to or below it.
export function shouldTriggerSpeedAlarm(
  previousSpeedKmh: number,
  speedKmh: number,
  alarmKmh: number | null,
): boolean {
  if (alarmKmh === null) return false;
  return previousSpeedKmh <= alarmKmh && speedKmh > alarmKmh;
}
