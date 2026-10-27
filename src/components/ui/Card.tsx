import type { ReactNode } from 'react';
import { View } from 'react-native';
import { elevation, rounded } from '@/theme/tokens';
import { GlassSurface } from './GlassSurface';

export type CardVariant = 'content' | 'elevated' | 'soft' | 'inverse' | 'form';

type CardProps = {
  children: ReactNode;
  variant?: CardVariant;
};

const variantClass: Record<Exclude<CardVariant, 'form'>, string> = {
  content: 'bg-canvas p-xxl',
  elevated: 'bg-canvas p-xxl',
  soft: 'bg-canvas-soft p-xxl',
  inverse: 'bg-inverse p-xxl',
};

export function Card({ children, variant = 'content' }: CardProps) {
  // The request-form card floats over the map, so it is glass.
  if (variant === 'form') {
    return (
      <GlassSurface radius={rounded.xl} className="p-lg">
        {children}
      </GlassSurface>
    );
  }
  // Shadows stay as styles: DESIGN.md elevation is a full box-shadow string.
  return (
    <View className={`rounded-xl ${variantClass[variant]}`} style={variant === 'elevated' ? elevation.level1 : undefined}>
      {children}
    </View>
  );
}
