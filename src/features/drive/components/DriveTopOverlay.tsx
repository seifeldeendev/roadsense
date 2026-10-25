import { StyleSheet, View } from 'react-native';
import type { SoundMode } from '@/domain/entities';
import { spacing } from '@/theme/tokens';
import { soundModeIcon } from './DriveSettingsSheets';
import { DriveTopBar } from './DriveTopBar';
import { LimitBadge } from './LimitBadge';
import { MapFab } from './MapFab';

type DriveTopOverlayProps = {
  topInset: number;
  showSearch: boolean;
  limitKmh: number | null;
  over: boolean;
  soundMode: SoundMode;
  onGoTo: () => void;
  onOpenSettings: () => void;
  onSound: () => void;
  onOptions: () => void;
  onRecentre: () => void;
};

// Search bar, speed-limit sign and the right-hand column of round map controls.
export function DriveTopOverlay(props: DriveTopOverlayProps) {
  return (
    <View pointerEvents="box-none" style={[styles.top, { paddingTop: props.topInset + spacing.md }]}>
      {props.showSearch ? <DriveTopBar onGoTo={props.onGoTo} onOpenSettings={props.onOpenSettings} /> : null}
      <View pointerEvents="box-none" style={styles.row}>
        <LimitBadge limitKmh={props.limitKmh} size="sm" over={props.over} />
        <View style={styles.fabColumn}>
          <MapFab icon={soundModeIcon(props.soundMode)} accessibilityLabel="Sound" onPress={props.onSound} />
          <MapFab icon="layers-outline" accessibilityLabel="Other options" onPress={props.onOptions} />
          <MapFab icon="crosshairs-gps" accessibilityLabel="Recentre map" onPress={props.onRecentre} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', top: 0, left: spacing.lg, right: spacing.lg, gap: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  fabColumn: { gap: spacing.md },
});
