import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  rounded,
  spacing,
  touch,
  typography,
  type HazardIconName,
} from '@/theme/tokens';
import { useTheme, type ResolvedTheme } from '@/theme/useTheme';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: HazardIconName;
};

function chipVariant(colors: ResolvedTheme['colors'], selected: boolean, pressed: boolean): ViewStyle {
  if (selected) return { backgroundColor: colors.primary };
  if (pressed) return { backgroundColor: colors.surfacePressed };
  return { backgroundColor: colors.canvasSoft };
}

export function Chip({ label, selected, onPress, icon }: ChipProps) {
  const { colors } = useTheme();
  const contentColor = selected ? colors.onPrimary : colors.ink;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, chipVariant(colors, selected, pressed)]}
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
});
