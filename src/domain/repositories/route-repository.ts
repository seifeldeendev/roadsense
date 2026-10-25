import type { Destination, LatLng, PlannedRoute } from '../entities';

export interface RouteRepository {
  getDestinations(): Promise<Destination[]>;
  getRoute(destination: Destination, from: LatLng): Promise<PlannedRoute>;
}
