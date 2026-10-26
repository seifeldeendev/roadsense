import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import {
  AppText,
} from '@/components/ui';
import {
  CameraMarker,
  HazardMarker,
  PinMarker,
  RoadMap,
  SegmentedRouteLine,
  UserMarker,
  type RoadMapHandle,
  type RouteSegment,
} from '@/components/map';
import type { Trip } from '@/domain/entities';
import type { MapFrame } from '@/domain/usecases/drive/fitRegion';
import { useTheme } from '@/theme/useTheme';
import type { AlertMarkerModel } from '../viewmodels/useTripDetailsViewModel';


// Status colours are the one allowed accent; they mark speed on the route line.
const LEGEND_ITEMS = [
  { status: 'ok', label: 'Within limit', swatch: 'bg-status-ok' },
  { status: 'near', label: 'Near', swatch: 'bg-status-near' },
  { status: 'over', label: 'Over', swatch: 'bg-status-over' },
] as const;

type TripMapCardProps = {
  trip: Trip;
  segments: RouteSegment[];
  alertMarkers: AlertMarkerModel[];
  frame: MapFrame;
};

export function TripMapCard({ trip, segments, alertMarkers, frame }: TripMapCardProps) {
  const { scheme } = useTheme();
  const mapRef = useRef<RoadMapHandle | null>(null);

  useEffect(() => {
    mapRef.current?.fit(trip.points);
  }, [trip]);

  const firstPoint = trip.points[0];
  const lastPoint = trip.points[trip.points.length - 1];

  return (
    // Map tiles clip against the rounding, so dark keeps a hairline edge.
    <View className={`aspect-video overflow-hidden rounded-xl border-hairline ${scheme === 'dark' ? 'border' : ''}`}>
      <RoadMap ref={mapRef} initialRegion={frame}>
        <SegmentedRouteLine segments={segments} />
        {firstPoint !== undefined && (
          <UserMarker lat={firstPoint.lat} lng={firstPoint.lng} heading={firstPoint.heading} />
        )}
        {lastPoint !== undefined && lastPoint !== firstPoint && (
          <PinMarker lat={lastPoint.lat} lng={lastPoint.lng} accessibilityLabel="Trip end" />
        )}
        {alertMarkers.map((marker) =>
          marker.kind === 'camera' ? (
            <CameraMarker
              key={marker.id}
              lat={marker.lat}
              lng={marker.lng}
              roadName={marker.roadName}
              speedLimitKmh={marker.speedLimitKmh}
              type={marker.cameraType}
            />
          ) : (
            <HazardMarker
              key={marker.id}
              lat={marker.lat}
              lng={marker.lng}
              kind={marker.hazardType}
            />
          ),
        )}
      </RoadMap>
    </View>
  );
}

export function TripMapLegend() {
  return (
    <View className="flex-row gap-lg">
      {LEGEND_ITEMS.map((item) => (
        <View key={item.status} className="flex-row items-center gap-sm">
          <View className={`h-2.5 w-2.5 rounded-full ${item.swatch}`} />
          <AppText variant="bodySm" color="body">
            {item.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}
