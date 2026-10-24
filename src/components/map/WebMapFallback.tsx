import { useImperativeHandle, type Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { RoadMapHandle } from './RoadMap';

type RoadMapProps = {
  ref?: Ref<RoadMapHandle>;
};

export function RoadMap({ ref }: RoadMapProps) {
  const { colors } = useTheme();
  useImperativeHandle(ref, () => ({ fit: () => undefined }), []);

  return (
    <View
      style={[styles.fill, { backgroundColor: colors.canvasSoft }]}
      accessibilityLabel="Map is available in the mobile app"
    >
      <MaterialCommunityIcons name="map-outline" size={32} color={colors.body} />
      <AppText variant="bodySm" color="body">
        The live map runs in the mobile app
      </AppText>
    </View>
  );
}

function NoOverlay(_props: object) {
  return null;
}

export const CameraMarker = NoOverlay;
export const HazardMarker = NoOverlay;
export const UserMarker = NoOverlay;
export const RouteLine = NoOverlay;

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
