import type { Destination, LatLng, PlannedRoute } from '../../domain/entities';
import type { RouteRepository } from '../../domain/repositories';

// Public OSRM demo server: road-following driving routes without an API key.
// Meant for light use; the mock repository is the fallback when it is unreachable.
const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';
const TIMEOUT_MS = 8000;

type OsrmResponse = {
  code: string;
  routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[];
};

export class OsrmRouteRepository implements RouteRepository {
  constructor(private readonly fallback: RouteRepository) {}

  getDestinations(): Promise<Destination[]> {
    return this.fallback.getDestinations();
  }

  async getRoute(destination: Destination, from: LatLng): Promise<PlannedRoute> {
    try {
      return await this.fetchRoute(destination, from);
    } catch {
      // Offline or unreachable: the fallback is only an approximation of the roads.
      return { ...(await this.fallback.getRoute(destination, from)), estimated: true };
    }
  }

  private async fetchRoute(destination: Destination, from: LatLng): Promise<PlannedRoute> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const coords = `${from.lng},${from.lat};${destination.lng},${destination.lat}`;
      const response = await fetch(`${OSRM_URL}/${coords}?overview=full&geometries=geojson`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Routing failed (${response.status})`);
      const body = (await response.json()) as OsrmResponse;
      const best = body.routes?.[0];
      if (body.code !== 'Ok' || best === undefined || best.geometry.coordinates.length < 2) {
        throw new Error('No route found');
      }
      return {
        destinationId: destination.id,
        // GeoJSON order is [longitude, latitude].
        points: best.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
        distanceM: Math.round(best.distance),
        durationS: Math.round(best.duration),
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
