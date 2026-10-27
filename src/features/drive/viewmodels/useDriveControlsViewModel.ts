import { useCallback, useMemo, useState } from 'react';
import { router } from 'expo-router';
import type { SoundMode, UpcomingAlert } from '@/domain/entities';
import { ACTIVE_ALERTS_LOOKAHEAD_M } from '@/domain/usecases/cameras/cameraRadii';
import { findUpcomingAlerts } from '@/domain/usecases/drive/findUpcomingAlerts';
import { nearestRoadName, ROAD_MATCH_RADIUS_M } from '@/domain/usecases/drive/nearestRoadName';
import { useCamerasAround } from '@/stores/cameraHooks';
import { useStores } from '@/stores/DependenciesProvider';

export type DriveSheet = 'sound' | 'options' | 'report' | 'alerts';

export type DriveControlsViewModel = {
  sheet: DriveSheet | null;
  openSheet: (sheet: DriveSheet) => void;
  closeSheet: () => void;
  soundMode: SoundMode;
  chooseSoundMode: (mode: SoundMode) => void;
  satellite: boolean;
  setSatellite: (on: boolean) => void;
  showTraffic: boolean;
  setShowTraffic: (on: boolean) => void;
  northUp: boolean;
  setNorthUp: (on: boolean) => void;
  activeAlerts: UpcomingAlert[];
  roadName: string | null;
  showLimitSign: boolean;
  showSpeedometer: boolean;
  showAlertsAhead: boolean;
  recentreSignal: number;
  recentre: () => void;
  openAppearance: () => void;
  openAlert: (alert: UpcomingAlert) => void;
  openHazard: (hazardId: string) => void;
};

export function useDriveControlsViewModel(): DriveControlsViewModel {
  const { useCameraStore, useDriveStore, useHazardStore, useNavigationStore, useSettingsStore } = useStores();
  const [sheet, setSheet] = useState<DriveSheet | null>(null);
  const [recentreSignal, setRecentreSignal] = useState(0);
  const position = useDriveStore((s) => s.position);
  const heading = useDriveStore((s) => s.heading);
  const isDriving = useDriveStore((s) => s.isDriving);
  const currentLocation = useDriveStore((s) => s.currentLocation);
  const workingSet = useCameraStore((s) => s.workingSet);
  const hazards = useHazardStore((s) => s.hazards);
  const settings = useSettingsStore();
  const driveRoute = useNavigationStore((s) => s.driveRoute);

  const activeAlerts = useMemo(
    () =>
      isDriving && position !== null
        ? findUpcomingAlerts(position, heading, workingSet?.forConsumer('activeAlerts', position) ?? [], hazards, settings, ACTIVE_ALERTS_LOOKAHEAD_M)
        : [],
    [isDriving, position, heading, workingSet, hazards, settings],
  );

  // Before a drive the road is the one the route starts on.
  const roadAt = settings.showRoadName
    ? (position ?? currentLocation ?? (settings.locationSource === 'demo' ? driveRoute[0] : null))
    : null;
  const roadCameras = useCamerasAround(roadAt, ROAD_MATCH_RADIUS_M).cameras;
  const roadName = useMemo(
    () => (roadAt === null ? null : nearestRoadName(roadAt, roadCameras ?? [])),
    [roadAt, roadCameras],
  );

  const closeSheet = useCallback(() => setSheet(null), []);

  const chooseSoundMode = useCallback(
    (mode: SoundMode) => {
      settings.setSoundMode(mode);
      setSheet(null);
    },
    [settings],
  );

  const openHazard = useCallback((hazardId: string) => {
    setSheet(null);
    router.push(`/report/${hazardId}`);
  }, []);

  const openAlert = useCallback(
    (alert: UpcomingAlert) => {
      if (alert.kind === 'hazard') openHazard(alert.refId);
      else setSheet(null);
    },
    [openHazard],
  );

  return {
    sheet,
    openSheet: setSheet,
    closeSheet,
    soundMode: settings.soundMode,
    chooseSoundMode,
    satellite: settings.mapType === 'satellite',
    setSatellite: (on) => settings.setMapType(on ? 'satellite' : 'standard'),
    showTraffic: settings.showTraffic,
    setShowTraffic: settings.setShowTraffic,
    northUp: settings.northUp,
    setNorthUp: settings.setNorthUp,
    activeAlerts,
    roadName,
    showLimitSign: settings.showLimitSign,
    showSpeedometer: settings.showSpeedometer,
    showAlertsAhead: settings.showAlertsAhead,
    recentreSignal,
    recentre: () => setRecentreSignal((count) => count + 1),
    openAppearance: () => {
      setSheet(null);
      router.push('/settings/appearance');
    },
    openAlert,
    openHazard,
  };
}
