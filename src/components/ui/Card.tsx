import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { rounded, spacing } from '@/theme/tokens';
import { useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';

export type CardVariant = 'content' | 'elevated' | 'soft' | 'inverse' | 'form';

type CardProps = {
  children: ReactNode;
  variant?: CardVariant;
};

export function Card({ children, variant = 'content' }: CardProps) {
  const styles = useThemedStyles(cardStyles, variant);
  return <View style={styles.base}>{children}</View>;
}

function cardStyles(theme: ResolvedTheme, variant: CardVariant) {
  return StyleSheet.create({
    base: cardBase(theme, variant),
  });
}

function cardBase(theme: ResolvedTheme, variant: CardVariant): ViewStyle {
  const { colors, elevation } = theme;
  const variantLayer: Record<CardVariant, ViewStyle> = {
    content: {},
    elevated: { ...elevation.level1 },
    soft: { backgroundColor: colors.canvasSoft },
    inverse: { backgroundColor: colors.inverse },
    form: { ...elevation.level2, padding: spacing.lg },
  };
  return {
    backgroundColor: colors.canvas,
    borderRadius: rounded.xl,
    padding: spacing.xxl,
    ...variantLayer[variant],
  };
}
