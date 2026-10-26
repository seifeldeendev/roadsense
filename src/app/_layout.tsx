import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import '../../global.css';
import { nativeTypography } from '@/theme/tokens';
import { themeVars } from '@/theme/cssVars';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { useTheme } from '@/theme/useTheme';
import { useThemeStore } from '@/stores/useThemeStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { BrandSplash } from '@/features/onboarding/screens/BrandSplash';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const preference = useThemeStore((s) => s.preference);
  const hasHydrated = useSessionStore((s) => s.hasHydrated);
  const [fontsLoaded, fontsError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  const ready = (fontsLoaded || fontsError !== null) && hasHydrated;

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <ThemeProvider preference={preference}>
      <ThemedChrome />
    </ThemeProvider>
  );
}

function ThemedChrome() {
  const { colors, scheme } = useTheme();
  const user = useSessionStore((s) => s.user);
  const hasCompletedOnboarding = useSessionStore((s) => s.hasCompletedOnboarding);
  const [splashShown, setSplashShown] = useState(true);
  const hideSplash = useCallback(() => setSplashShown(false), []);
  // Palette as CSS variables so NativeWind classes (bg-canvas, text-ink…) follow the theme.
  const palette = useMemo(() => themeVars(colors), [colors]);

  return (
    <View style={[{ flex: 1 }, palette]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.canvas },
          headerTintColor: colors.ink,
          headerTitleStyle: {
            ...nativeTypography.stackHeaderTitle,
            color: colors.ink,
          },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.canvas },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Protected guard={!hasCompletedOnboarding}>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={hasCompletedOnboarding && user === null}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={user !== null}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="alert"
            options={{ presentation: 'transparentModal', headerShown: false, animation: 'fade' }}
          />
          <Stack.Screen name="settings/alerts" options={{ title: 'Alerts' }} />
          <Stack.Screen name="settings/map" options={{ title: 'Map & layers' }} />
          <Stack.Screen name="settings/sound" options={{ title: 'Sound & voice' }} />
          <Stack.Screen name="settings/drive-screen" options={{ title: 'Drive screen' }} />
          <Stack.Screen name="settings/appearance" options={{ title: 'Appearance' }} />
          <Stack.Screen name="report/[id]" options={{ title: 'Report details' }} />
          <Stack.Screen name="route-preview" options={{ headerShown: false }} />
          <Stack.Screen name="trip/[id]" options={{ title: 'Trip details' }} />
        </Stack.Protected>
      </Stack>
      {splashShown && (
        <BrandSplash onFinished={hideSplash} />
      )}
    </View>
  );
}
