import { useCallback, useState } from 'react';
import { useSessionStore } from '@/stores/useSessionStore';
import type { HazardIconName } from '@/theme/tokens';

export type OnboardingSlideData = {
  id: string;
  headline: string;
  body: string;
  icons: [HazardIconName, HazardIconName];
};

export const ONBOARDING_SLIDES: OnboardingSlideData[] = [
  {
    id: 'alerts-ahead',
    headline: 'Know what\u2019s ahead',
    body: 'Speed cameras and hazards are announced before you reach them.',
    icons: ['speedometer', 'cctv'],
  },
  {
    id: 'report-once',
    headline: 'Report in one tap',
    body: 'Accidents, potholes, checkpoints and flooding, shared with every driver nearby.',
    icons: ['gesture-tap', 'alert-octagon-outline'],
  },
  {
    id: 'recorded-trips',
    headline: 'Every drive, recorded',
    body: 'See your route, speed and alerts after each trip.',
    icons: ['map-marker-path', 'chart-bar'],
  },
];

export type OnboardingViewModel = {
  slides: OnboardingSlideData[];
  index: number;
  isLast: boolean;
  canSkip: boolean;
  setActiveIndex: (index: number) => void;
  skip: () => void;
};

export function useOnboardingViewModel(): OnboardingViewModel {
  const [index, setIndex] = useState(0);
  const completeOnboarding = useSessionStore((s) => s.completeOnboarding);

  const setActiveIndex = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(next, ONBOARDING_SLIDES.length - 1)));
  }, []);

  const skip = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  return {
    slides: ONBOARDING_SLIDES,
    index,
    isLast: index === ONBOARDING_SLIDES.length - 1,
    canSkip: index < ONBOARDING_SLIDES.length - 1,
    setActiveIndex,
    skip,
  };
}
