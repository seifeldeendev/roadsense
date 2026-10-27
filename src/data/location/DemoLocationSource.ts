import type { LatLng, TripPoint } from '../../domain/entities';
import type { DemoPlayback, LocationSource, Unsubscribe } from '../../domain/repositories';
import { simulateDrive } from '../../domain/usecases/routes/simulateDrive';
import { DEMO_TRIP } from '../mock/trips';

// The Salah Salem demo drive path, reused by the route line and map framing.
export const DEMO_ROUTE: LatLng[] = DEMO_TRIP.points.map((point) => ({ lat: point.lat, lng: point.lng }));

// Plays recorded trip points back one per interval, like a GPS would deliver them.
export class MockLocationSource implements LocationSource {
  private timer: ReturnType<typeof setInterval> | null = null;
  private onPoint: ((p: TripPoint) => void) | null = null;
  private nextIndex = 0;

  constructor(
    private readonly points: readonly TripPoint[],
    private readonly intervalMs: number = 1000,
  ) {}

  getCurrent(): Promise<LatLng | null> {
    const first = this.points[0];
    return Promise.resolve(first === undefined ? null : { lat: first.lat, lng: first.lng });
  }

  watch(onPoint: (p: TripPoint) => void): Unsubscribe {
    this.onPoint = onPoint;
    this.nextIndex = 0;
    this.schedule();
    return () => this.stop();
  }

  private stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.onPoint = null;
  }

  private schedule(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(this.tick, this.intervalMs);
  }

  private tick = (): void => {
    if (!this.onPoint) return;
    if (this.nextIndex >= this.points.length) {
      this.stop();
      return;
    }
    this.onPoint(this.points[this.nextIndex]);
    this.nextIndex += 1;
    if (this.nextIndex >= this.points.length) {
      this.stop();
    }
  };
}

export function createDemoLocationSource(
  playback: DemoPlayback,
  limitFor: (position: LatLng) => number = () => 0,
): LocationSource {
  const points =
    playback.kind === 'replay'
      ? playback.points
      : playback.kind === 'planned'
        ? simulateDrive(playback.route, Date.now(), limitFor)
        : DEMO_TRIP.points;
  return new MockLocationSource(points);
}
