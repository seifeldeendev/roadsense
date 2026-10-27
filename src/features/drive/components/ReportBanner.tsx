import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui';
import { colors, elevation, rounded, spacing, touch } from '@/theme/tokens';

type ReportBannerProps = {
  message: string | null;
};

export function ReportBanner({ message }: ReportBannerProps) {
  if (message === null) return null;
  return (
    <View
      accessibilityLiveRegion="polite"
      style={styles.toast}
    >
      <AppText variant="bodyMdStrong" color="onDark" style={styles.text}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    minHeight: touch.min,
    backgroundColor: colors.ink,
    borderRadius: rounded.xl,
    ...elevation.level3,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
