import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Screen } from '@/components/ui';
import { OnboardingSlide } from '../components/OnboardingSlide';
import { OnboardingFooter } from '../components/OnboardingFooter';
import { useOnboardingViewModel, type OnboardingSlideData } from '../viewmodels/useOnboardingViewModel';

export default function OnboardingScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const vm = useOnboardingViewModel();
  const listRef = useRef<FlatList<OnboardingSlideData>>(null);
  const [pagerWidth, setPagerWidth] = useState(windowWidth);

  const measurePager = useCallback((event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    if (next > 0) {
      setPagerWidth(next);
    }
  }, []);

  const deriveIndex = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      if (pagerWidth <= 0) return;
      vm.setActiveIndex(Math.round(offsetX / pagerWidth));
    },
    [pagerWidth, vm],
  );

  const scrollToIndex = useCallback(
    (index: number, animated: boolean) => {
      const list = listRef.current;
      if (list === null) return;
      list.scrollToIndex({ index, animated });
    },
    [],
  );

  const next = () => {
    if (vm.isLast) {
      vm.skip();
      return;
    }
    scrollToIndex(vm.index + 1, true);
  };

  return (
    <Screen padded={false}>
      <View className="flex-1 gap-md">
        <View className="flex-1" onLayout={measurePager}>
          <FlatList<OnboardingSlideData>
            ref={listRef}
            data={vm.slides}
            keyExtractor={(slide) => slide.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            getItemLayout={(_data, index) => ({
              length: pagerWidth,
              offset: pagerWidth * index,
              index,
            })}
            renderItem={({ item }) => (
              <OnboardingSlide slide={item} width={pagerWidth} />
            )}
            onMomentumScrollEnd={deriveIndex}
            onScrollToIndexFailed={(info) => {
              listRef.current?.scrollToOffset({
                offset: info.index * pagerWidth,
                animated: false,
              });
            }}
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
