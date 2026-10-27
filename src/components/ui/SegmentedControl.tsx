import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  colors,
  elevation,
  rounded,
  spacing,
  touch,
  typography,
} from '@/theme/tokens';

type SegmentedOption<T> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <View style={styles.track}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segment,
              selected && styles.selected,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={
                selected
                  ? [typography.bodyMdStrong, { color: colors.ink }]
                  : [typography.bodyMd, { color: colors.body }]
              }
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.canvasSoft,
    borderRadius: rounded.pillTab,
    padding: spacing.xs,
    minHeight: touch.min,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: rounded.pillTab - spacing.xs,
  },
  selected: {
    backgroundColor: colors.canvas,
    ...elevation.level3,
  },
  pressed: {
    backgroundColor: colors.surfacePressed,
  },
});
