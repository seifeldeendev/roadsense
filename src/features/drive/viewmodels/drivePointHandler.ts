import { router } from 'expo-router';
import type { TripPoint, UpcomingAlert } from '@/domain/entities';
import { alertFeedback } from '@/domain/usecases/drive/alertFeedback';
import { findUpcomingAlerts } from '@/domain/usecases/drive/findUpcomingAlerts';
import { shouldTriggerSpeedAlarm } from '@/domain/usecases/drive/speedAlarm';
import { useDriveStore } from '@/stores/useDriveStore';
import { useHazardStore } from '@/stores/useHazardStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { announce } from './driveModeHelpers';

// Builds the per-reading handler for a drive (GPS or demo): records the point,
// fires the speed alarm on a crossing, and raises the next alert ahead.
export function createDrivePointHandler(onNextAlert: (alert: UpcomingAlert | null) => void) {
  let previousSpeedKmh = 0;
  return (point: TripPoint): void => {
    useDriveStore.getState().pushPoint(point);
    const settings = useSettingsStore.getState();
    if (shouldTriggerSpeedAlarm(previousSpeedKmh, point.speedKmh, settings.speedAlarmKmh)) {
      announce(
        alertFeedback(settings.soundMode, settings.voiceEnabled, 'camera'),
        `Speed alarm, ${settings.speedAlarmKmh} kilometres per hour`,
      );
    }
    previousSpeedKmh = point.speedKmh;

    const { cameras, hazards } = useHazardStore.getState();
    const nearest = findUpcomingAlerts(point, point.heading, cameras, hazards, settings)[0] ?? null;
    onNextAlert(nearest);
    const drive = useDriveStore.getState();
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
