import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, rounded, spacing } from '@/theme/tokens';
import { AppText } from './AppText';
import { AppButton } from './AppButton';

type ErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name="alert-octagon" size={26} color={colors.ink} />
      </View>
      <AppText variant="bodyMd" color="body" style={styles.centered}>
        {message}
      </AppText>
      <View style={styles.button}>
        <AppButton title="Retry" onPress={onRetry} accessibilityLabel="Retry" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xxl,
    borderRadius: rounded.xl,
    backgroundColor: colors.canvasSoft,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: rounded.full,
    backgroundColor: colors.canvasSofter,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  centered: {
    textAlign: 'center',
  },
  button: {
    width: 220,
    marginTop: spacing.sm,
  },
});
