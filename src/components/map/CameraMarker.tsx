import { Marker } from 'react-native-maps';
import { hazardMeta } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { MarkerCanvas, useTracksViewChanges } from './MarkerCanvas';

type CameraMarkerProps = {
  lat: number;
  lng: number;
  roadName: string;
  speedLimitKmh: number;
  dimmed?: boolean;
  onPress?: () => void;
  onCalloutPress?: () => void;
};

export function CameraMarker({
  lat,
  lng,
  roadName,
  speedLimitKmh,
  dimmed = false,
  onPress,
  onCalloutPress,
}: CameraMarkerProps) {
  const { scheme } = useTheme();
  const tracksViewChanges = useTracksViewChanges(`${scheme}-${dimmed}`);
  return (
    <Marker
      coordinate={{ latitude: lat, longitude: lng }}
      title="Speed camera"
      description={`${roadName} · ${speedLimitKmh} km/h`}
      tracksViewChanges={tracksViewChanges}
      onPress={onPress}
      onCalloutPress={onCalloutPress}
    >
      <MarkerCanvas
        icon={hazardMeta.camera.icon}
        dimmed={dimmed}
        accessibilityLabel={`Speed camera, ${roadName}, ${speedLimitKmh} km/h`}
      />
    </Marker>
  );
}
