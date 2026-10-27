import { create } from 'zustand';
import type { LatLng, TripPoint, UpcomingAlert } from '../domain/entities';

interface DriveState {
  isDriving: boolean;
  position: LatLng | null;
  speedKmh: number;
  limitKmh: number;
  heading: number;
  activeAlert: UpcomingAlert | null;
  dismissedAlertIds: string[];
  overLimitCount: number;
  startDrive(): void;
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
  startDrive: () =>
    set({
      isDriving: true,
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
      speedKmh: p.speedKmh,
      limitKmh: p.limitKmh,
      heading: p.heading,
      overLimitCount:
        p.speedKmh > p.limitKmh ? state.overLimitCount + 1 : state.overLimitCount,
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
