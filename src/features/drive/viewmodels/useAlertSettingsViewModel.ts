import { useCallback, useState } from 'react';
import { router } from 'expo-router';
import type { AlertTarget, Camera, Settings, UpcomingAlert } from '@/domain/entities';
import { useAsyncResult } from '@/shared/useAsyncResult';
import { useStores } from '@/stores/DependenciesProvider';

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

const SAMPLE_CAMERA = 'first-speed-camera';

export function useAlertSettingsViewModel(): AlertSettingsViewModel {
  const { useCameraStore, useDriveStore, useSettingsStore } = useStores();
  const settings = useSettingsStore();
  const findFirstSpeedCamera = useCameraStore((s) => s.findFirstSpeedCamera);
  const setActiveAlert = useDriveStore((s) => s.setActiveAlert);
  const [message, setMessage] = useState<string | null>(null);

  // Looked up once on mount, so the preview opens at once when tapped.
  const sample = useAsyncResult(SAMPLE_CAMERA, () => findFirstSpeedCamera().catch(() => null));

  const toggleType = useCallback((type: AlertTarget) => {
    const current = settings.enabledTypes;
    if (current.includes(type) && current.length === 1) {
      setMessage('Keep at least one alert type on');
      return;
    }
    setMessage(null);
    settings.toggleType(type);
  }, [settings]);

  const sampleCameraAlert = useCallback((): UpcomingAlert | null => {
    // The road database also lists police and bumps; the preview uses a speed camera.
    const camera: Camera | null = sample.value;
    if (camera === null) return null;
    return {
      kind: 'camera',
      refId: camera.id,
      title: 'Speed camera ahead',
      roadName: camera.roadName,
      distanceM: 300,
      speedLimitKmh: camera.speedLimitKmh > 0 ? camera.speedLimitKmh : undefined,
      camera,
    };
  }, [sample.value]);

  const previewAlert = useCallback(() => {
    const alert = sampleCameraAlert();
    if (alert === null) {
      setMessage('Cameras are still loading — try again');
      return;
    }
    setMessage(null);
    setActiveAlert(alert);
    router.push('/alert');
  }, [sampleCameraAlert, setActiveAlert]);

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
