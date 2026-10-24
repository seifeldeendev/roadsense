import { Pressable, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  colors,
  rounded,
  spacing,
  touch,
  typography,
  type HazardIconName,
} from '@/theme/tokens';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: HazardIconName;
};

export function Chip({ label, selected, onPress, icon }: ChipProps) {
  const contentColor = selected ? colors.onPrimary : colors.ink;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : styles.unselected,
        pressed && !selected && styles.pressedUnselected,
      ]}
    >
      {icon !== undefined && (
        <MaterialCommunityIcons
          name={icon}
          size={typography.bodySmStrong.fontSize}
          color={contentColor}
        />
      )}
      <Text style={[typography.bodySmStrong, { color: contentColor }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: rounded.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: touch.min,
  },
  selected: {
    backgroundColor: colors.primary,
  },
  unselected: {
    backgroundColor: colors.canvasSoft,
  },
  pressedUnselected: {
    backgroundColor: colors.surfacePressed,
  },
});
