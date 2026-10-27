// react-native-maps has no web implementation. Web draws the same maps with the
// Google Maps JavaScript API when EXPO_PUBLIC_GOOGLE_MAPS_KEY is set; without a
// key it keeps a placeholder surface with no-op overlays.
import * as google from './GoogleWebMap';
import * as placeholder from './WebMapFallback';
import { SegmentedRouteLine as NoSegments } from './SegmentedRouteLine.web';

const live = google.webMapsKey.length > 0;

export const RoadMap = live ? google.RoadMap : placeholder.RoadMap;
export const CameraMarker = live ? google.CameraMarker : placeholder.CameraMarker;
export const HazardMarker = live ? google.HazardMarker : placeholder.HazardMarker;
export const UserMarker = live ? google.UserMarker : placeholder.UserMarker;
export const RouteLine = live ? google.RouteLine : placeholder.RouteLine;
export const PinMarker = live ? google.PinMarker : placeholder.PinMarker;
export const SegmentedRouteLine = live ? google.SegmentedRouteLine : NoSegments;
export type { RoadMapHandle, FollowPoint } from './RoadMap';
export type { RouteSegment } from './SegmentedRouteLine';
