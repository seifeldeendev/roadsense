import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';

type BrandSplashProps = {
  onFinished: () => void;
};

const HOLD_MS = 1200;
const FADE_MS = 350;

export function BrandSplash({ onFinished }: BrandSplashProps) {
  const { colors } = useTheme();
  const [opacity] = useState(() => new Animated.Value(1));
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const hold = setTimeout(() => {
      setFading(true);
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        onFinished();
      });
    }, HOLD_MS);
    return () => clearTimeout(hold);
  }, [opacity, onFinished]);

  return (
    <Animated.View pointerEvents={fading ? 'none' : 'auto'} style={[StyleSheet.absoluteFill, splashStyles.fill, { backgroundColor: colors.inverse, opacity }]}>
      <View className="items-center gap-sm">
        <MaterialCommunityIcons name="speedometer" size={40} color={colors.onInverse} />
        <AppText variant="displayXxl" color="onInverse">
          RoadSense
        </AppText>
        <AppText variant="bodyMd" color="inverseMuted">
          Know what&apos;s on the road ahead
        </AppText>
      </View>
    </Animated.View>
  );
}

// Animated.View keeps plain styles; the fade drives its opacity.
const splashStyles = StyleSheet.create({
  fill: { alignItems: 'center', justifyContent: 'center' },
});
