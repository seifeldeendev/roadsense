import { Polyline } from 'react-native-maps';
import type { LatLng as NativeLatLng } from 'react-native-maps';
import type { LatLng } from '@/domain/entities';
import type { SpeedStatus } from '@/domain/usecases/drive/getSpeedStatus';
import { useTheme } from '@/theme/useTheme';

const LINE_WIDTH = 5;

export type RouteSegment = {
  status: SpeedStatus;
  points: LatLng[];
};

type SegmentedRouteLineProps = {
  segments: readonly RouteSegment[];
};

// One polyline per speed-status run; the status colour is the only non-grayscale
// element on the line.
export function SegmentedRouteLine({ segments }: SegmentedRouteLineProps) {
  const { colors } = useTheme();
  return (
    <>
      {segments.map((segment, index) => {
        if (segment.points.length < 2) return null;
        const coordinates: NativeLatLng[] = segment.points.map((point) => ({
          latitude: point.lat,
          longitude: point.lng,
        }));
        return (
          <Polyline
            key={`${segment.status}-${index}`}
            coordinates={coordinates}
            strokeWidth={LINE_WIDTH}
            strokeColor={colors.status[segment.status]}
            lineCap="round"
            lineJoin="round"
          />
        );
      })}
    </>
  );
}
