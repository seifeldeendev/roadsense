import { describe, expect, it } from '@jest/globals';
import { getAlertsAlongRoute } from '../src/domain/usecases/routes/getAlertsAlongRoute';
import { MOCK_CAMERAS } from '../src/data/mock/cameras';
import { MOCK_HAZARDS } from '../src/data/mock/hazards';
import { MOCK_ROUTES, MOCK_DESTINATIONS } from '../src/data/mock/routes';

describe('mock route fixtures', () => {
  it('covers every destination with 60 to 120 interpolated points', () => {
    expect(MOCK_DESTINATIONS).toHaveLength(5);
    for (const destination of MOCK_DESTINATIONS) {
      const route = MOCK_ROUTES[destination.id];
      expect(route).toBeDefined();
      expect(route.points.length).toBeGreaterThanOrEqual(60);
      expect(route.points.length).toBeLessThanOrEqual(120);
      expect(route.destinationId).toBe(destination.id);
      expect(route.durationS).toBeGreaterThan(0);
    }
  });

  it('sends at least two routes within 50 m of a camera or hazard', () => {
    const hitsPerRoute = MOCK_DESTINATIONS.map((destination) =>
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
