import { useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { rounded, spacing, typography, type HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { GlassIndicator, INDICATOR_HEIGHT } from './GlassIndicator';
import { TAB_BAR_GAP, TAB_BAR_HEIGHT } from './tabBarLayout';
import { AppText } from '../ui/AppText';

export type TabIcons = Record<string, { active: HazardIconName; inactive: HazardIconName }>;

type GlassTabBarProps = BottomTabBarProps & { icons: TabIcons };

const ICON_SIZE = 24;

// Floating tab bar: a DESIGN.md floating pill (canvas, Level 3 shadow, hairline
// rim) over a light frosted blur, with a primary pill under the active tab.
export function GlassTabBar({ state, descriptors, emitter, navigateToTab, insets, icons }: GlassTabBarProps) {
  const { colors, scheme, elevation } = useTheme();
  const [barWidth, setBarWidth] = useState(0);
  const tabWidth = state.routes.length > 0 ? barWidth / state.routes.length : 0;

  const onLayout = (event: LayoutChangeEvent) => setBarWidth(event.nativeEvent.layout.width - spacing.sm * 2);

  return (
    <View pointerEvents="box-none" style={[styles.wrap, elevation.level3, { bottom: insets.bottom + TAB_BAR_GAP }]}>
      <View style={[styles.surface, { borderColor: colors.hairline }]} onLayout={onLayout}>
        <BlurView intensity={40} tint={scheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.canvasGlass }]} />
        {tabWidth > 0 ? <GlassIndicator index={state.index} tabWidth={tabWidth} /> : null}
        <View role="tablist" style={styles.row}>
          {state.routes.map((route, index) => {
            const focused = index === state.index;
            const { options } = descriptors[route.key];
            const title = options.title ?? route.name;
            const icon = icons[route.name] ?? { active: 'circle', inactive: 'circle-outline' };
            const onPress = () => {
              const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigateToTab(route.key);
            };
            return (
              <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityLabel={options.tabBarAccessibilityLabel ?? title}
                accessibilityState={{ selected: focused }}
                onPress={onPress}
                onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })}
                style={styles.tab}
              >
                <View style={styles.iconSlot}>
                  <MaterialCommunityIcons
                    name={focused ? icon.active : icon.inactive}
                    size={ICON_SIZE}
                    color={focused ? colors.onPrimary : colors.body}
                  />
                </View>
                {/* Only the active tab is labelled, to keep the bar uncluttered. */}
                {focused ? (
                  <AppText variant="caption" color="ink" style={styles.label} numberOfLines={1}>
                    {title}
                  </AppText>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    height: TAB_BAR_HEIGHT,
    borderRadius: rounded.pill,
  },
  surface: {
    flex: 1,
    borderRadius: rounded.pill,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', height: '100%' },
  tab: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center' },
  iconSlot: { height: INDICATOR_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  label: { ...typography.caption, lineHeight: 14, marginTop: 2 },
});
