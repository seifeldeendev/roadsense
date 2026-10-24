import type { ReactNode } from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import { typography, type ThemeColors, type TypographyToken } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export type AppTextColor = Exclude<keyof ThemeColors, 'status'>;

type AppTextProps = {
  children: ReactNode;
  variant?: TypographyToken;
  color?: AppTextColor;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

export function AppText({
  children,
  variant = 'bodyMd',
  color = 'ink',
  style,
  numberOfLines,
}: AppTextProps) {
  const { colors } = useTheme();
  return (
    <Text
      style={StyleSheet.flatten([
        typography[variant],
        { color: colors[color] },
        style,
      ])}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}
