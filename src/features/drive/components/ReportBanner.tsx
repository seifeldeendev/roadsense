import { StyleSheet, Text } from 'react-native';
import { colors, rounded, spacing, typography } from '@/theme/tokens';

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
    ...typography.bodySmStrong,
    color: colors.ink,
    backgroundColor: colors.canvasSoft,
    borderRadius: rounded.pill,
    overflow: 'hidden',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
