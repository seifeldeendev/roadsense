/// <reference types="google.maps" />
import { useEffect, useImperativeHandle, type ReactNode, type Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AdvancedMarker, APIProvider, Map, Polyline, useMap } from '@vis.gl/react-google-maps';
import type { CameraType, HazardType, LatLng } from '@/domain/entities';
import type { MapFrame } from '@/domain/usecases/drive/fitRegion';
import { fixedPointIcon, hazardMeta, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { MarkerCanvas } from './MarkerCanvas';
import type { FollowPoint, RoadMapHandle } from './RoadMap';
import type { RouteSegment } from './SegmentedRouteLine';

// Web builds draw the same maps with the Google Maps JavaScript API, using the
// EXPO_PUBLIC_GOOGLE_MAPS_KEY the native builds use.
export const webMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? '';
// Advanced markers need a map id; Google's demo id works until a styled
// (grayscale) cloud map id is set in EXPO_PUBLIC_GOOGLE_MAPS_MAP_ID.
const mapId = process.env.EXPO_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

const LINE_WIDTH = 5;
const DRIVE_TILT = 45;
const DRIVE_ZOOM = 16;
const FIT_PADDING = spacing.xxxl;
const CENTRED = { anchorLeft: '-50%', anchorTop: '-50%' } as const;

// Latitude/longitude span to a Google zoom level (256px tiles cover 360° at zoom 0).
function zoomFor(frame: MapFrame): number {
  const zoom = Math.log2(360 / Math.max(frame.longitudeDelta, 0.0005));
  return Math.min(20, Math.max(3, Math.round(zoom)));
}

type RoadMapProps = {
  initialRegion?: MapFrame;
  region?: MapFrame;
  children?: ReactNode;
  followPoint?: FollowPoint | null;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  rotateEnabled?: boolean;
  mapType?: 'standard' | 'satellite';
  showsTraffic?: boolean;
  northUp?: boolean;
  onCenterChange?: (center: { lat: number; lng: number }) => void;
  onRegionChange?: (region: MapFrame) => void;
  ref?: Ref<RoadMapHandle>;
};

export function RoadMap({
  initialRegion,
  region,
  children,
  followPoint = null,
  scrollEnabled = true,
  zoomEnabled = true,
  mapType = 'standard',
  showsTraffic = false,
  northUp = false,
  onCenterChange,
  onRegionChange,
  ref,
}: RoadMapProps) {
  const { scheme } = useTheme();
  const start = initialRegion ?? region;
  return (
    <APIProvider apiKey={webMapsKey}>
      <View style={StyleSheet.absoluteFill}>
        <Map
          mapId={mapId}
          colorScheme={scheme === 'dark' ? 'DARK' : 'LIGHT'}
          defaultCenter={start ? { lat: start.latitude, lng: start.longitude } : { lat: 30.0444, lng: 31.2357 }}
          defaultZoom={start ? zoomFor(start) : 12}
          mapTypeId={mapType === 'satellite' ? 'hybrid' : 'roadmap'}
          gestureHandling={scrollEnabled || zoomEnabled ? 'greedy' : 'none'}
          disableDefaultUI
          clickableIcons={false}
          onIdle={
            onCenterChange === undefined && onRegionChange === undefined
              ? undefined
              : (event) => {
                  const center = event.map.getCenter();
                  if (center && onCenterChange !== undefined) onCenterChange({ lat: center.lat(), lng: center.lng() });
                  if (onRegionChange === undefined) return;
                  // The JS API exposes the visible area as lat/lng bounds.
                  const bounds = event.map.getBounds();
                  if (bounds == null) return;
                  const northEast = bounds.getNorthEast();
                  const southWest = bounds.getSouthWest();
                  onRegionChange({
                    latitude: (northEast.lat() + southWest.lat()) / 2,
                    longitude: (northEast.lng() + southWest.lng()) / 2,
                    latitudeDelta: northEast.lat() - southWest.lat(),
                    longitudeDelta: northEast.lng() - southWest.lng(),
                  });
                }
          }
          style={{ width: '100%', height: '100%' }}
        >
          <MapController handleRef={ref} region={region} followPoint={followPoint} northUp={northUp} showsTraffic={showsTraffic} />
          {children}
        </Map>
      </View>
    </APIProvider>
  );
}

type MapControllerProps = {
  handleRef?: Ref<RoadMapHandle>;
  region?: MapFrame;
  followPoint: FollowPoint | null;
  northUp: boolean;
  showsTraffic: boolean;
};

// Imperative side of the map: fit(), controlled region, drive-follow camera, traffic.
function MapController({ handleRef, region, followPoint, northUp, showsTraffic }: MapControllerProps) {
  const map = useMap();

  useImperativeHandle(
    handleRef,
    () => ({
      fit: (coordinates) => {
        if (map === null || coordinates.length === 0) return;
        if (coordinates.length === 1) {
          map.panTo(coordinates[0]);
          map.setZoom(DRIVE_ZOOM);
          return;
        }
        const bounds = new google.maps.LatLngBounds();
        coordinates.forEach((c) => bounds.extend(c));
        map.fitBounds(bounds, FIT_PADDING);
      },
    }),
    [map],
  );

  const regionLat = region?.latitude;
  const regionLng = region?.longitude;
  const regionZoom = region ? zoomFor(region) : undefined;
  useEffect(() => {
    if (map === null || regionLat === undefined || regionLng === undefined) return;
    map.moveCamera({ center: { lat: regionLat, lng: regionLng }, zoom: regionZoom });
  }, [map, regionLat, regionLng, regionZoom]);

  const lat = followPoint?.lat ?? null;
  const lng = followPoint?.lng ?? null;
  const heading = followPoint?.heading ?? null;
  useEffect(() => {
    if (map === null || lat === null || lng === null || heading === null) return;
    map.moveCamera({ center: { lat, lng }, heading: northUp ? 0 : heading, tilt: DRIVE_TILT, zoom: DRIVE_ZOOM });
  }, [map, lat, lng, heading, northUp]);

  useEffect(() => {
    if (map === null || !showsTraffic) return;
    const layer = new google.maps.TrafficLayer();
    layer.setMap(map);
    return () => layer.setMap(null);
  }, [map, showsTraffic]);

  return null;
}

const CAMERA_LABEL: Record<CameraType, string> = {
  fixed: 'Speed camera',
  average: 'Average speed camera',
  red_light: 'Red light camera',
  police: 'Police',
  speed_bump: 'Speed bump',
  bump_zone: 'Speed bump zone',
};

type CameraMarkerProps = {
  lat: number;
  lng: number;
  roadName: string;
  speedLimitKmh: number;
  type?: CameraType;
  dimmed?: boolean;
  onPress?: () => void;
  onCalloutPress?: () => void;
};

export function CameraMarker({ lat, lng, roadName, speedLimitKmh, type = 'fixed', dimmed = false, onPress, onCalloutPress }: CameraMarkerProps) {
  const label = CAMERA_LABEL[type];
  const details = [roadName, speedLimitKmh > 0 ? `${speedLimitKmh} km/h` : null].filter(Boolean).join(' · ');
  return (
    <AdvancedMarker position={{ lat, lng }} title={`${label} · ${details}`} onClick={onPress ?? onCalloutPress} {...CENTRED}>
      <MarkerCanvas icon={fixedPointIcon[type]} dimmed={dimmed} accessibilityLabel={`${label}, ${details}`} />
    </AdvancedMarker>
  );
}

type HazardMarkerProps = {
  lat: number;
  lng: number;
  kind: HazardType;
  dimmed?: boolean;
  onPress?: () => void;
  onCalloutPress?: () => void;
};

// Web has no callouts, so a click goes straight to the callout action.
export function HazardMarker({ lat, lng, kind, dimmed = false, onPress, onCalloutPress }: HazardMarkerProps) {
  return (
    <AdvancedMarker position={{ lat, lng }} title={hazardMeta[kind].label} onClick={onCalloutPress ?? onPress} {...CENTRED}>
      <MarkerCanvas icon={hazardMeta[kind].icon} dimmed={dimmed} accessibilityLabel={hazardMeta[kind].label} />
    </AdvancedMarker>
  );
}

export function UserMarker({ lat, lng, heading }: { lat: number; lng: number; heading: number }) {
  const { colors } = useTheme();
  return (
    <AdvancedMarker position={{ lat, lng }} {...CENTRED}>
      <View
        accessibilityLabel="Your position"
        style={[styles.bubble, { width: 36, height: 36, backgroundColor: colors.ink, transform: [{ rotate: `${heading}deg` }] }]}
      >
        <MaterialCommunityIcons name="navigation" size={22} color={colors.onPrimary} />
      </View>
    </AdvancedMarker>
  );
}

type PinMarkerProps = { lat: number; lng: number; accessibilityLabel: string; onPress?: () => void };

export function PinMarker({ lat, lng, accessibilityLabel, onPress }: PinMarkerProps) {
  const { colors } = useTheme();
  return (
    <AdvancedMarker position={{ lat, lng }} title={accessibilityLabel} onClick={onPress} {...CENTRED}>
      <View accessibilityLabel={accessibilityLabel} style={[styles.bubble, { width: 32, height: 32, backgroundColor: colors.ink }]}>
        <MaterialCommunityIcons name="flag-checkered" size={18} color={colors.onPrimary} />
      </View>
    </AdvancedMarker>
  );
}

export function RouteLine({ driven: travelled = [], remaining: ahead }: { driven?: LatLng[]; remaining: LatLng[] }) {
  const { colors } = useTheme();
  return (
    <>
      {travelled.length > 1 ? <Polyline path={travelled} strokeColor={colors.mute} strokeWeight={LINE_WIDTH} /> : null}
      {ahead.length > 1 ? <Polyline path={ahead} strokeColor={colors.ink} strokeWeight={LINE_WIDTH} /> : null}
    </>
  );
}

// One line per speed-status run; the status colour is the line's only accent.
export function SegmentedRouteLine({ segments }: { segments: readonly RouteSegment[] }) {
  const { colors } = useTheme();
  return (
    <>
      {segments.map((segment, index) =>
        segment.points.length < 2 ? null : (
          <Polyline
            key={`${segment.status}-${index}`}
            path={segment.points}
            strokeColor={colors.status[segment.status]}
            strokeWeight={LINE_WIDTH}
          />
        ),
      )}
    </>
  );
}

const styles = StyleSheet.create({
  bubble: { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});
