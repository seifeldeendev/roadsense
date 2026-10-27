import { View } from 'react-native';
import { HazardMarker, RoadMap } from '@/components/map';
import type { Hazard } from '@/domain/entities';
import type { MapFrame } from '@/domain/usecases/drive/fitRegion';

type ReportMapCardProps = {
  hazard: Hazard;
  frame: MapFrame;
};

const MIN_MARK = 0.01;

export function ReportMapCard({ hazard, frame }: ReportMapCardProps) {
  return (
    <View className="aspect-video overflow-hidden rounded-xl">
      <RoadMap
        initialRegion={{
          latitude: frame.latitude,
          longitude: frame.longitude,
          latitudeDelta: Math.max(frame.latitudeDelta, MIN_MARK),
          longitudeDelta: Math.max(frame.longitudeDelta, MIN_MARK),
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
      >
        <HazardMarker lat={hazard.lat} lng={hazard.lng} kind={hazard.type} />
      </RoadMap>
    </View>
  );
}
