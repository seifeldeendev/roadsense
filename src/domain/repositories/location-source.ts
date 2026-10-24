import type { TripPoint } from '../entities';

export interface LocationSource {
  start(onPoint: (p: TripPoint) => void): void;
  stop(): void;
}
