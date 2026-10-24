import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  rounded,
  spacing,
  touch,
  typography,
  type HazardIconName,
  type ThemeColors,
} from '@/theme/tokens';
import { useTheme, type ResolvedTheme } from '@/theme/useTheme';

export type AppButtonVariant = 'primary' | 'secondary' | 'subtle' | 'floating' | 'large';
export type AppButtonSize = 'md' | 'lg';

type VariantStyle = {
  container: ViewStyle;
  textColor: string;
  pressedBackground: string;
};

function variantStyle(
  colors: ThemeColors,
  elevation: ResolvedTheme['elevation'],
  variant: AppButtonVariant,
): VariantStyle {
  switch (variant) {
    case 'primary':
    case 'large':
      return {
        container: { backgroundColor: colors.primary },
        textColor: colors.onPrimary,
        pressedBackground: colors.primaryPressed,
      };
    case 'secondary':
      return {
        container: {
          backgroundColor: colors.canvas,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.hairline,
        },
        textColor: colors.ink,
        pressedBackground: colors.surfacePressed,
      };
    case 'subtle':
      return {
        container: { backgroundColor: colors.canvasSoft },
        textColor: colors.ink,
        pressedBackground: colors.surfacePressed,
      };
    case 'floating':
      return {
        container: { backgroundColor: colors.canvas, ...elevation.level3 },
        textColor: colors.ink,
        pressedBackground: colors.surfacePressed,
      };
  }
}

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
  const theme = useTheme();
  const styles = stylesBase;
  const isLarge = variant === 'large' || size === 'lg';
  const style = variantStyle(theme.colors, theme.elevation, variant);
  const inactive = disabled || loading;
  const labelTypography = isLarge ? typography.buttonLarge : typography.buttonMd;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        isLarge ? styles.largeBase : styles.pillBase,
        style.container,
        pressed && !inactive && { backgroundColor: style.pressedBackground },
        inactive && styles.inactive,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={style.textColor} />
      ) : (
        <View style={styles.row}>
          {icon !== undefined && (
            <MaterialCommunityIcons
              name={icon}
              size={labelTypography.fontSize}
              color={style.textColor}
            />
          )}
          <Text style={[labelTypography, { color: style.textColor }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

type ButtonStyles = {
  base: ViewStyle;
  pillBase: ViewStyle;
  largeBase: ViewStyle;
  inactive: ViewStyle;
  row: ViewStyle;
};

const stylesBase: ButtonStyles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBase: {
    borderRadius: rounded.pill,
    paddingHorizontal: spacing.xl,
    minHeight: touch.min,
  },
  largeBase: {
    borderRadius: rounded.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    minHeight: touch.large,
  },
  inactive: {
    opacity: 0.4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
