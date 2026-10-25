import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { rounded, spacing } from '@/theme/tokens';
import { useTheme, useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';
import type { AlertMarkerModel } from '../viewmodels/useTripDetailsViewModel';

const ASPECT_16_9 = 16 / 9;
const SWATCH_SIZE = 10;

const LEGEND_ITEMS: { status: 'ok' | 'near' | 'over'; label: string }[] = [
  { status: 'ok', label: 'Within limit' },
  { status: 'near', label: 'Near' },
  { status: 'over', label: 'Over' },
];

type TripMapCardProps = {
  trip: Trip;
  segments: RouteSegment[];
  alertMarkers: AlertMarkerModel[];
  frame: MapFrame;
};

export function TripMapCard({ trip, segments, alertMarkers, frame }: TripMapCardProps) {
  const styles = useThemedStyles(mapStyles, undefined);
  const mapRef = useRef<RoadMapHandle | null>(null);

  useEffect(() => {
    mapRef.current?.fit(trip.points);
  }, [trip]);

  const firstPoint = trip.points[0];
  const lastPoint = trip.points[trip.points.length - 1];

  return (
    <View style={styles.frame}>
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
  const { colors } = useTheme();
  return (
    <View style={legendStyles.row}>
      {LEGEND_ITEMS.map((item) => (
        <View key={item.status} style={legendStyles.item}>
          <View
            style={[legendStyles.swatch, { backgroundColor: colors.status[item.status] }]}
          />
          <AppText variant="bodySm" color="body">
            {item.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function mapStyles(theme: ResolvedTheme) {
  return StyleSheet.create({
    frame: {
      aspectRatio: ASPECT_16_9,
      borderRadius: rounded.xl,
      overflow: 'hidden',
      // Map tiles clip against the rounding, so dark keeps a hairline edge.
      borderWidth: theme.scheme === 'dark' ? 1 : 0,
      borderColor: theme.colors.hairline,
    },
  });
}

const legendStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_SIZE / 2,
  },
});
