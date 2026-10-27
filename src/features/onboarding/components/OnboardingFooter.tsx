import { View } from 'react-native';
import { AppButton } from '@/components/ui';

type OnboardingFooterProps = {
  count: number;
  activeIndex: number;
  isLast: boolean;
  canSkip: boolean;
  onNext: () => void;
  onSkip: () => void;
};

export function OnboardingFooter({
  count,
  activeIndex,
  isLast,
  canSkip,
  onNext,
  onSkip,
}: OnboardingFooterProps) {
  return (
    <View className="gap-xl px-lg pb-lg">
      <View className="flex-row items-center justify-center gap-sm">
        {Array.from({ length: count }, (_, i) => (
          <View
            key={i}
            className={`h-sm rounded-pill ${i === activeIndex ? 'w-xxl bg-ink' : 'w-sm bg-mute'}`}
          />
        ))}
      </View>
      <View className="flex-row items-center gap-md">
        {canSkip && (
          <AppButton
            title="Skip"
            variant="subtle"
            onPress={onSkip}
            accessibilityLabel="Skip onboarding"
          />
        )}
        <View className="flex-1">
          <AppButton
            title={isLast ? 'Get started' : 'Next'}
            variant={isLast ? 'large' : 'primary'}
            onPress={onNext}
            accessibilityLabel={isLast ? 'Get started with RoadSense' : 'Next slide'}
          />
        </View>
      </View>
    </View>
  );
}
