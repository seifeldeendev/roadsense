import type { ReactNode } from 'react';
import { View } from 'react-native';
import { elevation } from '@/theme/tokens';

export type CardVariant = 'content' | 'elevated' | 'soft' | 'inverse' | 'form';

type CardProps = {
  children: ReactNode;
  variant?: CardVariant;
};

const variantClass: Record<CardVariant, string> = {
  content: 'bg-canvas p-xxl',
  elevated: 'bg-canvas p-xxl',
  soft: 'bg-canvas-soft p-xxl',
  inverse: 'bg-inverse p-xxl',
  form: 'bg-canvas p-lg',
};

// Shadows stay as styles: DESIGN.md elevation is a full box-shadow string.
const variantShadow: Partial<Record<CardVariant, object>> = {
  elevated: elevation.level1,
  form: elevation.level2,
};

export function Card({ children, variant = 'content' }: CardProps) {
  return (
    <View className={`rounded-xl ${variantClass[variant]}`} style={variantShadow[variant]}>
      {children}
    </View>
  );
}
