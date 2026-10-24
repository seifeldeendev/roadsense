import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/theme/tokens';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
};

export function Screen({ children, scroll = false }: ScreenProps) {
  if (!scroll) {
    return (
      <SafeAreaView style={styles.fill}>
        <View style={styles.fill}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.fill}>
      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.content}
        alwaysBounceVertical
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xl,
  },
});
