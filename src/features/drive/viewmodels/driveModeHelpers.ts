import { useCallback, useEffect, useRef, useState } from 'react';
import type { AlertFeedback } from '@/domain/usecases/drive/alertFeedback';
import type { SpeedStatus } from '@/domain/usecases/drive/getSpeedStatus';
import { vibrateForAlert } from '@/services/haptics';
import { speak } from '@/services/speech';

const FEEDBACK_MS = 3000;

export function clockHHMM(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function announce(feedback: AlertFeedback, text: string): void {
  if (feedback === 'speak') speak(text);
  else if (feedback === 'vibrate') vibrateForAlert();
}

export function statusMessage(
  status: SpeedStatus,
  speedKmh: number,
  limitKmh: number,
): string {
  if (status === 'over') {
    return `Over limit by ${Math.max(1, Math.round(speedKmh - limitKmh))} km/h`;
  }
  if (status === 'near') {
    return 'Near limit';
  }
  return 'Within limit';
}

export function useTransientFeedback(): [string | null, (message: string) => void] {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((next: string) => {
    if (timer.current !== null) clearTimeout(timer.current);
    setMessage(next);
    timer.current = setTimeout(() => setMessage(null), FEEDBACK_MS);
  }, []);
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );
  return [message, show];
}
