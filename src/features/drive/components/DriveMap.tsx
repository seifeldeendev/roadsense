import { useEffect, useRef } from 'react';
import {
  CameraMarker,
  HazardMarker,
  RoadMap,
  RouteLine,
  UserMarker,
  type RoadMapHandle,
} from '@/components/map';
import type { Camera, Hazard, LatLng, MapType } from '@/domain/entities';
import type { MapFrame } from '@/domain/usecases/drive/fitRegion';

type DriveMapProps = {
  drivenRoute: LatLng[];
  remainingRoute: LatLng[];
  routeFrame: MapFrame;
  idleFitCoords: LatLng[];
  currentLocation: LatLng | null;
  cameras: Camera[];
  hazards: Hazard[];
  position: LatLng | null;
  heading: number;
  isDriving: boolean;
  mapType: MapType;
  showTraffic: boolean;
  northUp: boolean;
  recentreSignal: number;
  onOpenHazard: (hazardId: string) => void;
  onCenterChange?: (center: LatLng) => void;
  onRegionChange?: (region: MapFrame) => void;
};

// Full-screen driving map: follows the vehicle while driving, frames the route when idle.
export function DriveMap({
  drivenRoute,
  remainingRoute,
  routeFrame,
  idleFitCoords,
  currentLocation,
  cameras,
  hazards,
  position,
  heading,
  isDriving,
  mapType,
  showTraffic,
  northUp,
  recentreSignal,
  onOpenHazard,
  onCenterChange,
  onRegionChange,
}: DriveMapProps) {
  const mapRef = useRef<RoadMapHandle | null>(null);
  const followPoint = isDriving && position !== null ? { ...position, heading } : null;

  useEffect(() => {
    if (!isDriving) mapRef.current?.fit(idleFitCoords);
  }, [isDriving, recentreSignal, idleFitCoords]);

  return (
    <RoadMap
      ref={mapRef}
      initialRegion={routeFrame}
      followPoint={followPoint}
      mapType={mapType}
      showsTraffic={showTraffic}
      northUp={northUp}
      onCenterChange={onCenterChange}
      onRegionChange={onRegionChange}
    >
      <RouteLine driven={drivenRoute} remaining={remainingRoute} />
      {cameras.map((camera) => (
        <CameraMarker
          key={camera.id}
          lat={camera.lat}
          lng={camera.lng}
          roadName={camera.roadName}
          speedLimitKmh={camera.speedLimitKmh}
          type={camera.type}
        />
      ))}
      {hazards.map((hazard) => (
        <HazardMarker
          key={hazard.id}
          lat={hazard.lat}
          lng={hazard.lng}
          kind={hazard.type}
          onCalloutPress={() => onOpenHazard(hazard.id)}
        />
      ))}
      {followPoint !== null ? (
        // A flat marker's rotation is geographic, so it points along the heading in both
        // heading-up (the map turns with it) and north-up modes.
        <UserMarker lat={followPoint.lat} lng={followPoint.lng} heading={followPoint.heading} />
      ) : currentLocation !== null ? (
        <UserMarker lat={currentLocation.lat} lng={currentLocation.lng} heading={heading} />
      ) : null}
    </RoadMap>
  );
}
