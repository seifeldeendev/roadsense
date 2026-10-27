import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import {
  PinMarker,
  RoadMap,
  RouteLine,
  UserMarker,
  type RoadMapHandle,
} from '@/components/map';
import type { PlannedRoute } from '@/domain/entities';
import type { MapFrame } from '@/domain/usecases/drive/fitRegion';

type RouteMapCardProps = {
  route: PlannedRoute;
  frame: MapFrame;
  startHeading: number;
  destinationName: string;
};

export function RouteMapCard({ route, frame, startHeading, destinationName }: RouteMapCardProps) {
  const mapRef = useRef<RoadMapHandle | null>(null);

  useEffect(() => {
    mapRef.current?.fit(route.points);
  }, [route]);

  const last = route.points[route.points.length - 1];

  return (
    <View className="aspect-video overflow-hidden rounded-xl">
      <RoadMap ref={mapRef} initialRegion={frame}>
        <RouteLine remaining={route.points} />
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
