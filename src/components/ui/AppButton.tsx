import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, touch, typography } from '@/theme/tokens';

export type AppButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type AppButtonSize = 'md' | 'lg';

type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  accessibilityLabel?: string;
};

type VariantStyle = {
  container: ViewStyleMap;
  text: { color: string };
  spinnerColor: string;
};

type ViewStyleMap = {
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
};

const variants: Record<AppButtonVariant, VariantStyle> = {
  primary: {
    container: { backgroundColor: colors.primary },
    text: { color: colors.background },
    spinnerColor: colors.background,
  },
  secondary: {
    container: {
      backgroundColor: colors.surfaceAlt,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    text: { color: colors.primary },
    spinnerColor: colors.primary,
  },
  danger: {
    container: { backgroundColor: colors.danger },
    text: { color: colors.background },
    spinnerColor: colors.background,
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: colors.primary },
    spinnerColor: colors.primary,
  },
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  accessibilityLabel,
}: AppButtonProps) {
  const style = variants[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' ? styles.large : styles.medium,
        style.container,
        pressed && !inactive && styles.pressed,
        inactive && styles.inactive,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={style.spinnerColor} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text style={[styles.label, sizes[size], style.text]} numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const sizes = {
  md: { fontSize: typography.size.body },
  lg: { fontSize: typography.size.body + 2 },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  medium: {
    minHeight: touch.min,
  },
  large: {
    minHeight: touch.large,
    borderRadius: radius.lg,
  },
  pressed: {
    opacity: 0.7,
  },
  inactive: {
    opacity: 0.4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontWeight: '600',
  },
});
