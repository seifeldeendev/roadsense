import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import '../../global.css';
import { nativeTypography } from '@/theme/tokens';
import { themeVars } from '@/theme/cssVars';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { useTheme } from '@/theme/useTheme';
import { AppDependenciesProvider } from '@/composition/AppDependenciesProvider';
import { SessionGate } from '@/features/auth/components/SessionGate';
import { useSessionGateViewModel } from '@/features/auth/viewmodels/useSessionGateViewModel';
import { useThemePreference } from '@/features/settings/viewmodels/useAppSettingsViewModel';
import { BrandSplash } from '@/features/onboarding/screens/BrandSplash';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  return (
    <AppDependenciesProvider>
      <SessionGate ready={fontsLoaded || fontsError !== null}>
        <ThemedRoot />
      </SessionGate>
    </AppDependenciesProvider>
  );
}

// Inside the providers, so the saved preference comes from the app's stores.
function ThemedRoot() {
  const preference = useThemePreference();
  return (
    <ThemeProvider preference={preference}>
      <ThemedChrome />
    </ThemeProvider>
  );
}

function ThemedChrome() {
  const { colors, scheme } = useTheme();
  const access = useSessionGateViewModel();
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
        <Stack.Protected guard={access.canOnboard}>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={access.canSignIn}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={access.canUseApp}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="alert"
            options={{ presentation: 'transparentModal', headerShown: false, animation: 'fade' }}
          />
          <Stack.Screen name="settings/profile" options={{ title: 'Profile' }} />
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
