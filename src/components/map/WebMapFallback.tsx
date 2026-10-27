import { useImperativeHandle, type Ref } from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// eslint-disable-next-line import/no-restricted-paths -- TODO(map-boundaries): decide whether shared presentation may use the UI kit
import { AppText } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';
import type { RoadMapHandle } from './RoadMap';
import type { MapFrame } from '@/domain/usecases/drive/fitRegion';

type RoadMapProps = {
  ref?: Ref<RoadMapHandle>;
  // The placeholder shows no map, so region changes are nowhere to come from.
  onRegionChange?: (region: MapFrame) => void;
};

export function RoadMap({ ref }: RoadMapProps) {
  const { colors } = useTheme();
  useImperativeHandle(ref, () => ({ fit: () => undefined }), []);

  return (
    <View
      className="absolute inset-0 items-center justify-center gap-sm bg-canvas-soft"
      accessibilityLabel="Map is available in the mobile app"
    >
      <MaterialCommunityIcons name="map-outline" size={32} color={colors.body} />
      <AppText variant="bodySm" color="body">
        The live map runs in the mobile app
      </AppText>
    </View>
  );
}

type OverlayProps = {
  onPress?: () => void;
  onCalloutPress?: () => void;
};

function NoOverlay(_props: OverlayProps) {
  return null;
}

export const CameraMarker = NoOverlay;
export const HazardMarker = NoOverlay;
export const UserMarker = NoOverlay;
export const RouteLine = NoOverlay;
export const PinMarker = NoOverlay;
