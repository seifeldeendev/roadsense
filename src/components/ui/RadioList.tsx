import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import type { HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export type RadioOption<T> = { value: T; label: string; icon?: HazardIconName };

type RadioListProps<T> = {
  options: readonly RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

// One-of-many choice as full-width rows with hairline dividers (DESIGN.md faq-row).
export function RadioList<T>({ options, value, onChange }: RadioListProps<T>) {
  const { colors } = useTheme();
  return (
    <View>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            className="min-h-touch-lg flex-row items-center gap-md border-hairline py-lg active:bg-canvas-soft"
            style={styles.divider}
          >
            {option.icon !== undefined ? (
              <MaterialCommunityIcons name={option.icon} size={22} color={colors.ink} />
            ) : null}
            <AppText variant="bodyMdStrong" className="flex-1">
              {option.label}
            </AppText>
            <MaterialCommunityIcons
              name={selected ? 'radiobox-marked' : 'radiobox-blank'}
              size={22}
              color={selected ? colors.ink : colors.mute}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  divider: { borderBottomWidth: StyleSheet.hairlineWidth },
});
