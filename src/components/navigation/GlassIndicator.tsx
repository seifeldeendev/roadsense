import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import { rounded, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export const INDICATOR_WIDTH = 52;
export const INDICATOR_HEIGHT = 36;
// Leaves room for the active label under the pill.
const INDICATOR_TOP = 9;

type GlassIndicatorProps = { index: number; tabWidth: number };

// Solid primary pill (DESIGN.md selected chip) that glides to the active tab,
// or jumps there when the system asks for reduced motion.
export function GlassIndicator({ index, tabWidth }: GlassIndicatorProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const target = index * tabWidth + (tabWidth - INDICATOR_WIDTH) / 2;
  const x = useSharedValue(target);

  useEffect(() => {
    x.value = reduceMotion ? target : withSpring(target, { damping: 18, stiffness: 180 });
  }, [target, reduceMotion, x]);

  const animated = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return <Animated.View pointerEvents="none" style={[styles.pill, { backgroundColor: colors.primary }, animated]} />;
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    left: spacing.sm,
    top: INDICATOR_TOP,
    width: INDICATOR_WIDTH,
    height: INDICATOR_HEIGHT,
    borderRadius: rounded.pill,
  },
});
