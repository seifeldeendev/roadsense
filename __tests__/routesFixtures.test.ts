import { describe, expect, it } from '@jest/globals';
import { getAlertsAlongRoute } from '../src/domain/usecases/routes/getAlertsAlongRoute';
import { MOCK_CAMERAS } from '../src/data/mock/cameras';
import { MOCK_HAZARDS } from '../src/data/mock/hazards';
import { MOCK_ROUTES, MOCK_DESTINATIONS } from '../src/data/mock/routes';

describe('mock route fixtures', () => {
  // Only the first destinations have hand-made road routes; the rest are routed live.
  const handMade = MOCK_DESTINATIONS.filter((destination) => MOCK_ROUTES[destination.id] !== undefined);

  it('gives each hand-made route 60 to 120 interpolated points', () => {
    expect(handMade).toHaveLength(5);
    expect(MOCK_DESTINATIONS.length).toBeGreaterThan(handMade.length);
    for (const destination of handMade) {
      const route = MOCK_ROUTES[destination.id];
      expect(route).toBeDefined();
      expect(route.points.length).toBeGreaterThanOrEqual(60);
      expect(route.points.length).toBeLessThanOrEqual(120);
      expect(route.destinationId).toBe(destination.id);
      expect(route.durationS).toBeGreaterThan(0);
    }
  });

  it('sends at least two routes within 50 m of a camera or hazard', () => {
    const hitsPerRoute = handMade.map((destination) =>
      getAlertsAlongRoute(MOCK_ROUTES[destination.id].points, MOCK_CAMERAS, MOCK_HAZARDS, 50),
    );
    expect(hitsPerRoute.flat().length).toBeGreaterThanOrEqual(2);
    expect(hitsPerRoute.filter((alerts) => alerts.length > 0).length).toBeGreaterThanOrEqual(2);
  });

  it('keeps every route aware of which alerts lie along it in order', () => {
    const cityStars = getAlertsAlongRoute(
      MOCK_ROUTES['dest-city-stars'].points,
      MOCK_CAMERAS,
      MOCK_HAZARDS,
      50,
    );
    expect(cityStars.length).toBeGreaterThan(0);
    for (let i = 1; i < cityStars.length; i += 1) {
      expect(cityStars[i].distanceAlongM).toBeGreaterThanOrEqual(
        cityStars[i - 1].distanceAlongM,
      );
    }
  });
});
