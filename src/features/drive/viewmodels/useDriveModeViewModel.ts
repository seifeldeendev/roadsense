import { useCallback, useEffect, useRef, useState } from 'react';
import type { HazardType, LocationSourceKind, UpcomingAlert } from '@/domain/entities';
import { getSpeedStatus, type SpeedStatus } from '@/domain/usecases/drive/getSpeedStatus';
import { nearestSpeedLimit } from '@/domain/usecases/drive/nearestRoadName';
import type { LocationSource } from '@/domain/repositories';
import { GpsLocationSource, requestLocationPermission } from '@/services/gps';
import { createDemoLocationSource, hasQueuedReplay } from '@/services/location';
import { useDriveStore } from '@/stores/useDriveStore';
import { useHazardStore } from '@/stores/useHazardStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { hazardMeta } from '@/theme/tokens';
import { clockHHMM, statusMessage, useTransientFeedback } from './driveModeHelpers';
import { createDrivePointHandler } from './drivePointHandler';

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
    void (async () => {
      const settings = useSettingsStore.getState();
      // A queued trip replay always plays through the demo source.
      let kind: LocationSourceKind = settings.locationSource === 'gps' && !hasQueuedReplay() ? 'gps' : 'demo';
      if (kind === 'gps' && !(await requestLocationPermission())) {
        kind = 'demo';
        showFeedback('Location is off — playing the demo drive instead');
      }
      useDriveStore.getState().startDrive(kind);
      const source =
        kind === 'gps'
          ? new GpsLocationSource((position) => nearestSpeedLimit(position, useHazardStore.getState().cameras))
          : createDemoLocationSource();
      sourceRef.current = source;
      source.start(createDrivePointHandler(setNextAlert));
    })();
  }, [showFeedback]);

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
  };
}
