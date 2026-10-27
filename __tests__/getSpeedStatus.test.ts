import { describe, expect, it } from '@jest/globals';
import { getSpeedStatus } from '../src/domain/usecases/drive/getSpeedStatus';

describe('getSpeedStatus', () => {
  it('returns ok below the amber threshold', () => {
    expect(getSpeedStatus(60, 80)).toBe('ok');
    expect(getSpeedStatus(71, 80)).toBe('ok');
  });

  it('returns near exactly at the amber threshold', () => {
    expect(getSpeedStatus(72, 80, 90)).toBe('near');
  });

  it('returns near exactly at the limit', () => {
    expect(getSpeedStatus(80, 80)).toBe('near');
  });

  it('returns over when speed exceeds the limit by 1', () => {
    expect(getSpeedStatus(81, 80)).toBe('over');
  });

  it('honours a custom amber threshold', () => {
    expect(getSpeedStatus(91, 100, 95)).toBe('ok');
    expect(getSpeedStatus(95, 100, 95)).toBe('near');
    expect(getSpeedStatus(100, 100, 95)).toBe('near');
    expect(getSpeedStatus(101, 100, 95)).toBe('over');
  });
});
