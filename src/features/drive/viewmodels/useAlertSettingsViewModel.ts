import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import type { AlertTarget, Camera, Settings, UpcomingAlert } from '@/domain/entities';
import { isSpeedCamera } from '@/domain/usecases/drive/fixedPoints';
import { useDriveStore } from '@/stores/useDriveStore';
import { useHazardStore } from '@/stores/useHazardStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

export type AlertSettingsViewModel = {
  alertDistanceM: Settings['alertDistanceM'];
  enabledTypes: AlertTarget[];
  amberThresholdPct: Settings['amberThresholdPct'];
  message: string | null;
  toggleType: (type: AlertTarget) => void;
  setAlertDistance: (value: Settings['alertDistanceM']) => void;
  setAmberThreshold: (value: Settings['amberThresholdPct']) => void;
  previewAlert: () => void;
  reset: () => void;
};

export function useAlertSettingsViewModel(): AlertSettingsViewModel {
  const settings = useSettingsStore();
  const cameras = useHazardStore((s) => s.cameras);
  const load = useHazardStore((s) => s.load);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (cameras.length === 0) {
      void load();
    }
  }, [cameras.length, load]);

  const toggleType = useCallback((type: AlertTarget) => {
    const current = useSettingsStore.getState().enabledTypes;
    if (current.includes(type) && current.length === 1) {
      setMessage('Keep at least one alert type on');
      return;
    }
    setMessage(null);
    useSettingsStore.getState().toggleType(type);
  }, []);

  const sampleCameraAlert = useCallback((): UpcomingAlert | null => {
    // The road database also lists police and bumps; the preview uses a speed camera.
    const camera: Camera | undefined = useHazardStore.getState().cameras.find((item) => isSpeedCamera(item));
    if (camera === undefined) return null;
    return {
      kind: 'camera',
      refId: camera.id,
      title: 'Speed camera ahead',
      roadName: camera.roadName,
      distanceM: 300,
      speedLimitKmh: camera.speedLimitKmh > 0 ? camera.speedLimitKmh : undefined,
      camera,
    };
  }, []);

  const previewAlert = useCallback(() => {
    const alert = sampleCameraAlert();
    if (alert === null) {
      setMessage('Cameras are still loading — try again');
      return;
    }
    setMessage(null);
    useDriveStore.getState().setActiveAlert(alert);
    router.push('/alert');
  }, [sampleCameraAlert]);

  return {
    alertDistanceM: settings.alertDistanceM,
    enabledTypes: settings.enabledTypes,
    amberThresholdPct: settings.amberThresholdPct,
    message,
    toggleType,
    setAlertDistance: settings.setAlertDistance,
    setAmberThreshold: settings.setAmberThreshold,
    previewAlert,
    reset: settings.reset,
  };
}
