import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui';
import { rounded, spacing, touch } from '@/theme/tokens';
import { useTheme, useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';

type ReportBannerProps = {
  message: string | null;
};

export function ReportBanner({ message }: ReportBannerProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(bannerStyles, undefined);
  if (message === null) return null;
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.toast, { backgroundColor: colors.inverse }]}
    >
      <AppText variant="bodyMdStrong" color="onInverse" style={styles.text}>
        {message}
      </AppText>
    </View>
  );
}

function bannerStyles(theme: ResolvedTheme) {
  return StyleSheet.create({
    toast: {
      minHeight: touch.min,
      borderRadius: rounded.xl,
      ...theme.elevation.level3,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      textAlign: 'center',
    },
  });
}
