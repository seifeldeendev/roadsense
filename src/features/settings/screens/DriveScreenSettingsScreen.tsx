import { View } from 'react-native';
import { Screen, SectionHeader, ToggleRow } from '@/components/ui';
import { useAppSettingsViewModel, type DriveScreenToggle } from '../viewmodels/useAppSettingsViewModel';

const ITEMS: { key: DriveScreenToggle; label: string; description: string }[] = [
  { key: 'showLimitSign', label: 'Speed limit sign', description: 'The road sign in the top corner' },
  { key: 'showSpeedometer', label: 'Speedometer', description: 'Your current speed in the bottom corner' },
  { key: 'showRoadName', label: 'Road name', description: 'The road you are on, in the bottom bar' },
  { key: 'showAlertsAhead', label: 'Alerts ahead', description: 'How many alerts are coming up' },
];

// Lets the driver hide parts of the Drive screen for a cleaner map.
export default function DriveScreenSettingsScreen() {
  const vm = useAppSettingsViewModel();
  return (
    <Screen scroll>
      <View className="pb-xl pt-lg">
        <View className="gap-sm">
          <SectionHeader title="Show on the Drive screen" subtitle="Turn off anything you don’t want to see" />
          {ITEMS.map(({ key, label, description }) => (
            <ToggleRow
              key={key}
              label={label}
              description={description}
              value={vm.isOn(key)}
              onValueChange={(on) => vm.setOn(key, on)}
            />
          ))}
        </View>
      </View>
    </Screen>
  );
}
