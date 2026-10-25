import { Marker } from 'react-native-maps';
import type { CameraType } from '@/domain/entities';
import { fixedPointIcon } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { MarkerCanvas, useTracksViewChanges } from './MarkerCanvas';

const TYPE_LABEL: Record<CameraType, string> = {
  fixed: 'Speed camera',
  average: 'Average speed camera',
  red_light: 'Red light camera',
  police: 'Police',
  speed_bump: 'Speed bump',
  bump_zone: 'Speed bump zone',
};

type CameraMarkerProps = {
  lat: number;
  lng: number;
  roadName: string;
  speedLimitKmh: number;
  type?: CameraType;
  dimmed?: boolean;
  onPress?: () => void;
  onCalloutPress?: () => void;
};

// A fixed road point from the database: speed camera, police post or speed bump.
export function CameraMarker({
  lat,
  lng,
  roadName,
  speedLimitKmh,
  type = 'fixed',
  dimmed = false,
  onPress,
  onCalloutPress,
}: CameraMarkerProps) {
  const { scheme } = useTheme();
  const tracksViewChanges = useTracksViewChanges(`${scheme}-${dimmed}`);
  const label = TYPE_LABEL[type];
  // Bumps carry no limit (0), so the limit is only shown when there is one.
  const details = [roadName, speedLimitKmh > 0 ? `${speedLimitKmh} km/h` : null].filter(Boolean).join(' · ');
  return (
    <Marker
      coordinate={{ latitude: lat, longitude: lng }}
      title={label}
      description={details}
      tracksViewChanges={tracksViewChanges}
      onPress={onPress}
      onCalloutPress={onCalloutPress}
    >
      <MarkerCanvas icon={fixedPointIcon[type]} dimmed={dimmed} accessibilityLabel={`${label}, ${details}`} />
    </Marker>
  );
}
