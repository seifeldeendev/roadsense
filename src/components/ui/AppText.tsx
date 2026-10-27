import type { ReactNode } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import type { ThemeColors, TypographyToken } from '@/theme/tokens';

export type AppTextColor = Exclude<keyof ThemeColors, 'status'>;

type AppTextProps = {
  children: ReactNode;
  variant?: TypographyToken;
  color?: AppTextColor;
  className?: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

// DESIGN.md type scale: family + size/line-height per token.
const variantClass: Record<TypographyToken, string> = {
  displayXxl: 'font-inter-bold text-display-xxl',
  displayXl: 'font-inter-bold text-display-xl',
  displayLg: 'font-inter-bold text-display-lg',
  displayMd: 'font-inter-bold text-display-md',
  displaySm: 'font-inter-bold text-display-sm',
  bodyLg: 'font-inter-medium text-body-lg',
  bodyMd: 'font-inter text-body-md',
  bodyMdStrong: 'font-inter-medium text-body-md-strong',
  bodySm: 'font-inter text-body-sm',
  bodySmStrong: 'font-inter-medium text-body-sm-strong',
  caption: 'font-inter text-caption',
  buttonLarge: 'font-inter-medium text-button-large',
  buttonMd: 'font-inter-medium text-button-md',
};

const kebab = (name: string) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

export function AppText({
  children,
  variant = 'bodyMd',
  color = 'ink',
  className = '',
  style,
  numberOfLines,
}: AppTextProps) {
  return (
    <Text
      className={`${variantClass[variant]} text-${kebab(color)} ${className}`}
      style={style}
      maxFontSizeMultiplier={variant.startsWith('display') ? 1.3 : undefined}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}
