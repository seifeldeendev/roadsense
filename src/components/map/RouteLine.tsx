import { useMemo } from 'react';
import { Polyline } from 'react-native-maps';
import type { LatLng as RouteLatLng } from 'react-native-maps';
import type { LatLng } from '@/domain/entities';
import { useTheme } from '@/theme/useTheme';

const LINE_WIDTH = 5;

type RouteLineProps = {
  // The part already driven (drawn muted) and the part still ahead; they share
  // the split point so the two lines join.
  driven?: LatLng[];
  remaining: LatLng[];
};

const NONE: LatLng[] = [];

export function RouteLine({ driven = NONE, remaining }: RouteLineProps) {
  const { colors } = useTheme();
  const travelled = useMemo(() => driven.map(toNativeCoord), [driven]);
  const ahead = useMemo(() => remaining.map(toNativeCoord), [remaining]);

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
