import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/ui';
import {
  CameraMarker,
  HazardMarker,
  RoadMap,
  RouteLine,
  UserMarker,
  type RoadMapHandle,
} from '@/components/map';
import type { Camera, Hazard, LatLng } from '@/domain/entities';
import type { MapFrame } from '@/domain/usecases/drive/fitRegion';
import { useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';
import { rounded, spacing } from '@/theme/tokens';

const CARD_HEIGHT = 220;

type DriveMapCardProps = {
  routePoints: LatLng[];
  routeFrame: MapFrame;
  cameras: Camera[];
  hazards: Hazard[];
  position: LatLng | null;
  heading: number;
  isDriving: boolean;
  travelledIndex: number;
};

export function DriveMapCard({
  routePoints,
  routeFrame,
  cameras,
  hazards,
  position,
  heading,
  isDriving,
  travelledIndex,
}: DriveMapCardProps) {
  const styles = useThemedStyles(cardStyles, undefined);
  const mapRef = useRef<RoadMapHandle | null>(null);
  const [recentreCount, setRecentreCount] = useState(0);

  const followPoint = isDriving && position !== null ? { ...position, heading } : null;

  useEffect(() => {
    if (!isDriving) {
      mapRef.current?.fit(routePoints);
    }
  }, [isDriving, recentreCount, routePoints]);

  const progressIndex = isDriving ? travelledIndex : undefined;

  return (
    <View style={styles.frame}>
      <RoadMap
        ref={mapRef}
        initialRegion={routeFrame}
        followPoint={followPoint}
      >
        <RouteLine coordinates={routePoints} progressIndex={progressIndex} />
        {cameras.map((camera) => (
          <CameraMarker
            key={camera.id}
            lat={camera.lat}
            lng={camera.lng}
            roadName={camera.roadName}
            speedLimitKmh={camera.speedLimitKmh}
          />
        ))}
        {hazards.map((hazard) => (
          <HazardMarker
            key={hazard.id}
            lat={hazard.lat}
            lng={hazard.lng}
            kind={hazard.type}
          />
        ))}
        {followPoint !== null ? (
          <UserMarker lat={followPoint.lat} lng={followPoint.lng} heading={followPoint.heading} />
        ) : null}
      </RoadMap>
      <View style={styles.recentrePill}>
        <AppButton
          title="Recentre"
          variant="floating"
          icon="crosshairs-gps"
          accessibilityLabel="Recentre map"
          onPress={() => {
            setRecentreCount((count) => count + 1);
          }}
        />
      </View>
    </View>
  );
}

function cardStyles(theme: ResolvedTheme) {
  return StyleSheet.create({
    frame: {
      height: CARD_HEIGHT,
      borderRadius: rounded.xl,
      overflow: 'hidden',
      // Map tiles clip against the rounding, so dark keeps a hairline edge.
      borderWidth: theme.scheme === 'dark' ? 1 : 0,
      borderColor: theme.colors.hairline,
    },
    recentrePill: {
      position: 'absolute',
      top: spacing.md,
      right: spacing.md,
    },
  });
}
