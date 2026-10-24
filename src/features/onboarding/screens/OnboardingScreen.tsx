import { useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Screen } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';
import { OnboardingSlide } from '../components/OnboardingSlide';
import { OnboardingFooter } from '../components/OnboardingFooter';
import { useOnboardingViewModel, type OnboardingSlideData } from '../viewmodels/useOnboardingViewModel';

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const vm = useOnboardingViewModel();
  const styles = useThemedStyles(screenStyles, undefined);
  const listRef = useRef<FlatList<OnboardingSlideData>>(null);

  const next = () => {
    if (vm.isLast) {
      vm.skip();
      return;
    }
    listRef.current?.scrollToIndex({ index: vm.index + 1, animated: true });
  };

  return (
    <Screen>
      <View style={styles.fill}>
        <View style={styles.slides}>
          <FlatList<OnboardingSlideData>
            ref={listRef}
            data={vm.slides}
            keyExtractor={(slide) => slide.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <OnboardingSlide slide={item} width={width} />}
            onViewableItemsChanged={vm.markVisible}
            viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          />
        </View>
        <OnboardingFooter
          count={vm.slides.length}
          activeIndex={vm.index}
          isLast={vm.isLast}
          canSkip={vm.canSkip}
          onNext={next}
          onSkip={vm.skip}
        />
      </View>
    </Screen>
  );
}

function screenStyles(_theme: ResolvedTheme) {
  return StyleSheet.create({
    fill: {
      flex: 1,
      gap: spacing.lg,
    },
    slides: {
      flex: 1,
    },
  });
}
