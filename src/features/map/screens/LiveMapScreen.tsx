import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Screen } from '@/components/ui';
import {
  CameraMarker,
  HazardMarker,
  RoadMap,
  type RoadMapHandle,
} from '@/components/map';
import { rounded, spacing } from '@/theme/tokens';
import { useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';
import { MapFilterBar } from '../components/MapFilterBar';
import {
  LiveMapEmptyOverlay,
  LiveMapErrorOverlay,
  LiveMapLoadingOverlay,
} from '../components/LiveMapOverlays';
import { MapBottomBar } from '../components/MapBottomBar';
import { useLiveMapViewModel } from '../viewmodels/useLiveMapViewModel';

const EMPTY_MESSAGE = 'No cameras or hazards match these filters';
const FAB_BOTTOM_OFFSET = 148;

export default function LiveMapScreen() {
  const vm = useLiveMapViewModel();
  const styles = useThemedStyles(screenStyles, undefined);
  const mapRef = useRef<RoadMapHandle | null>(null);
  const [recentreCount, setRecentreCount] = useState(0);

  useEffect(() => {
    if (vm.fitCoords.length > 0) {
      mapRef.current?.fit(vm.fitCoords);
    }
  }, [vm.fitCoords, recentreCount]);

  return (
    <Screen padded={false}>
      <RoadMap ref={mapRef} initialRegion={vm.frame} mapType={vm.mapType} showsTraffic={vm.showTraffic}>
        {vm.visibleCameras.map((camera) => (
          <CameraMarker
            key={camera.id}
            lat={camera.lat}
            lng={camera.lng}
            roadName={camera.roadName}
            speedLimitKmh={camera.speedLimitKmh}
          />
        ))}
        {vm.visibleHazards.map((hazard) => (
          <HazardMarker
            key={hazard.id}
            lat={hazard.lat}
            lng={hazard.lng}
            kind={hazard.type}
            onCalloutPress={() => vm.openReport(hazard.id)}
          />
        ))}
      </RoadMap>

      <MapFilterBar chips={vm.chips} onToggle={vm.toggleFilter} />

      <View style={styles.fabShell}>
        <IconButton
          icon="crosshairs-gps"
          accessibilityLabel="Recentre map"
          onPress={() => setRecentreCount((count) => count + 1)}
        />
      </View>

      <MapBottomBar summaryLine={vm.summaryLine} onPlanRoute={vm.planRoute} />

      {vm.isLoading && vm.fitCoords.length === 0 ? (
        <LiveMapLoadingOverlay label="Loading cameras and hazards…" />
      ) : null}
      {vm.error !== null ? (
        <LiveMapErrorOverlay message={vm.error} onRetry={vm.retry} />
      ) : null}
      {!vm.isLoading && vm.error === null && !vm.hasMarkers ? (
        <LiveMapEmptyOverlay message={EMPTY_MESSAGE} onReset={vm.resetFilters} />
      ) : null}
    </Screen>
  );
}

function screenStyles(_theme: ResolvedTheme) {
  return StyleSheet.create({
    fabShell: {
      position: 'absolute',
      right: spacing.lg,
      bottom: FAB_BOTTOM_OFFSET,
      backgroundColor: _theme.colors.canvas,
      borderRadius: rounded.full,
      ..._theme.elevation.level3,
    },
  });
}
