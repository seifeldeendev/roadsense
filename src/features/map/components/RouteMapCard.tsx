import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  PinMarker,
  RoadMap,
  RouteLine,
  UserMarker,
  type RoadMapHandle,
} from '@/components/map';
import type { PlannedRoute } from '@/domain/entities';
import type { MapFrame } from '@/domain/usecases/drive/fitRegion';
import { rounded } from '@/theme/tokens';
import { useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';

type RouteMapCardProps = {
  route: PlannedRoute;
  frame: MapFrame;
  startHeading: number;
  destinationName: string;
};

export function RouteMapCard({ route, frame, startHeading, destinationName }: RouteMapCardProps) {
  const styles = useThemedStyles(routeMapCardStyles, undefined);
  const mapRef = useRef<RoadMapHandle | null>(null);

  useEffect(() => {
    mapRef.current?.fit(route.points);
  }, [route]);

  const last = route.points[route.points.length - 1];

  return (
    <View style={styles.frame}>
      <RoadMap ref={mapRef} initialRegion={frame}>
        <RouteLine coordinates={route.points} />
        <UserMarker lat={route.points[0].lat} lng={route.points[0].lng} heading={startHeading} />
        <PinMarker
          lat={last.lat}
          lng={last.lng}
          accessibilityLabel={`Destination ${destinationName}`}
        />
      </RoadMap>
    </View>
  );
}

function routeMapCardStyles(_theme: ResolvedTheme) {
  return StyleSheet.create({
    frame: {
      aspectRatio: 16 / 9,
      borderRadius: rounded.xl,
      overflow: 'hidden',
    },
  });
}
