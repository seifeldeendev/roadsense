import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
};

export function Screen({ children, scroll = false }: ScreenProps) {
  const { colors } = useTheme();
  const fill: ViewStyle = { flex: 1, backgroundColor: colors.canvas };
  if (!scroll) {
    return (
      <SafeAreaView style={fill}>
        <View style={[fill, styles.gutter]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={fill}>
      <ScrollView
        style={fill}
        contentContainerStyle={[styles.gutter, styles.scrollContent]}
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
  scrollContent: {
    paddingBottom: spacing.xl,
  },
});
