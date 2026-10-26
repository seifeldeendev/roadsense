import { View } from 'react-native';
import type { Destination, SoundMode } from '@/domain/entities';
import type { PlaceItem } from '../viewmodels/useTripPlannerViewModel';
import { spacing } from '@/theme/tokens';
import { soundModeIcon } from './DriveSettingsSheets';
import { DriveTopBar } from './DriveTopBar';
import { LimitBadge } from './LimitBadge';
import { MapFab } from './MapFab';
import { QuickPlaces } from './QuickPlaces';

type DriveTopOverlayProps = {
  topInset: number;
  showSearch: boolean;
  // One-tap destinations under the search pill (empty while driving).
  quickPlaces: PlaceItem[];
  onChoosePlace: (place: Destination) => void;
  showLimitSign: boolean;
  limitKmh: number | null;
  over: boolean;
  soundMode: SoundMode;
  onGoTo: () => void;
  onSound: () => void;
  onOptions: () => void;
  onRecentre: () => void;
};

// Search bar with quick places, speed-limit sign and the right-hand column of
// round map controls.
export function DriveTopOverlay(props: DriveTopOverlayProps) {
  return (
    <View pointerEvents="box-none" className="absolute left-lg right-lg top-0 gap-md" style={{ paddingTop: props.topInset + spacing.md }}>
      {props.showSearch ? <DriveTopBar onGoTo={props.onGoTo} /> : null}
      {props.showSearch ? <QuickPlaces places={props.quickPlaces} onChoose={props.onChoosePlace} /> : null}
      <View pointerEvents="box-none" className="flex-row items-start justify-between">
        {props.showLimitSign ? <LimitBadge limitKmh={props.limitKmh} size="sm" over={props.over} /> : <View />}
        <View className="gap-md">
          <MapFab icon={soundModeIcon(props.soundMode)} accessibilityLabel="Sound" onPress={props.onSound} />
          <MapFab icon="layers-outline" accessibilityLabel="Other options" onPress={props.onOptions} />
          <MapFab icon="crosshairs-gps" accessibilityLabel="Recentre map" onPress={props.onRecentre} />
        </View>
      </View>
    </View>
  );
}
