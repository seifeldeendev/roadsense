import { describe, expect, it } from '@jest/globals';
import { shouldTriggerSpeedAlarm } from '../src/domain/usecases/drive/speedAlarm';

describe('shouldTriggerSpeedAlarm', () => {
  it('fires on the reading that crosses above the alarm speed', () => {
    expect(shouldTriggerSpeedAlarm(99, 101, 100)).toBe(true);
    expect(shouldTriggerSpeedAlarm(100, 100.5, 100)).toBe(true);
  });

  it('stays quiet while already above, below, or exactly at the alarm', () => {
    expect(shouldTriggerSpeedAlarm(105, 110, 100)).toBe(false);
    expect(shouldTriggerSpeedAlarm(80, 95, 100)).toBe(false);
    expect(shouldTriggerSpeedAlarm(99, 100, 100)).toBe(false);
  });

  it('re-arms after dropping back below and never fires when off', () => {
    expect(shouldTriggerSpeedAlarm(110, 95, 100)).toBe(false);
    expect(shouldTriggerSpeedAlarm(95, 104, 100)).toBe(true);
    expect(shouldTriggerSpeedAlarm(0, 200, null)).toBe(false);
  });
});
