import { useCallback, useEffect, useRef, useState } from 'react';
import type { HazardType, LatLng, LocationSourceKind, UpcomingAlert } from '@/domain/entities';
import { DRIVE_LOOKUP_RADIUS_M } from '@/domain/usecases/cameras/cameraRadii';
import { driveCoverage } from '@/domain/usecases/cameras/workingSet';
import { alertFeedback } from '@/domain/usecases/drive/alertFeedback';
import { getSpeedStatus, type SpeedStatus } from '@/domain/usecases/drive/getSpeedStatus';
import type { Unsubscribe } from '@/domain/repositories';
import { useDriveStore } from '@/stores/useDriveStore';
import { useDependencies, useStores } from '@/stores/DependenciesProvider';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { hazardMeta } from '@/theme/tokens';
import { announce, clockHHMM, statusMessage, useTransientFeedback } from './driveModeHelpers';
import {
  createDrivePointHandler,
  createRouteSpeedLimitLookup,
  createSpeedLimitLookup,
  currentDrivePosition,
} from './drivePointHandler';

const REPORT_TYPES: HazardType[] = ['accident', 'pothole', 'checkpoint', 'flooding'];

// Shown and spoken while driving without the cameras around the car.
export const CAMERAS_UNAVAILABLE_MESSAGE = 'Camera alerts unavailable — retrying';

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
  // Set while a drive has no cameras to alert on because they could not be loaded.
  cameraWarning: string | null;
  start: () => void;
  stop: () => void;
  onReport: (type: HazardType) => void;
};

export function useDriveModeViewModel(): DriveModeViewModel {
  const { useCameraStore, useHazardStore, useNavigationStore } = useStores();
  const { location } = useDependencies();
  const hazardsLoading = useHazardStore((s) => s.isLoading);
  const prepareDrive = useCameraStore((s) => s.prepareDrive);
  const findInBounds = useCameraStore((s) => s.findInBounds);
  // The Drive tab waits for the first working set, as it waited for every camera.
  const awaitingCameras = useCameraStore((s) => s.workingSet === null && !s.fetchFailed);
  const coverage = useCameraStore((s) => driveCoverage(s.workingSet, s.followed, s.fetchFailed, DRIVE_LOOKUP_RADIUS_M));
  const error = useHazardStore((s) => s.error);
  const load = useHazardStore((s) => s.load);
  const report = useHazardStore((s) => s.report);
  const isDriving = useDriveStore((s) => s.isDriving);
  const speedKmhRaw = useDriveStore((s) => s.speedKmh);
  const limitKmhRaw = useDriveStore((s) => s.limitKmh);
  const startDrive = useDriveStore((s) => s.startDrive);
  const stopDrive = useDriveStore((s) => s.stopDrive);
  const currentLocation = useDriveStore((s) => s.currentLocation);
  const locationSource = useSettingsStore((s) => s.locationSource);
  const soundMode = useSettingsStore((s) => s.soundMode);
  const voiceEnabled = useSettingsStore((s) => s.voiceEnabled);
  const amberThresholdPct = useSettingsStore((s) => s.amberThresholdPct);
  const hasQueuedReplay = useNavigationStore((s) => s.pendingRoutePoints !== null);
  const takeDemoPlayback = useNavigationStore((s) => s.takeDemoPlayback);
  const [nextAlert, setNextAlert] = useState<UpcomingAlert | null>(null);
  const [feedback, showFeedback] = useTransientFeedback();
  const unwatchRef = useRef<Unsubscribe | null>(null);
  // Start awaits the cameras around the start; a second tap meanwhile is ignored.
  const startingRef = useRef(false);

  useEffect(() => {
    void load();
    return () => {
      unwatchRef.current?.();
      unwatchRef.current = null;
    };
  }, [load]);

  // Silent no-alerts is never an option: the driver is told when it happens.
  const cameraWarning = isDriving && coverage === 'unavailable' ? CAMERAS_UNAVAILABLE_MESSAGE : null;
  useEffect(() => {
    if (cameraWarning !== null) announce(alertFeedback(soundMode, voiceEnabled, 'camera'), cameraWarning);
  }, [cameraWarning, soundMode, voiceEnabled]);

  const speedKmh = Math.round(speedKmhRaw);
  const status = getSpeedStatus(speedKmh, limitKmhRaw, amberThresholdPct);

  const start = useCallback(() => {
    if (startingRef.current) return;
    startingRef.current = true;
    void (async () => {
      // A queued trip replay always plays through the demo source.
      let kind: LocationSourceKind = locationSource === 'gps' && !hasQueuedReplay ? 'gps' : 'demo';
      if (kind === 'gps' && !(await location.requestPermission())) {
        kind = 'demo';
        showFeedback('Location is off — playing the demo drive instead');
      }
      const playback = kind === 'demo' ? takeDemoPlayback() : null;
      const liveLimitFor = createSpeedLimitLookup(useCameraStore);
      const limitFor =
        playback?.kind === 'planned'
          ? await createRouteSpeedLimitLookup(findInBounds, playback.route, liveLimitFor)
          : liveLimitFor;
      const source = playback === null ? location.device(limitFor) : location.demo(playback, limitFor);
      // The cameras around the start are fetched before the drive starts (an idle
      // set centred within the refetch distance is reused). A GPS drive with no fix
      // yet starts from its first reading. On failure the drive still starts and
      // the driver sees cameraWarning while retries continue.
      const startAt: LatLng | null =
        kind === 'gps' ? currentLocation : await source.getCurrent();
      if (startAt !== null) await prepareDrive(startAt);
      startDrive(kind);
      unwatchRef.current = source.watch(
        createDrivePointHandler(
          { drive: useDriveStore, settings: useSettingsStore, hazards: useHazardStore, cameras: useCameraStore },
          setNextAlert,
        ),
      );
    })().finally(() => {
      startingRef.current = false;
    });
  }, [showFeedback, locationSource, hasQueuedReplay, startDrive, location, takeDemoPlayback, useHazardStore, useCameraStore, prepareDrive, findInBounds, currentLocation]);

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
    isLoading: hazardsLoading || awaitingCameras,
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
    cameraWarning,
    start,
    stop,
    onReport,
  };
}
