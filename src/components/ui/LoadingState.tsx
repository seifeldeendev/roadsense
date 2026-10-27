import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/theme/tokens';
import { AppText } from './AppText';

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.ink} />
      {label !== undefined && (
        <AppText variant="bodyMd" color="body" style={styles.centered}>
          {label}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  centered: {
    textAlign: 'center',
  },
});
