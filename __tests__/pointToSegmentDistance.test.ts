import { describe, expect, it } from '@jest/globals';
import { pointToSegmentDistanceM } from '../src/domain/usecases/drive/geo';

const A = { lat: 30.07, lng: 31.335 };
const B = { lat: 30.08, lng: 31.335 };

describe('pointToSegmentDistanceM', () => {
  it('returns 0 for a point lying on the segment', () => {
    const proj = pointToSegmentDistanceM({ lat: 30.075, lng: 31.335 }, A, B);
    expect(proj.distanceM).toBeCloseTo(0, 6);
    expect(proj.alongM).toBeGreaterThan(500);
  });

  it('projects a point near the middle of the segment', () => {
    // ~200 m east of the segment midpoint (1° lng ≈ 96 km at this latitude).
    const point = { lat: 30.075, lng: 31.33708 };
    const proj = pointToSegmentDistanceM(point, A, B);
    expect(proj.distanceM).toBeCloseTo(200, 0);
    expect(proj.alongM).toBeGreaterThan(400);
    expect(proj.alongM).toBeLessThan(700);
  });

  it('clamps to the segment ends for perpendicular projections outside it', () => {
    const before = pointToSegmentDistanceM({ lat: 30.05, lng: 31.335 }, A, B);
    expect(before.alongM).toBe(0);
    const after = pointToSegmentDistanceM({ lat: 30.09, lng: 31.335 }, A, B);
    expect(after.alongM).toBeCloseTo(1105, 0);
  });

  it('handles zero-length segments', () => {
    const proj = pointToSegmentDistanceM({ lat: 30.075, lng: 31.335 }, A, A);
    expect(proj.alongM).toBe(0);
    expect(proj.distanceM).toBeGreaterThan(500);
  });
});
