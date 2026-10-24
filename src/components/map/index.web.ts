// react-native-maps has no web implementation, so web builds get stand-ins with
// the same API: a placeholder surface for the map and no-op overlays.
export { RoadMap, CameraMarker, HazardMarker, UserMarker, RouteLine } from './WebMapFallback';
export type { RoadMapHandle, FollowPoint } from './RoadMap';
export { SegmentedRouteLine } from './SegmentedRouteLine.web';
export type { RouteSegment } from './SegmentedRouteLine';
