import { describe, expect, it } from '@jest/globals';
import { isMinorRegionChange, pointsInView } from '../src/domain/usecases/drive/fixedPoints';
import type { MapFrame } from '../src/domain/usecases/drive/fitRegion';

type Point = { id: string; lat: number; lng: number };

function point(id: string, lat: number, lng: number): Point {
  return { id, lat, lng };
}

function frame(lat: number, lng: number, latDelta: number, lngDelta: number): MapFrame {
  return { latitude: lat, longitude: lng, latitudeDelta: latDelta, longitudeDelta: lngDelta };
}

describe('pointsInView', () => {
  const cairo = frame(30.05, 31.23, 0.02, 0.02);

  it('keeps at most maxCount points', () => {
    // All within the ~2 km radius of this small frame.
    const points = [
      point('a', 30.0536, 31.23), // ~400 m
      point('b', 30.0572, 31.23), // ~800 m
      point('c', 30.0609, 31.23), // ~1.2 km
      point('d', 30.0645, 31.23), // ~1.6 km
      point('e', 30.0675, 31.23), // ~1.9 km
    ];
    expect(pointsInView(points, cairo, 3).map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });

  it('keeps the nearest points and drops those outside the visible radius', () => {
    const points = [
      point('far', 30.1, 31.23), // ~5.5 km from the centre
      point('near2', 30.058, 31.23), // ~0.9 km
      point('near1', 30.054, 31.23), // ~0.4 km
      point('edge', 30.066, 31.23), // ~1.8 km
    ];
    expect(pointsInView(points, cairo, 10).map((p) => p.id)).toEqual(['near1', 'near2', 'edge']);
  });

  it('clamps the radius up, so a street-level view still shows points around it', () => {
    // Half the diagonal of this frame is ~150 m, but the floor is 2 km.
    const tiny = frame(30.05, 31.23, 0.001, 0.001);
    const points = [point('offscreen', 30.0635, 31.23)]; // ~1.5 km away
    expect(pointsInView(points, tiny, 10).map((p) => p.id)).toEqual(['offscreen']);
  });

  it('clamps the radius down, so a national view does not pull in the whole band', () => {
    // Half the diagonal of this frame is ~65 km, but the ceiling is 50 km.
    const national = frame(30.05, 31.23, 0.9, 0.9);
    const points = [
      point('mid', 30.46, 31.23), // ~45 km away
      point('tooFar', 30.5928, 31.23), // ~60 km away
    ];
    expect(pointsInView(points, national, 10).map((p) => p.id)).toEqual(['mid']);
  });
});

describe('isMinorRegionChange', () => {
  const cairo = frame(30.05, 31.23, 0.02, 0.02);

  it('treats the first report as a change worth recording', () => {
    expect(isMinorRegionChange(null, cairo)).toBe(false);
  });

  it('ignores a nudge that barely moves or zooms', () => {
    // ~45 m sideways at the same zoom.
    expect(isMinorRegionChange(cairo, frame(30.0504, 31.23, 0.02, 0.02))).toBe(true);
    // Same centre, ~5% tighter span.
    expect(isMinorRegionChange(cairo, frame(30.05, 31.23, 0.019, 0.019))).toBe(true);
  });

  it('treats a real pan or a real zoom change as significant', () => {
    // ~1.1 km north.
    expect(isMinorRegionChange(cairo, frame(30.06, 31.23, 0.02, 0.02))).toBe(false);
    // 25% tighter zoom.
    expect(isMinorRegionChange(cairo, frame(30.05, 31.23, 0.015, 0.02))).toBe(false);
  });
});
