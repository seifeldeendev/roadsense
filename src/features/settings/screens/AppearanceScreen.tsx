import { StyleSheet, View } from 'react-native';
import { RadioList, Screen, SectionHeader } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { useAppSettingsViewModel, type AppSettingsViewModel } from '../viewmodels/useAppSettingsViewModel';

type ThemePreference = AppSettingsViewModel['themePreference'];

const THEMES: { value: ThemePreference; label: string; icon: 'theme-light-dark' | 'white-balance-sunny' | 'weather-night' }[] = [
  { value: 'system', label: 'Same as phone', icon: 'theme-light-dark' },
  { value: 'light', label: 'Light', icon: 'white-balance-sunny' },
  { value: 'dark', label: 'Dark', icon: 'weather-night' },
];

export default function AppearanceScreen() {
  const vm = useAppSettingsViewModel();
  return (
    <Screen scroll>
      <View style={styles.container}>
        <SectionHeader title="Theme" />
        <RadioList options={THEMES} value={vm.themePreference} onChange={vm.setThemePreference} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm, paddingTop: spacing.lg, paddingBottom: spacing.xl },
});
