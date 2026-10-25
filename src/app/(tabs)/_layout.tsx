import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import { StyleSheet, type ColorValue } from 'react-native';
import { nativeTypography, spacing, type HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

function TabIcon({ icon, color, size }: { icon: HazardIconName; color: ColorValue | null; size: number }) {
  return (
    <MaterialCommunityIcons
      name={icon}
      color={typeof color === 'string' ? color : undefined}
      size={size}
    />
  );
}

const TAB_ICONS: Record<string, HazardIconName> = {
  drive: 'steering',
  map: 'map-outline',
  trips: 'history',
  stats: 'chart-bar',
  account: 'account-circle-outline',
};

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.mute,
        tabBarStyle: {
          backgroundColor: colors.canvas,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.hairline,
          paddingTop: spacing.xxs,
        },
        tabBarLabelStyle: {
          ...nativeTypography.tabLabel,
          paddingVertical: spacing.xs,
        },
      }}
    >
      <Tabs.Screen
        name="drive"
        options={{ title: 'Drive', tabBarIcon: ({ color, size }) => <TabIcon icon={TAB_ICONS.drive} color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="map"
        options={{ title: 'Map', tabBarIcon: ({ color, size }) => <TabIcon icon={TAB_ICONS.map} color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="trips"
        options={{ title: 'Trips', tabBarIcon: ({ color, size }) => <TabIcon icon={TAB_ICONS.trips} color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="stats"
        options={{ title: 'Stats', tabBarIcon: ({ color, size }) => <TabIcon icon={TAB_ICONS.stats} color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: 'Account', tabBarIcon: ({ color, size }) => <TabIcon icon={TAB_ICONS.account} color={color} size={size} /> }}
      />
    </Tabs>
  );
}
