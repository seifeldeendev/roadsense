import { Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type IconButtonProps = {
  icon: HazardIconName;
  accessibilityLabel: string;
  onPress?: () => void;
  disabled?: boolean;
};

export function IconButton({ icon, accessibilityLabel, onPress, disabled = false }: IconButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      className={`h-touch w-touch items-center justify-center rounded-full bg-canvas-soft active:bg-surface-pressed ${
        disabled ? 'opacity-40' : ''
      }`}
    >
      <MaterialCommunityIcons name={icon} size={24} color={colors.ink} />
    </Pressable>
  );
}
