import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
};

export function Screen({ children, scroll = false, padded = true }: ScreenProps) {
  const { colors } = useTheme();
  const fill: ViewStyle = { flex: 1, backgroundColor: colors.canvas };
  const gutter = padded ? styles.gutter : styles.noGutter;
  if (!scroll) {
    return (
      <SafeAreaView style={fill}>
        <View style={[fill, gutter]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={fill}>
      <ScrollView
        style={fill}
        contentContainerStyle={[gutter, styles.scrollContent]}
        alwaysBounceVertical
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  gutter: {
    paddingHorizontal: spacing.lg,
  },
  noGutter: {
    paddingHorizontal: 0,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
});
