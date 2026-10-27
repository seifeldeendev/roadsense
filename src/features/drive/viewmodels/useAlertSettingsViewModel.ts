import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import type { AlertTarget, Camera, Settings, UpcomingAlert } from '@/domain/entities';
import { speak } from '@/services/speech';
import { useDriveStore } from '@/stores/useDriveStore';
import { useHazardStore } from '@/stores/useHazardStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

export type AlertSettingsViewModel = {
  alertDistanceM: Settings['alertDistanceM'];
  enabledTypes: AlertTarget[];
  voiceEnabled: boolean;
  soundEnabled: boolean;
  amberThresholdPct: Settings['amberThresholdPct'];
  message: string | null;
  canTestVoice: boolean;
  toggleType: (type: AlertTarget) => void;
  setAlertDistance: (value: Settings['alertDistanceM']) => void;
  setAmberThreshold: (value: Settings['amberThresholdPct']) => void;
  setVoiceEnabled: (value: boolean) => void;
  setSoundEnabled: (value: boolean) => void;
  testVoice: () => void;
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
    const camera: Camera | undefined = useHazardStore.getState().cameras[0];
    if (camera === undefined) return null;
    return {
      kind: 'camera',
      refId: camera.id,
      title: 'Speed camera ahead',
      roadName: camera.roadName,
      distanceM: 300,
      speedLimitKmh: camera.speedLimitKmh,
      camera,
    };
  }, []);

  const testVoice = useCallback(() => {
    if (!useSettingsStore.getState().voiceEnabled) return;
    speak('Speed camera in 300 metres');
  }, []);

  const previewAlert = useCallback(() => {
    const alert = sampleCameraAlert();
    if (alert === null) {
      setMessage('Demo cameras are still loading — try again');
      return;
    }
    setMessage(null);
    useDriveStore.getState().setActiveAlert(alert);
    router.push('/alert');
  }, [sampleCameraAlert]);

  return {
    alertDistanceM: settings.alertDistanceM,
    enabledTypes: settings.enabledTypes,
    voiceEnabled: settings.voiceEnabled,
    soundEnabled: settings.soundEnabled,
    amberThresholdPct: settings.amberThresholdPct,
    message,
    canTestVoice: settings.voiceEnabled,
    toggleType,
    setAlertDistance: settings.setAlertDistance,
    setAmberThreshold: settings.setAmberThreshold,
    setVoiceEnabled: settings.setVoiceEnabled,
    setSoundEnabled: settings.setSoundEnabled,
    testVoice,
    previewAlert,
    reset: settings.reset,
  };
}
