import { DynamicColorIOS, Platform } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { NativeTabs } from 'expo-router/native-tabs';
import { darkColors, lightColors } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

// Native system tab bar: Liquid Glass on iOS 26+, Material navigation bar on
// Android. Colours stay within DESIGN.md (ink on canvas, gray when inactive).
export default function TabsLayout() {
  const { scheme, colors } = useTheme();
  // iOS adapts the tint to whatever the glass is floating over.
  const ink = Platform.OS === 'ios' ? DynamicColorIOS({ light: lightColors.ink, dark: darkColors.ink }) : colors.ink;

  return (
    // Matches the navigator background to the app scheme to avoid white flashes.
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NativeTabs
        tintColor={ink}
        iconColor={{ default: colors.body, selected: colors.ink }}
        labelStyle={{ default: { color: colors.body }, selected: { color: colors.ink } }}
        minimizeBehavior="onScrollDown"
        backgroundColor={colors.canvas}
        indicatorColor={colors.canvasSoft}
        rippleColor={colors.surfacePressed}
        labelVisibilityMode="labeled"
      >
        <NativeTabs.Trigger name="drive">
          <NativeTabs.Trigger.Label>Drive</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="steeringwheel" md="directions_car" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="map">
          <NativeTabs.Trigger.Label>Map</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={{ default: 'map', selected: 'map.fill' }} md="map" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="trips">
          <NativeTabs.Trigger.Label>Trips</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="clock.arrow.circlepath" md="history" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="stats">
          <NativeTabs.Trigger.Label>Stats</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }} md="bar_chart" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="account">
          <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
            md="account_circle"
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
}
