import { StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/ui';
import { rounded, spacing } from '@/theme/tokens';
import { useTheme, useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';

type OnboardingFooterProps = {
  count: number;
  activeIndex: number;
  isLast: boolean;
  canSkip: boolean;
  onNext: () => void;
  onSkip: () => void;
};

export function OnboardingFooter({
  count,
  activeIndex,
  isLast,
  canSkip,
  onNext,
  onSkip,
}: OnboardingFooterProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(footerStyles, undefined);

  return (
    <View style={styles.root}>
      <View style={styles.dots}>
        {Array.from({ length: count }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: colors.mute },
              i === activeIndex && [styles.dotActive, { backgroundColor: colors.ink }],
            ]}
          />
        ))}
      </View>
      <View style={styles.actions}>
        {canSkip && (
          <AppButton
            title="Skip"
            variant="subtle"
            onPress={onSkip}
            accessibilityLabel="Skip onboarding"
          />
        )}
        <View style={styles.grow}>
          <AppButton
            title={isLast ? 'Get started' : 'Next'}
            variant={isLast ? 'large' : 'primary'}
            onPress={onNext}
            accessibilityLabel={isLast ? 'Get started with RoadSense' : 'Next slide'}
          />
        </View>
      </View>
    </View>
  );
}

function footerStyles(_theme: ResolvedTheme) {
  return StyleSheet.create({
    root: {
      gap: spacing.xl,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
    },
    dots: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    dot: {
      height: spacing.sm,
      width: spacing.sm,
      borderRadius: rounded.pill,
    },
    dotActive: {
      width: 24,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    grow: {
      flex: 1,
    },
  });
}
