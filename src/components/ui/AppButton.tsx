import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { elevation, typography, type HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { AppText, type AppTextColor } from './AppText';

export type AppButtonVariant = 'primary' | 'secondary' | 'subtle' | 'floating' | 'large';
export type AppButtonSize = 'md' | 'lg';

// Surface + pressed colour per DESIGN.md button variant.
const variantClass: Record<AppButtonVariant, string> = {
  primary: 'bg-primary active:bg-primary-pressed',
  large: 'bg-primary active:bg-primary-pressed',
  secondary: 'border-hairline bg-canvas active:bg-surface-pressed',
  subtle: 'bg-canvas-soft active:bg-surface-pressed',
  floating: 'bg-canvas active:bg-surface-pressed',
};

const variantText: Record<AppButtonVariant, AppTextColor> = {
  primary: 'onPrimary',
  large: 'onPrimary',
  secondary: 'ink',
  subtle: 'ink',
  floating: 'ink',
};

type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: HazardIconName;
  accessibilityLabel?: string;
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  size,
  disabled = false,
  loading = false,
  icon,
  accessibilityLabel,
}: AppButtonProps) {
  const { colors } = useTheme();
  const isLarge = variant === 'large' || size === 'lg';
  const inactive = disabled || loading;
  const textColor = variantText[variant];
  const labelVariant = isLarge ? 'buttonLarge' : 'buttonMd';
  // Large buttons are full-width rounded.xl blocks; the rest are 44pt pills.
  const shape = isLarge
    ? 'min-h-touch-lg rounded-xl px-xl py-lg'
    : `min-h-touch min-w-[88px] rounded-pill py-md ${variant === 'subtle' ? 'px-lg' : 'px-md'}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      className={`items-center justify-center ${shape} ${variantClass[variant]} ${inactive ? 'opacity-40' : ''}`}
      style={[
        variant === 'secondary' && styles.hairline,
        variant === 'floating' && elevation.level3,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors[textColor]} />
      ) : (
        <View className="flex-row items-center gap-sm">
          {icon !== undefined && (
            <MaterialCommunityIcons name={icon} size={typography[labelVariant].fontSize} color={colors[textColor]} />
          )}
          <AppText variant={labelVariant} color={textColor} numberOfLines={1}>
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hairline: { borderWidth: StyleSheet.hairlineWidth },
});
