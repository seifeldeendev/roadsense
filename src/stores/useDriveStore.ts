import { create } from 'zustand';
import type { LatLng, LocationSourceKind, TripPoint, UpcomingAlert } from '../domain/entities';

export interface DriveState {
  isDriving: boolean;
  position: LatLng | null;
  speedKmh: number;
  limitKmh: number;
  heading: number;
  activeAlert: UpcomingAlert | null;
  dismissedAlertIds: string[];
  overLimitCount: number;
  // Last known real position, also available before a drive starts.
  currentLocation: LatLng | null;
  driveSource: LocationSourceKind | null;
  // When the drive started and when its last reading arrived (ms since epoch,
  // the phone's clock), so a feed that stops can be told apart from a live one.
  drivingSince: number | null;
  lastReadingAt: number | null;
  // Where the drive started, when known: stands in for the car until its first reading.
  drivingFrom: LatLng | null;
  // The location source reported that it failed; null while it works.
  locationError: string | null;
  setLocationError(reason: string | null): void;
  setCurrentLocation(location: LatLng | null): void;
  startDrive(source?: LocationSourceKind, from?: LatLng | null): void;
  stopDrive(): void;
  pushPoint(p: TripPoint): void;
  setActiveAlert(a: UpcomingAlert | null): void;
  dismissAlert(id: string): void;
}

export function createDriveStore() {
  return create<DriveState>()((set) => ({
    isDriving: false,
    position: null,
    speedKmh: 0,
    limitKmh: 0,
    heading: 0,
    activeAlert: null,
    dismissedAlertIds: [],
    overLimitCount: 0,
    currentLocation: null,
    driveSource: null,
    drivingSince: null,
    lastReadingAt: null,
    drivingFrom: null,
    locationError: null,
    setLocationError: (locationError) => set({ locationError }),
    setCurrentLocation: (currentLocation) => set({ currentLocation }),
    startDrive: (source = 'demo', from = null) =>
      set({
        isDriving: true,
        driveSource: source,
        drivingSince: Date.now(),
        lastReadingAt: null,
        drivingFrom: from,
        locationError: null,
        position: null,
        speedKmh: 0,
        limitKmh: 0,
        heading: 0,
        activeAlert: null,
        dismissedAlertIds: [],
        overLimitCount: 0,
      }),
    stopDrive: () => set({ isDriving: false, activeAlert: null, drivingSince: null, lastReadingAt: null, locationError: null }),
    pushPoint: (p) =>
      set((state) => ({
        position: { lat: p.lat, lng: p.lng },
        lastReadingAt: Date.now(),
        currentLocation: state.driveSource === 'gps' ? { lat: p.lat, lng: p.lng } : state.currentLocation,
        speedKmh: p.speedKmh,
        limitKmh: p.limitKmh,
        heading: p.heading,
        overLimitCount:
          p.limitKmh > 0 && p.speedKmh > p.limitKmh ? state.overLimitCount + 1 : state.overLimitCount,
      })),
    setActiveAlert: (activeAlert) => set({ activeAlert }),
    dismissAlert: (id) =>
      set((state) => ({
        activeAlert: state.activeAlert?.refId === id ? null : state.activeAlert,
        dismissedAlertIds: state.dismissedAlertIds.includes(id)
          ? state.dismissedAlertIds
          : [...state.dismissedAlertIds, id],
      })),
  }));
}
