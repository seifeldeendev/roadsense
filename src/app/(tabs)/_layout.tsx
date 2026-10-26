import { Tabs } from 'expo-router/js-tabs';
import { GlassTabBar, type TabIcons } from '@/components/navigation';

const TAB_ICONS: TabIcons = {
  drive: { active: 'steering', inactive: 'steering' },
  map: { active: 'map', inactive: 'map-outline' },
  trips: { active: 'history', inactive: 'history' },
  stats: { active: 'chart-box', inactive: 'chart-box-outline' },
  account: { active: 'account-circle', inactive: 'account-circle-outline' },
};

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} icons={TAB_ICONS} />}
      // The bar floats over the screens, so content (the Drive map) runs underneath it.
      screenOptions={{ headerShown: false, tabBarStyle: { position: 'absolute' } }}
    >
      <Tabs.Screen name="drive" options={{ title: 'Drive' }} />
      <Tabs.Screen name="map" options={{ title: 'Map' }} />
      <Tabs.Screen name="trips" options={{ title: 'Trips' }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats' }} />
      <Tabs.Screen name="account" options={{ title: 'Account' }} />
    </Tabs>
  );
}
