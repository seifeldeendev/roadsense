import type { RouteSegment } from './SegmentedRouteLine';

// react-native-maps has no web implementation, so the segmented route line
// renders nothing on web — same stand-in contract as the other overlays.
type SegmentedRouteLineProps = {
  segments: readonly RouteSegment[];
};

export function SegmentedRouteLine(_props: SegmentedRouteLineProps) {
  return null;
}

export type { RouteSegment } from './SegmentedRouteLine';
