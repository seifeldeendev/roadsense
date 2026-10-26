import {
  useImperativeHandle,
  useEffect,
  useRef,
  type ReactNode,
  type Ref,
} from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import MapView, {
  PROVIDER_GOOGLE,
  type Camera,
  type Region,
} from 'react-native-maps';
import type { MapFrame } from '@/domain/usecases/drive/fitRegion';
import { useTheme, useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';
import { darkMapStyle, lightMapStyle } from '@/theme/mapStyles';
import { spacing } from '@/theme/tokens';

export type FollowPoint = { lat: number; lng: number; heading: number };

export type RoadMapHandle = {
  fit: (coordinates: { lat: number; lng: number }[]) => void;
};

type RoadMapProps = {
  initialRegion?: MapFrame & Region;
  region?: MapFrame & Region;
  children?: ReactNode;
  followPoint?: FollowPoint | null;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  rotateEnabled?: boolean;
  mapType?: 'standard' | 'satellite';
  showsTraffic?: boolean;
  // Keeps north at the top instead of rotating the map with the heading.
  northUp?: boolean;
  // Called with the map centre whenever the user finishes panning or zooming.
  onCenterChange?: (center: { lat: number; lng: number }) => void;
  // Called with the visible region (centre and span) whenever a pan or zoom ends.
  onRegionChange?: (region: MapFrame) => void;
  style?: StyleProp<ViewStyle>;
  ref?: Ref<RoadMapHandle>;
};

type MapViewInstance = InstanceType<typeof MapView>;

const DRIVE_PITCH = 45;
const STREET_LEVEL_DELTA = { latitudeDelta: 0.01, longitudeDelta: 0.01 };

function followCamera(point: FollowPoint, northUp: boolean): Partial<Camera> {
  const center = { latitude: point.lat, longitude: point.lng };
  return {
    center,
    heading: northUp ? 0 : point.heading,
    pitch: DRIVE_PITCH,
    zoom: 16,
  };
}

export function RoadMap({
  initialRegion,
  region,
  children,
  followPoint = null,
  scrollEnabled = true,
  zoomEnabled = true,
  rotateEnabled = true,
  mapType = 'standard',
  showsTraffic = false,
  northUp = false,
  onCenterChange,
  onRegionChange,
  style,
  ref,
}: RoadMapProps) {
  const { scheme } = useTheme();
  const styles = useThemedStyles(roadMapStyles, undefined);
  const mapRef = useRef<MapViewInstance | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      fit: (coordinates) => {
        // A single point (the driver) gets a street-level view instead of maximum zoom.
        if (coordinates.length === 1) {
          mapRef.current?.animateToRegion(
            { latitude: coordinates[0].lat, longitude: coordinates[0].lng, ...STREET_LEVEL_DELTA },
            500,
          );
          return;
        }
        mapRef.current?.fitToCoordinates(
          coordinates.map((c) => ({ latitude: c.lat, longitude: c.lng })),
          { edgePadding: styles.edgePadding, animated: true },
        );
      },
    }),
    [styles],
  );

  const lat = followPoint?.lat ?? null;
  const lng = followPoint?.lng ?? null;
  const heading = followPoint?.heading ?? null;

  useEffect(() => {
    if (lat === null || lng === null || heading === null) return;
    mapRef.current?.animateCamera(followCamera({ lat, lng, heading }, northUp), { duration: 500 });
  }, [lat, lng, heading, northUp]);

  return (
    <MapView
      ref={mapRef}
      style={styles.base}
      // Google Maps on iOS and Android alike (web uses the Maps JavaScript API).
      provider={PROVIDER_GOOGLE}
      initialRegion={initialRegion}
      region={region}
      mapType={mapType}
      showsTraffic={showsTraffic}
      onRegionChangeComplete={
        onCenterChange === undefined && onRegionChange === undefined
          ? undefined
          : (region) => {
              if (onCenterChange !== undefined) onCenterChange({ lat: region.latitude, lng: region.longitude });
              if (onRegionChange !== undefined) onRegionChange(region);
            }
      }
      // The grayscale style only applies to the drawn map, not satellite imagery.
      customMapStyle={mapType === 'standard' ? (scheme === 'dark' ? darkMapStyle : lightMapStyle) : undefined}
      showsCompass={false}
      showsMyLocationButton={false}
      showsUserLocation={false}
      toolbarEnabled={false}
      scrollEnabled={scrollEnabled}
      zoomEnabled={zoomEnabled}
      rotateEnabled={rotateEnabled}
    >
      {children}
    </MapView>
  );
}

function roadMapStyles(_theme: ResolvedTheme) {
  return StyleSheet.create({
    base: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    edgePadding: { top: spacing.xxxl, right: spacing.xxxl, bottom: spacing.xxxl, left: spacing.xxxl },
  });
}
