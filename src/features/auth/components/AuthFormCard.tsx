import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { rounded, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export function AuthFormCard({ children }: { children: ReactNode }) {
  const { colors, elevation } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.canvas }, elevation.level0]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: rounded.xl,
    padding: spacing.xxl,
    gap: spacing.lg,
  },
});
