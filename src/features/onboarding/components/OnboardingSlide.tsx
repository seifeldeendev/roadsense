import { useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type ViewStyle } from 'react-native';
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
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  const measureIllustrationBox = (event: LayoutChangeEvent) => {
    const { width: w, height: h } = event.nativeEvent.layout;
    if (w > 0 && h > 0) {
      setBox((prev) => (
        prev !== null && prev.w === w && prev.h === h ? prev : { w, h }
      ));
    }
  };

  const frameStyle = useMemo<ViewStyle>(() => {
    if (box === null) {
      return {
        aspectRatio: 4 / 3,
        width: '100%',
        maxWidth: 480,
      };
    }
    const frameWidth = Math.min(box.w, box.h * (4 / 3), 480);
    return { width: frameWidth, height: frameWidth * (3 / 4) };
  }, [box]);

  return (
    <View style={[styles.root, { width }]}>
      <View style={styles.illustration} onLayout={measureIllustrationBox}>
        <OnboardingIllustration icons={slide.icons} style={frameStyle} />
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

function slideStyles(_theme: ResolvedTheme) {
  return StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.lg,
      paddingHorizontal: spacing.lg,
    },
    illustration: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    copy: {
      gap: spacing.sm,
    },
    centered: {
      textAlign: 'center',
    },
  });
}
