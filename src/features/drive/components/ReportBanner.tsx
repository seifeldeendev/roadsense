import { StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '@/theme/tokens';

type ReportBannerProps = {
  message: string | null;
};

export function ReportBanner({ message }: ReportBannerProps) {
  if (message === null) return null;
  return (
    <Text accessibilityLiveRegion="polite" style={styles.banner}>
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  banner: {
    minHeight: 32,
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
