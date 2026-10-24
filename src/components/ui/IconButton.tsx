import { Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { rounded, touch, type HazardIconName } from '@/theme/tokens';
import { useTheme, type ResolvedTheme } from '@/theme/useTheme';

type IconButtonProps = {
  icon: HazardIconName;
  accessibilityLabel: string;
  onPress?: () => void;
  disabled?: boolean;
};

function circleVariant(colors: ResolvedTheme['colors'], pressed: boolean) {
  return pressed
    ? { backgroundColor: colors.surfacePressed }
    : { backgroundColor: colors.canvasSoft };
}

export function IconButton({ icon, accessibilityLabel, onPress, disabled = false }: IconButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.circle, circleVariant(colors, pressed), disabled && styles.disabled]}
    >
      <MaterialCommunityIcons name={icon} size={22} color={colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: touch.min,
    height: touch.min,
    borderRadius: rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
