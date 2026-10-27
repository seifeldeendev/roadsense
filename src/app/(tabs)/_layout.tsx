import { Tabs } from 'expo-router/js-tabs';
import { Text } from 'react-native';
import { colors, spacing, typography } from '@/theme/tokens';

type TabIconProps = {
  emoji: string;
  size: number;
};

function TabIcon({ emoji, size }: TabIconProps) {
  return <Text style={{ fontSize: size, lineHeight: size }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingTop: spacing.xs,
        },
        tabBarLabelStyle: {
          fontSize: typography.size.caption,
          fontWeight: '600',
          paddingVertical: spacing.xs,
        },
      }}
    >
      <Tabs.Screen
        name="drive"
        options={{ title: 'Drive', tabBarIcon: ({ size }) => <TabIcon emoji="🚗" size={size} /> }}
      />
      <Tabs.Screen
        name="map"
        options={{ title: 'Map', tabBarIcon: ({ size }) => <TabIcon emoji="🗺️" size={size} /> }}
      />
      <Tabs.Screen
        name="trips"
        options={{ title: 'Trips', tabBarIcon: ({ size }) => <TabIcon emoji="🧭" size={size} /> }}
      />
      <Tabs.Screen
        name="stats"
        options={{ title: 'Stats', tabBarIcon: ({ size }) => <TabIcon emoji="📊" size={size} /> }}
      />
    </Tabs>
  );
}
