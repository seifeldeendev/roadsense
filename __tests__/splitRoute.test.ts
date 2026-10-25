import { describe, expect, it } from '@jest/globals';
import { splitRoute } from '../src/domain/usecases/routes/splitRoute';

describe('splitRoute', () => {
  const route = ['a', 'b', 'c', 'd'];

  it('keeps the whole route ahead before the first position is known', () => {
    expect(splitRoute(route, undefined)).toEqual({ travelled: [], ahead: route });
    expect(splitRoute(route, -1)).toEqual({ travelled: [], ahead: route });
  });

  it('splits at the progress point with the point shared by both parts', () => {
    expect(splitRoute(route, 1)).toEqual({ travelled: ['a', 'b'], ahead: ['b', 'c', 'd'] });
  });

  it('clamps progress past the end instead of losing the line', () => {
    expect(splitRoute(route, 9)).toEqual({ travelled: route, ahead: ['d'] });
  });
});
