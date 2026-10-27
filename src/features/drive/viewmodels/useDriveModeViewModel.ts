import { useCallback, useEffect, useRef, useState } from 'react';
import type { HazardType, LocationSourceKind, UpcomingAlert } from '@/domain/entities';
import { getSpeedStatus, type SpeedStatus } from '@/domain/usecases/drive/getSpeedStatus';
import type { Unsubscribe } from '@/domain/repositories';
import { useDriveStore } from '@/stores/useDriveStore';
import { useDependencies, useStores } from '@/stores/DependenciesProvider';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { hazardMeta } from '@/theme/tokens';
import { clockHHMM, statusMessage, useTransientFeedback } from './driveModeHelpers';
import { createDrivePointHandler, createSpeedLimitLookup, currentDrivePosition } from './drivePointHandler';

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
  const { useHazardStore, useNavigationStore } = useStores();
  const { location } = useDependencies();
  const isLoading = useHazardStore((s) => s.isLoading);
  const error = useHazardStore((s) => s.error);
  const load = useHazardStore((s) => s.load);
  const report = useHazardStore((s) => s.report);
  const isDriving = useDriveStore((s) => s.isDriving);
  const speedKmhRaw = useDriveStore((s) => s.speedKmh);
  const limitKmhRaw = useDriveStore((s) => s.limitKmh);
  const startDrive = useDriveStore((s) => s.startDrive);
  const stopDrive = useDriveStore((s) => s.stopDrive);
  const locationSource = useSettingsStore((s) => s.locationSource);
  const amberThresholdPct = useSettingsStore((s) => s.amberThresholdPct);
  const hasQueuedReplay = useNavigationStore((s) => s.pendingRoutePoints !== null);
  const takeDemoPlayback = useNavigationStore((s) => s.takeDemoPlayback);
  const [nextAlert, setNextAlert] = useState<UpcomingAlert | null>(null);
  const [feedback, showFeedback] = useTransientFeedback();
  const unwatchRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    void load();
    return () => {
      unwatchRef.current?.();
      unwatchRef.current = null;
    };
  }, [load]);

  const speedKmh = Math.round(speedKmhRaw);
  const status = getSpeedStatus(speedKmh, limitKmhRaw, amberThresholdPct);

  const start = useCallback(() => {
    void (async () => {
      // A queued trip replay always plays through the demo source.
      let kind: LocationSourceKind = locationSource === 'gps' && !hasQueuedReplay ? 'gps' : 'demo';
      if (kind === 'gps' && !(await location.requestPermission())) {
        kind = 'demo';
        showFeedback('Location is off — playing the demo drive instead');
      }
      startDrive(kind);
      const limitFor = createSpeedLimitLookup(useHazardStore);
      const source = kind === 'gps' ? location.device(limitFor) : location.demo(takeDemoPlayback(), limitFor);
      unwatchRef.current = source.watch(
        createDrivePointHandler({ drive: useDriveStore, settings: useSettingsStore, hazards: useHazardStore }, setNextAlert),
      );
    })();
  }, [showFeedback, locationSource, hasQueuedReplay, startDrive, location, takeDemoPlayback, useHazardStore]);

  const stop = useCallback(() => {
    unwatchRef.current?.();
    unwatchRef.current = null;
    stopDrive();
    setNextAlert(null);
  }, [stopDrive]);

  const onReport = useCallback(
    (type: HazardType) => {
      const here = currentDrivePosition(useDriveStore);
      if (here === null) {
        showFeedback('Start a drive to report hazards');
        return;
      }
      report(type, here.position.lat, here.position.lng, here.heading)
        .then(() => {
          showFeedback(`${hazardMeta[type].label} reported at ${clockHHMM(new Date())}`);
        })
        .catch(() => {
          showFeedback("Couldn't send report — try again");
        });
    },
    [report, showFeedback],
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
