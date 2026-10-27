import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useTabBarSpace } from '@/components/navigation';
import { IconButton, Screen } from '@/components/ui';
import {
  CameraMarker,
  HazardMarker,
  RoadMap,
  type RoadMapHandle,
} from '@/components/map';
import { spacing } from '@/theme/tokens';
import { MapFilterBar } from '../components/MapFilterBar';
import {
  LiveMapEmptyOverlay,
  LiveMapErrorOverlay,
  LiveMapLoadingOverlay,
} from '../components/LiveMapOverlays';
import { MapBottomBar } from '../components/MapBottomBar';
import { useLiveMapViewModel, type MapFilterChipVm } from '../viewmodels/useLiveMapViewModel';

const EMPTY_MESSAGE = 'No cameras or hazards match these filters';
// Above the bottom card (which itself sits above the floating tab bar).
const FAB_ABOVE_CARD = 132;

export default function LiveMapScreen() {
  const vm = useLiveMapViewModel();
  const tabBarSpace = useTabBarSpace();
  const mapRef = useRef<RoadMapHandle | null>(null);
  const [recentreCount, setRecentreCount] = useState(0);
  const hasFittedRef = useRef(false);
  const lastChipsRef = useRef<readonly MapFilterChipVm[] | null>(null);
  const lastRecentreRef = useRef(0);

  useEffect(() => {
    // The drawn points track the viewport, so their list changes on every pan;
    // the map only re-fits on first load, a filter change or Recentre.
    const firstLoad = !hasFittedRef.current && vm.fitCoords.length > 0;
    const chipsChanged = lastChipsRef.current !== null && lastChipsRef.current !== vm.chips;
    const recentred = recentreCount !== lastRecentreRef.current;
    if (!firstLoad && !chipsChanged && !recentred) return;
    if (firstLoad) hasFittedRef.current = true;
    lastChipsRef.current = vm.chips;
    lastRecentreRef.current = recentreCount;
    if (vm.fitCoords.length > 0) mapRef.current?.fit(vm.fitCoords);
  }, [vm.fitCoords, vm.chips, recentreCount]);

  return (
    <Screen padded={false}>
      <RoadMap
        ref={mapRef}
        initialRegion={vm.frame}
        mapType={vm.mapType}
        showsTraffic={vm.showTraffic}
        onRegionChange={(region) => {
          // Map-load events report the initial region, not a user pan, so point
          // tracking starts only after the first fit has happened.
          if (hasFittedRef.current) vm.onRegionChange(region);
        }}
      >
        {vm.visibleCameras.map((camera) => (
          <CameraMarker
            key={camera.id}
            lat={camera.lat}
            lng={camera.lng}
            roadName={camera.roadName}
            speedLimitKmh={camera.speedLimitKmh}
            type={camera.type}
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

      <View className="absolute right-lg" style={{ bottom: tabBarSpace + spacing.md + FAB_ABOVE_CARD }}>
        <IconButton
          icon="crosshairs-gps"
          surface="glass"
          accessibilityLabel="Recentre map"
          onPress={() => {
            vm.recentre();
            setRecentreCount((count) => count + 1);
          }}
        />
      </View>

      <MapBottomBar summaryLine={vm.summaryLine} onPlanRoute={vm.planRoute} bottomInset={tabBarSpace + spacing.md} />

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
