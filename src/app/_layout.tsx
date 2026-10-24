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
import { colors, typography } from '@/theme/tokens';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.canvas },
          headerTintColor: colors.ink,
          headerTitleStyle: {
            fontFamily: typography.displaySm.fontFamily,
            fontSize: typography.displaySm.fontSize,
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
