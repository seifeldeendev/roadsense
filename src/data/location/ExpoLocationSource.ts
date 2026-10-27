import * as Location from 'expo-location';
import type { LatLng, TripPoint } from '../../domain/entities';
import type { LocationSource, Unsubscribe } from '../../domain/repositories';
import { bearingDeg, haversineDistanceM } from '../../domain/usecases/drive/geo';
import { getCurrentLocation } from '../../services/gps';

// Below this movement the computed bearing is GPS noise, so the last heading is kept.
const MIN_MOVE_FOR_HEADING_M = 3;

// Streams the phone's real position as trip points. The device knows nothing
// about speed limits, so the caller supplies them for each position.
export class ExpoLocationSource implements LocationSource {
  private subscription: Location.LocationSubscription | null = null;
  private stopped = false;
  private previous: TripPoint | null = null;

  constructor(private readonly limitFor: (position: LatLng) => number) {}

  getCurrent(): Promise<LatLng | null> {
    return getCurrentLocation();
  }

  watch(onPoint: (p: TripPoint) => void): Unsubscribe {
    this.stopped = false;
    this.previous = null;
    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 0 },
      (location) => {
        const point = this.toTripPoint(location);
        this.previous = point;
        onPoint(point);
      },
    )
      .then((subscription) => {
        // The watch may have been cancelled while it was still starting.
        if (this.stopped) subscription.remove();
        else this.subscription = subscription;
      })
      .catch(() => undefined);
    return () => this.stop();
  }

  private stop(): void {
    this.stopped = true;
    this.subscription?.remove();
    this.subscription = null;
  }

  private toTripPoint(location: Location.LocationObject): TripPoint {
    const position = { lat: location.coords.latitude, lng: location.coords.longitude };
    const previous = this.previous;
    const movedM = previous === null ? 0 : haversineDistanceM(previous, position);
    const reportedSpeed = location.coords.speed;
    const elapsedS = previous === null ? 0 : (location.timestamp - previous.ts) / 1000;
    // Some devices report no speed or heading; derive them from the last fix.
    const speedMs =
      reportedSpeed !== null && reportedSpeed >= 0 ? reportedSpeed : elapsedS > 0 ? movedM / elapsedS : 0;
    const reportedHeading = location.coords.heading;
    const heading =
      reportedHeading !== null && reportedHeading >= 0 && speedMs > 0.5
        ? reportedHeading
        : previous !== null && movedM >= MIN_MOVE_FOR_HEADING_M
          ? bearingDeg(previous, position)
          : (previous?.heading ?? 0);
    return {
      ...position,
      ts: location.timestamp,
      speedKmh: Math.round(speedMs * 3.6 * 10) / 10,
      heading: Math.round(heading),
      limitKmh: this.limitFor(position),
    };
  }
}
