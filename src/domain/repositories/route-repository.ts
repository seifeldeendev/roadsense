import type { Destination, PlannedRoute } from '../entities';

export interface RouteRepository {
  getDestinations(): Promise<Destination[]>;
  getRoute(destinationId: string): Promise<PlannedRoute>;
}
