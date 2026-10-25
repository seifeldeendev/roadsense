import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import type { HazardType, UpcomingAlert } from '@/domain/entities';
import { alertFeedback } from '@/domain/usecases/drive/alertFeedback';
import { findUpcomingAlerts } from '@/domain/usecases/drive/findUpcomingAlerts';
import { getSpeedStatus, type SpeedStatus } from '@/domain/usecases/drive/getSpeedStatus';
import { shouldTriggerSpeedAlarm } from '@/domain/usecases/drive/speedAlarm';
import type { LocationSource } from '@/domain/repositories';
import { createDemoLocationSource } from '@/services/location';
import { useDriveStore } from '@/stores/useDriveStore';
import { useHazardStore } from '@/stores/useHazardStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { hazardMeta } from '@/theme/tokens';
import { announce, clockHHMM, statusMessage, useTransientFeedback } from './driveModeHelpers';

const REPORT_TYPES: HazardType[] = ['accident', 'pothole', 'checkpoint', 'flooding'];

export type DriveModeViewModel = {
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  isDriving: boolean;
  speedKmh: number;
  hasLimit: boolean;
  limitKmh: number;
  status: SpeedStatus;
  statusLabel: string;
  nextAlert: UpcomingAlert | null;
  reportTypes: HazardType[];
  feedback: string | null;
  start: () => void;
  stop: () => void;
  onReport: (type: HazardType) => void;
  openSettings: () => void;
};

export function useDriveModeViewModel(): DriveModeViewModel {
  const isLoading = useHazardStore((s) => s.isLoading);
  const error = useHazardStore((s) => s.error);
  const load = useHazardStore((s) => s.load);
  const isDriving = useDriveStore((s) => s.isDriving);
  const speedKmhRaw = useDriveStore((s) => s.speedKmh);
  const limitKmhRaw = useDriveStore((s) => s.limitKmh);
  const amberThresholdPct = useSettingsStore((s) => s.amberThresholdPct);
  const [nextAlert, setNextAlert] = useState<UpcomingAlert | null>(null);
  const [feedback, showFeedback] = useTransientFeedback();
  const sourceRef = useRef<LocationSource | null>(null);
  const previousSpeedRef = useRef(0);

  useEffect(() => {
    void load();
    return () => {
      sourceRef.current?.stop();
      sourceRef.current = null;
    };
  }, [load]);

  const speedKmh = Math.round(speedKmhRaw);
  const status = getSpeedStatus(speedKmh, limitKmhRaw, amberThresholdPct);

  const start = useCallback(() => {
    useDriveStore.getState().startDrive();
    previousSpeedRef.current = 0;
    const source = createDemoLocationSource();
    sourceRef.current = source;
    source.start((point) => {
      useDriveStore.getState().pushPoint(point);
      const settings = useSettingsStore.getState();
      if (shouldTriggerSpeedAlarm(previousSpeedRef.current, point.speedKmh, settings.speedAlarmKmh)) {
        announce(
          alertFeedback(settings.soundMode, settings.voiceEnabled, 'camera'),
          `Speed alarm, ${settings.speedAlarmKmh} kilometres per hour`,
        );
      }
      previousSpeedRef.current = point.speedKmh;
      const hazardState = useHazardStore.getState();
      const results = findUpcomingAlerts(
        { lat: point.lat, lng: point.lng },
        point.heading,
        hazardState.cameras,
        hazardState.hazards,
        settings,
      );
      const nearest = results[0] ?? null;
      setNextAlert(nearest);
      const drive = useDriveStore.getState();
      const isNew =
        nearest !== null &&
        drive.activeAlert?.refId !== nearest.refId &&
        !drive.dismissedAlertIds.includes(nearest.refId);
      if (nearest !== null && isNew) {
        const overlayOpen = drive.activeAlert !== null;
        drive.setActiveAlert(nearest);
        announce(
          alertFeedback(settings.soundMode, settings.voiceEnabled, nearest.kind),
          `${nearest.title} in ${Math.max(1, Math.round(nearest.distanceM))} metres`,
        );
        // An open overlay re-renders with the new alert instead of stacking another modal.
        if (!overlayOpen) router.push('/alert');
      }
    });
  }, []);

  const stop = useCallback(() => {
    sourceRef.current?.stop();
    sourceRef.current = null;
    useDriveStore.getState().stopDrive();
    setNextAlert(null);
  }, []);

  const onReport = useCallback(
    (type: HazardType) => {
      const drive = useDriveStore.getState();
      if (!drive.isDriving || drive.position === null) {
        showFeedback('Start a drive to report hazards');
        return;
      }
      useHazardStore
        .getState()
        .report(type, drive.position.lat, drive.position.lng, drive.heading)
        .then(() => {
          showFeedback(`${hazardMeta[type].label} reported at ${clockHHMM(new Date())}`);
        })
        .catch(() => {
          showFeedback("Couldn't send report — try again");
        });
    },
    [showFeedback],
  );

  const openSettings = useCallback(() => {
    router.push('/settings/alerts');
  }, []);

  return {
    isLoading,
    error,
    retry: load,
    isDriving,
    speedKmh,
    hasLimit: isDriving && limitKmhRaw > 0,
    limitKmh: limitKmhRaw,
    status,
    statusLabel: statusMessage(status, speedKmh, limitKmhRaw),
    nextAlert,
    reportTypes: REPORT_TYPES,
    feedback,
    start,
    stop,
    onReport,
    openSettings,
  };
}
