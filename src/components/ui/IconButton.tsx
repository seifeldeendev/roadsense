import { Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, rounded, touch, type HazardIconName } from '@/theme/tokens';

type IconButtonProps = {
  icon: HazardIconName;
  accessibilityLabel: string;
  onPress?: () => void;
  disabled?: boolean;
};

export function IconButton({ icon, accessibilityLabel, onPress, disabled = false }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.circle, pressed && styles.pressed, disabled && styles.disabled]}
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
    backgroundColor: colors.canvasSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.surfacePressed,
  },
  disabled: {
    opacity: 0.4,
  },
});
