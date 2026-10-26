import { useMemo, useState } from 'react';
import { View, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import { AppText } from '@/components/ui';
import { OnboardingIllustration } from './OnboardingIllustration';
import type { OnboardingSlideData } from '../viewmodels/useOnboardingViewModel';

type OnboardingSlideProps = {
  slide: OnboardingSlideData;
  width: number;
};

export function OnboardingSlide({ slide, width }: OnboardingSlideProps) {
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
    <View className="flex-1 items-center justify-center gap-lg px-lg" style={{ width }}>
      <View className="w-full flex-1 items-center justify-center" onLayout={measureIllustrationBox}>
        <OnboardingIllustration icons={slide.icons} style={frameStyle} />
      </View>
      <View className="gap-sm">
        <AppText variant="displayXl" className="text-center">
          {slide.headline}
        </AppText>
        <AppText variant="bodyLg" color="body" className="text-center">
          {slide.body}
        </AppText>
      </View>
    </View>
  );
}
