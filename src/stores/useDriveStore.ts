import { create } from 'zustand';
import type { LatLng, LocationSourceKind, TripPoint, UpcomingAlert } from '../domain/entities';

interface DriveState {
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
  setCurrentLocation(location: LatLng | null): void;
  startDrive(source?: LocationSourceKind): void;
  stopDrive(): void;
  pushPoint(p: TripPoint): void;
  setActiveAlert(a: UpcomingAlert | null): void;
  dismissAlert(id: string): void;
}

export const useDriveStore = create<DriveState>()((set) => ({
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
  setCurrentLocation: (currentLocation) => set({ currentLocation }),
  startDrive: (source = 'demo') =>
    set({
      isDriving: true,
      driveSource: source,
      position: null,
      speedKmh: 0,
      limitKmh: 0,
      heading: 0,
      activeAlert: null,
      dismissedAlertIds: [],
      overLimitCount: 0,
    }),
  stopDrive: () => set({ isDriving: false, activeAlert: null }),
  pushPoint: (p) =>
    set((state) => ({
      position: { lat: p.lat, lng: p.lng },
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
