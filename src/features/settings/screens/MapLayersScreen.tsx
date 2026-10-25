import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { AppText, Screen, SectionHeader, SegmentedControl, ToggleRow } from '@/components/ui';
import type { AlertTarget } from '@/domain/entities';
import { hazardMeta, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { useAppSettingsViewModel } from '../viewmodels/useAppSettingsViewModel';

const LOCATION_SEGMENTS = [
  { label: 'GPS', value: 'gps' },
  { label: 'Demo drive', value: 'demo' },
] as const;

const LAYERS: { target: AlertTarget; label: string }[] = [
  { target: 'camera', label: 'Speed cameras' },
  { target: 'police', label: 'Police' },
  { target: 'bump', label: 'Speed bumps' },
  { target: 'accident', label: 'Accidents' },
  { target: 'pothole', label: 'Potholes' },
  { target: 'checkpoint', label: 'Checkpoints' },
  { target: 'flooding', label: 'Flooding' },
];

export default function MapLayersScreen() {
  const vm = useAppSettingsViewModel();
  const { colors } = useTheme();
  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.section}>
          <SectionHeader title="Location" />
          <SegmentedControl options={LOCATION_SEGMENTS} value={vm.locationSource} onChange={vm.setLocationSource} />
          <AppText variant="bodySm" color="body">
            {vm.locationSource === 'gps'
              ? 'Uses your phone’s real position, speed and heading'
              : 'Plays the recorded Salah Salem drive, for testing indoors'}
          </AppText>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Map display" />
          <ToggleRow label="Satellite view" value={vm.satellite} onValueChange={vm.setSatellite} />
          <ToggleRow label="Show traffic" value={vm.showTraffic} onValueChange={vm.setShowTraffic} />
          <ToggleRow
            label="Keep north up"
            description="Otherwise the map turns with your direction of travel"
            value={vm.northUp}
            onValueChange={vm.setNorthUp}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Show on map" subtitle="Hidden items still alert you unless you turn them off in Alerts" />
          {LAYERS.map(({ target, label }) => (
            <ToggleRow
              key={target}
              label={label}
              value={vm.isShownOnMap(target)}
              onValueChange={() => vm.toggleShownOnMap(target)}
              icon={<MaterialCommunityIcons name={hazardMeta[target].icon} size={20} color={colors.ink} />}
            />
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xxxl, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  section: { gap: spacing.sm },
});
