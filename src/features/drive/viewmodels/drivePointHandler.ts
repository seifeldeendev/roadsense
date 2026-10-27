import { router } from 'expo-router';
import type { StoreApi } from 'zustand';
import type { LatLng, TripPoint, UpcomingAlert } from '@/domain/entities';
import { alertFeedback } from '@/domain/usecases/drive/alertFeedback';
import { findUpcomingAlerts } from '@/domain/usecases/drive/findUpcomingAlerts';
import { nearestSpeedLimit } from '@/domain/usecases/drive/nearestRoadName';
import { shouldTriggerSpeedAlarm } from '@/domain/usecases/drive/speedAlarm';
import type { DriveState } from '@/stores/useDriveStore';
import type { HazardState } from '@/stores/useHazardStore';
import type { SettingsState } from '@/stores/useSettingsStore';
import { announce } from './driveModeHelpers';

type Readable<T> = Pick<StoreApi<T>, 'getState'>;

// A drive outlives any one render, so it reads the stores it is handed for the
// latest state at each reading instead of capturing hook values.
export type DriveStores = {
  drive: Readable<DriveState>;
  settings: Readable<SettingsState>;
  hazards: Readable<HazardState>;
};

// Where the car is at this instant (null when not driving). Read from the store
// rather than the last render, so a report is pinned to the latest reading.
export function currentDrivePosition(drive: Readable<DriveState>): { position: LatLng; heading: number } | null {
  const { isDriving, position, heading } = drive.getState();
  return isDriving && position !== null ? { position, heading } : null;
}

// The speed limit at a position, from the cameras known at that moment.
export function createSpeedLimitLookup(hazards: Readable<HazardState>): (position: LatLng) => number {
  return (position) => nearestSpeedLimit(position, hazards.getState().cameras);
}

// Builds the per-reading handler for a drive (GPS or demo): records the point,
// fires the speed alarm on a crossing, and raises the next alert ahead.
export function createDrivePointHandler(stores: DriveStores, onNextAlert: (alert: UpcomingAlert | null) => void) {
  let previousSpeedKmh = 0;
  return (point: TripPoint): void => {
    stores.drive.getState().pushPoint(point);
    const settings = stores.settings.getState();
    if (shouldTriggerSpeedAlarm(previousSpeedKmh, point.speedKmh, settings.speedAlarmKmh)) {
      announce(
        alertFeedback(settings.soundMode, settings.voiceEnabled, 'camera'),
        `Speed alarm, ${settings.speedAlarmKmh} kilometres per hour`,
      );
    }
    previousSpeedKmh = point.speedKmh;

    const { cameras, hazards } = stores.hazards.getState();
    const nearest = findUpcomingAlerts(point, point.heading, cameras, hazards, settings)[0] ?? null;
    onNextAlert(nearest);
    const drive = stores.drive.getState();
    const isNew =
      nearest !== null &&
      drive.activeAlert?.refId !== nearest.refId &&
      !drive.dismissedAlertIds.includes(nearest.refId);
    if (nearest === null || !isNew) return;

    const overlayOpen = drive.activeAlert !== null;
    drive.setActiveAlert(nearest);
    announce(
      alertFeedback(settings.soundMode, settings.voiceEnabled, nearest.kind),
      `${nearest.title} in ${Math.max(1, Math.round(nearest.distanceM))} metres`,
    );
    // An open overlay re-renders with the new alert instead of stacking another modal.
    if (!overlayOpen) router.push('/alert');
  };
}
