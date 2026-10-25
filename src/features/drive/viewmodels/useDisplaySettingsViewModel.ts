import { useSettingsStore } from '@/stores/useSettingsStore';

// 0 stands for "off" so the segmented control can hold a plain number.
export type SpeedAlarmChoice = 0 | 80 | 100 | 120;

export type DisplaySettingsViewModel = {
  speedAlarm: SpeedAlarmChoice;
  setSpeedAlarm: (choice: SpeedAlarmChoice) => void;
};

export function useDisplaySettingsViewModel(): DisplaySettingsViewModel {
  const speedAlarmKmh = useSettingsStore((s) => s.speedAlarmKmh);
  const setSpeedAlarm = useSettingsStore((s) => s.setSpeedAlarm);
  return {
    speedAlarm: (speedAlarmKmh ?? 0) as SpeedAlarmChoice,
    setSpeedAlarm: (choice) => setSpeedAlarm(choice === 0 ? null : choice),
  };
}
