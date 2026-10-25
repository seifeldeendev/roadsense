import { StyleSheet, View } from 'react-native';
import { AppText, SectionHeader, SegmentedControl, ToggleRow } from '@/components/ui';
import { SPEED_ALARM_OPTIONS } from '@/shared/constants';
import { spacing } from '@/theme/tokens';
import type { DisplaySettingsViewModel, SpeedAlarmChoice } from '../viewmodels/useDisplaySettingsViewModel';
import { SoundModeList } from './DriveSettingsSheets';

const LOCATION_SEGMENTS = [
  { label: 'GPS', value: 'gps' },
  { label: 'Demo drive', value: 'demo' },
] as const;

const SPEED_ALARM_SEGMENTS: readonly { label: string; value: SpeedAlarmChoice }[] = [
  { label: 'Off', value: 0 },
  ...SPEED_ALARM_OPTIONS.map((kmh) => ({ label: `${kmh}`, value: kmh })),
];

// Sound, map display and speed alarm — the same options the Drive screen's sheets set.
export function DisplaySettingsSections({ vm }: { vm: DisplaySettingsViewModel }) {
  return (
    <>
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
        <SectionHeader title="Sound" />
        <SoundModeList soundMode={vm.soundMode} onChoose={vm.setSoundMode} />
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
        <ToggleRow label="Show road name" value={vm.showRoadName} onValueChange={vm.setShowRoadName} />
      </View>

      <View style={styles.section}>
        <SectionHeader title="Speed alarm" />
        <SegmentedControl options={SPEED_ALARM_SEGMENTS} value={vm.speedAlarm} onChange={vm.setSpeedAlarm} />
        <AppText variant="bodySm" color="body">
          {vm.speedAlarm === 0
            ? 'Warns you above a speed you choose, whatever the road limit'
            : `You'll be warned once each time you go above ${vm.speedAlarm} km/h`}
        </AppText>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
});
