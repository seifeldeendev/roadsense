import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors, typography } from '@/theme/tokens';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: '700', fontSize: typography.size.title },
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
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
