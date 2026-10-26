import { Pressable, View } from 'react-native';
import { elevation } from '@/theme/tokens';
import { AppText } from './AppText';

type SegmentedOption<T> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

// Pill track (rounded.pillTab) with the selected segment lifted onto canvas.
// Segment radius = pillTab - track padding, so the curves stay concentric.
export function SegmentedControl<T>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <View className="min-h-touch flex-row rounded-pill-tab bg-canvas-soft p-xs">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            className={`flex-1 items-center justify-center rounded-[30px] px-sm ${
              selected ? 'bg-canvas' : 'active:bg-surface-pressed'
            }`}
            style={selected ? elevation.level3 : undefined}
          >
            <AppText variant={selected ? 'bodyMdStrong' : 'bodyMd'} color={selected ? 'ink' : 'body'} numberOfLines={1}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
