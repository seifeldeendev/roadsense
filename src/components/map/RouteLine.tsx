import { useMemo } from 'react';
import { Polyline } from 'react-native-maps';
import type { LatLng as RouteLatLng } from 'react-native-maps';
import type { LatLng } from '@/domain/entities';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports -- TODO(map-boundaries): splitRoute is domain logic in a map primitive; pass split segments in
import { splitRoute } from '@/domain/usecases/routes/splitRoute';
import { useTheme } from '@/theme/useTheme';

const LINE_WIDTH = 5;

type RouteLineProps = {
  coordinates: LatLng[];
  progressIndex?: number;
};

export function RouteLine({ coordinates, progressIndex }: RouteLineProps) {
  const { colors } = useTheme();
  const native = useMemo(() => coordinates.map(toNativeCoord), [coordinates]);

  if (native.length < 2) return null;

  const { travelled, ahead } = splitRoute(native, progressIndex);

  return (
    <>
      {travelled.length > 1 ? (
        <Polyline
          coordinates={travelled}
          strokeWidth={LINE_WIDTH}
          strokeColor={colors.mute}
          lineCap="round"
          lineJoin="round"
        />
      ) : null}
      {ahead.length > 1 ? (
        <Polyline
          coordinates={ahead}
          strokeWidth={LINE_WIDTH}
          strokeColor={colors.ink}
          lineCap="round"
          lineJoin="round"
        />
      ) : null}
    </>
  );
}

function toNativeCoord(coordinate: LatLng): RouteLatLng {
  return { latitude: coordinate.lat, longitude: coordinate.lng };
}
