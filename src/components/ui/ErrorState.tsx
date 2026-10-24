import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { rounded, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { AppText } from './AppText';
import { AppButton } from './AppButton';

type ErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.canvasSoft }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.canvasSofter }]}>
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
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: rounded.full,
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
