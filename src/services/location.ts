import type { TripPoint } from '../domain/entities';
import type { LocationSource } from '../domain/repositories';
import { DEMO_TRIP } from '../data/mock/trips';

export class MockLocationSource implements LocationSource {
  private timer: ReturnType<typeof setInterval> | null = null;
  private onPoint: ((p: TripPoint) => void) | null = null;
  private nextIndex = 0;

  constructor(
    private readonly points: readonly TripPoint[],
    private readonly intervalMs: number = 1000,
    private rate: number = 1,
  ) {}

  start(onPoint: (p: TripPoint) => void): void {
    this.onPoint = onPoint;
    this.nextIndex = 0;
    this.schedule();
  }

  setRate(rate: number): void {
    this.rate = rate;
    if (this.timer !== null) this.schedule();
  }

  stop(): void {
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
    this.timer = setInterval(this.tick, this.intervalMs / this.rate);
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

let currentRate = 1;
let demoSource: MockLocationSource | null = null;

export function setRate(rate: number): void {
  currentRate = rate;
  demoSource?.setRate(rate);
}

export function createDemoLocationSource(): LocationSource {
  demoSource = new MockLocationSource(DEMO_TRIP.points, 1000, currentRate);
  return demoSource;
}
