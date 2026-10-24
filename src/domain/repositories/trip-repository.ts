import type { Trip } from '../entities';

export interface TripRepository {
  list(): Promise<Trip[]>;
  getById(id: string): Promise<Trip | undefined>;
}
