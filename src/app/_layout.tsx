import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { nativeTypography } from '@/theme/tokens';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { useTheme } from '@/theme/useTheme';
import { useThemeStore } from '@/stores/useThemeStore';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const preference = useThemeStore((s) => s.preference);
  const [fontsLoaded, fontsError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  const ready = fontsLoaded || fontsError !== null;

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

  return (
    <>
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
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="alert"
          options={{ presentation: 'transparentModal', headerShown: false, animation: 'fade' }}
        />
        <Stack.Screen name="settings/alerts" options={{ title: 'Alert settings' }} />
        <Stack.Screen name="report/[id]" options={{ title: 'Report details' }} />
        <Stack.Screen name="route-preview" options={{ title: 'Route preview' }} />
        <Stack.Screen name="trip/[id]" options={{ title: 'Trip details' }} />
      </Stack>
    </>
  );
}
