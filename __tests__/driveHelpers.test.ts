import { describe, expect, it } from '@jest/globals';
import type { Camera } from '../src/domain/entities';
import { alertFeedback } from '../src/domain/usecases/drive/alertFeedback';
import { nearestRoadName } from '../src/domain/usecases/drive/nearestRoadName';

function camera(id: string, lat: number, lng: number, roadName: string): Camera {
  return { id, lat, lng, heading: null, speedLimitKmh: 80, roadName, type: 'fixed' };
}

describe('nearestRoadName', () => {
  const cameras = [
    camera('a', 30.07, 31.338, 'Salah Salem'),
    camera('b', 30.073, 31.338, 'Autostrad'),
  ];

  it('names the road after the closest camera within the radius', () => {
    expect(nearestRoadName({ lat: 30.0705, lng: 31.338 }, cameras)).toBe('Salah Salem');
    expect(nearestRoadName({ lat: 30.0728, lng: 31.338 }, cameras)).toBe('Autostrad');
  });

  it('returns null when no camera is near enough', () => {
    expect(nearestRoadName({ lat: 30.2, lng: 31.5 }, cameras)).toBeNull();
    expect(nearestRoadName({ lat: 30.07, lng: 31.338 }, [])).toBeNull();
  });
});

describe('alertFeedback', () => {
  it('speaks every alert in "all" mode when voice is on', () => {
    expect(alertFeedback('all', true, 'camera')).toBe('speak');
    expect(alertFeedback('all', true, 'hazard')).toBe('speak');
    expect(alertFeedback('all', false, 'camera')).toBe('none');
  });

  it('speaks only cameras in "cameras" mode', () => {
    expect(alertFeedback('cameras', true, 'camera')).toBe('speak');
    expect(alertFeedback('cameras', true, 'hazard')).toBe('none');
  });

  it('vibrates or stays silent in the quiet modes', () => {
    expect(alertFeedback('vibrate', true, 'hazard')).toBe('vibrate');
    expect(alertFeedback('muted', true, 'camera')).toBe('none');
  });
});
