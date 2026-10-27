import { Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { touch, type HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { GlassSurface } from './GlassSurface';

type IconButtonProps = {
  icon: HazardIconName;
  accessibilityLabel: string;
  onPress?: () => void;
  disabled?: boolean;
  // 'glass' for buttons floating over the map.
  surface?: 'soft' | 'glass';
};

export function IconButton({ icon, accessibilityLabel, onPress, disabled = false, surface = 'soft' }: IconButtonProps) {
  const { colors } = useTheme();
  const glyph = <MaterialCommunityIcons name={icon} size={24} color={colors.ink} />;
  if (surface === 'glass') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        onPress={onPress}
        className={`active:opacity-70 ${disabled ? 'opacity-40' : ''}`}
      >
        <GlassSurface radius={touch.min / 2} interactive className="h-touch w-touch items-center justify-center">
          {glyph}
        </GlassSurface>
      </Pressable>
    );
  }
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
      {glyph}
    </Pressable>
  );
}
