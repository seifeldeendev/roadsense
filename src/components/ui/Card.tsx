import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  colors,
  elevation,
  rounded,
  spacing,
} from '@/theme/tokens';

export type CardVariant = 'content' | 'elevated' | 'soft' | 'dark' | 'form';

type CardProps = {
  children: ReactNode;
  variant?: CardVariant;
};

export function Card({ children, variant = 'content' }: CardProps) {
  return <View style={[styles.base, variantStyles[variant]]}>{children}</View>;
}

const variantStyles = {
  content: {},
  elevated: {
    ...elevation.level1,
  },
  soft: {
    backgroundColor: colors.canvasSoft,
  },
  dark: {
    backgroundColor: colors.ink,
  },
  form: {
    ...elevation.level2,
    padding: spacing.lg,
  },
} satisfies Record<CardVariant, object>;

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.canvas,
    borderRadius: rounded.xl,
    padding: spacing.xxl,
  },
});
