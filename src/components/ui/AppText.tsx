import type { ReactNode } from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import { colors, typography, type TypographyToken } from '@/theme/tokens';

type AppTextProps = {
  children: ReactNode;
  variant?: TypographyToken;
  color?: keyof typeof colors;
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
  return (
    <Text
      style={StyleSheet.flatten([
        styles.reset,
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

const styles = StyleSheet.create({
  reset: {},
});
