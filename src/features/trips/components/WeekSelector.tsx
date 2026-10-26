import { View } from 'react-native';
import { AppText, IconButton } from '@/components/ui';

type WeekSelectorProps = {
  label: string;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function WeekSelector({ label, canGoNext, onPrev, onNext }: WeekSelectorProps) {
  return (
    <View className="flex-row items-center gap-sm">
      <IconButton icon="chevron-left" accessibilityLabel="Previous week" onPress={onPrev} />
      <View className="flex-1 items-center">
        <AppText variant="bodyMdStrong">{label}</AppText>
      </View>
      <IconButton
        icon="chevron-right"
        accessibilityLabel="Next week"
        onPress={onNext}
        disabled={!canGoNext}
      />
    </View>
  );
}
