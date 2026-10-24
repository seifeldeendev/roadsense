import { Marker } from 'react-native-maps';
import type { HazardType } from '@/domain/entities';
import { hazardMeta } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { MarkerCanvas, useTracksViewChanges } from './MarkerCanvas';

type HazardMarkerProps = {
  lat: number;
  lng: number;
  kind: HazardType;
  dimmed?: boolean;
};

export function HazardMarker({ lat, lng, kind, dimmed = false }: HazardMarkerProps) {
  const { scheme } = useTheme();
  const tracksViewChanges = useTracksViewChanges(`${scheme}-${dimmed}`);
  return (
    <Marker
      coordinate={{ latitude: lat, longitude: lng }}
      title={hazardMeta[kind].label}
      tracksViewChanges={tracksViewChanges}
    >
      <MarkerCanvas
        icon={hazardMeta[kind].icon}
        dimmed={dimmed}
        accessibilityLabel={hazardMeta[kind].label}
      />
    </Marker>
  );
}
