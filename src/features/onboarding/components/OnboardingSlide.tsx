import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';
import { OnboardingIllustration } from './OnboardingIllustration';
import type { OnboardingSlideData } from '../viewmodels/useOnboardingViewModel';

type OnboardingSlideProps = {
  slide: OnboardingSlideData;
  width: number;
};

export function OnboardingSlide({ slide, width }: OnboardingSlideProps) {
  const styles = useThemedStyles(slideStyles, undefined);

  return (
    <View style={[styles.root, { width }]}>
      <View style={styles.illustration}>
        <OnboardingIllustration icons={slide.icons} />
      </View>
      <View style={styles.copy}>
        <AppText variant="displayXl" style={styles.centered}>
          {slide.headline}
        </AppText>
        <AppText variant="bodyLg" color="body" style={styles.centered}>
          {slide.body}
        </AppText>
      </View>
    </View>
  );
}

function slideStyles(theme: ResolvedTheme) {
  return StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xl,
      paddingHorizontal: spacing.xxxl,
    },
    illustration: {
      width: '100%',
      maxWidth: 480,
    },
    copy: {
      gap: spacing.sm,
    },
    centered: {
      textAlign: 'center',
    },
  });
}
