import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme/tokens';
import { AppButton } from './AppButton';

type ErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.button}>
        <AppButton title="Retry" onPress={onRetry} variant="secondary" accessibilityLabel="Retry" />
      </View>
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
  icon: {
    fontSize: typography.size.heading,
  },
  message: {
    fontSize: typography.size.body,
    color: colors.muted,
    textAlign: 'center',
  },
  button: {
    width: 220,
    marginTop: spacing.sm,
  },
});
