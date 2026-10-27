import { afterEach, describe, expect, it, jest } from '@jest/globals';
import type { Destination, PlannedRoute } from '@/domain/entities';
import type { RouteRepository } from '@/domain/repositories';
import { OsrmRouteRepository } from '@/data/osrm/OsrmRouteRepository';

const DESTINATION: Destination = { id: 'dest-x', name: 'X', area: '', lat: 30.3, lng: 31.6 };
const FROM = { lat: 30.2, lng: 31.5 };

const FALLBACK_ROUTE: PlannedRoute = {
  destinationId: 'dest-x',
  points: [FROM, { lat: 30.25, lng: 31.55 }, { lat: DESTINATION.lat, lng: DESTINATION.lng }],
  distanceM: 15000,
  durationS: 1200,
};

const fallback = (): RouteRepository => ({
  getDestinations: jest.fn(async () => [DESTINATION]),
  getRoute: jest.fn(async () => FALLBACK_ROUTE),
});

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

function respondWith(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  globalThis.fetch = jest.fn(async () => ({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  })) as unknown as typeof fetch;
}

describe('OsrmRouteRepository', () => {
  it('maps a successful OSRM route (GeoJSON is [lng, lat]) and does not mark it estimated', async () => {
    respondWith({
      code: 'Ok',
      routes: [{ distance: 1234.6, duration: 98.4, geometry: { coordinates: [[31.5, 30.2], [31.6, 30.3]] } }],
    });
    const repo = new OsrmRouteRepository(fallback());
    const route = await repo.getRoute(DESTINATION, FROM);
    expect(route).toEqual({
      destinationId: 'dest-x',
      points: [
        { lat: 30.2, lng: 31.5 },
        { lat: 30.3, lng: 31.6 },
      ],
      distanceM: 1235,
      durationS: 98,
    });
    expect(String((globalThis.fetch as jest.Mock).mock.calls[0][0])).toContain('31.5,30.2;31.6,30.3');
  });

  it('falls back to an estimated route when the network fails', async () => {
    globalThis.fetch = jest.fn(async () => Promise.reject(new Error('offline'))) as unknown as typeof fetch;
    const backup = fallback();
    const route = await new OsrmRouteRepository(backup).getRoute(DESTINATION, FROM);
    expect(route).toEqual({ ...FALLBACK_ROUTE, estimated: true });
    expect(backup.getRoute).toHaveBeenCalledWith(DESTINATION, FROM);
  });

  it('falls back when the server answers with an error status', async () => {
    respondWith({}, { ok: false, status: 503 });
    const route = await new OsrmRouteRepository(fallback()).getRoute(DESTINATION, FROM);
    expect(route.estimated).toBe(true);
  });

  it.each([
    ['no routes', { code: 'Ok', routes: [] }],
    ['a non-Ok code', { code: 'NoRoute', routes: [{ distance: 1, duration: 1, geometry: { coordinates: [[1, 2], [3, 4]] } }] }],
    ['a one-point geometry', { code: 'Ok', routes: [{ distance: 1, duration: 1, geometry: { coordinates: [[1, 2]] } }] }],
  ])('falls back on a malformed response: %s', async (_label, body) => {
    respondWith(body);
    const route = await new OsrmRouteRepository(fallback()).getRoute(DESTINATION, FROM);
    expect(route).toEqual({ ...FALLBACK_ROUTE, estimated: true });
  });

  it('falls back when the body is not JSON', async () => {
    globalThis.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => Promise.reject(new SyntaxError('Unexpected token <')),
    })) as unknown as typeof fetch;
    const route = await new OsrmRouteRepository(fallback()).getRoute(DESTINATION, FROM);
    expect(route.estimated).toBe(true);
  });

  it('takes destinations from the fallback', async () => {
    expect(await new OsrmRouteRepository(fallback()).getDestinations()).toEqual([DESTINATION]);
  });
});
