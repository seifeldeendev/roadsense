import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { CameraType, HazardType } from '@/domain/entities';
import type { ViewStyle } from 'react-native';
import scales from './scales.json';

export type ThemeColors = {
  primary: string;
  onPrimary: string;
  primaryPressed: string;
  canvas: string;
  canvasSoft: string;
  canvasSofter: string;
  surfacePressed: string;
  ink: string;
  body: string;
  hairlineMid: string;
  mute: string;
  hairline: string;
  inverse: string;
  onInverse: string;
  inverseMuted: string;
  backdrop: string;
  status: {
    ok: string;
    near: string;
    over: string;
  };
  // Glass surfaces (GlassSurface): canvasGlass is the near-opaque fill where the
  // platform cannot blur (Android); canvasFrost is the lighter fill on top of a
  // real backdrop blur (web).
  canvasGlass: string;
  canvasFrost: string;
};

export const lightColors: ThemeColors = {
  primary: '#000000',
  onPrimary: '#ffffff',
  primaryPressed: '#282828',
  canvas: '#ffffff',
  canvasSoft: '#efefef',
  canvasSofter: '#f3f3f3',
  surfacePressed: '#e2e2e2',
  ink: '#000000',
  body: '#5e5e5e',
  hairlineMid: '#4b4b4b',
  mute: '#afafaf',
  hairline: '#e2e2e2',
  inverse: '#000000',
  onInverse: '#ffffff',
  inverseMuted: '#afafaf',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  status: {
    ok: '#000000',
    near: '#F5A623',
    over: '#E11900',
  },
  canvasGlass: 'rgba(255, 255, 255, 0.9)',
  canvasFrost: 'rgba(255, 255, 255, 0.72)',
};

export const darkColors: ThemeColors = {
  primary: '#ffffff',
  onPrimary: '#000000',
  primaryPressed: '#e2e2e2',
  canvas: '#000000',
  canvasSoft: '#1f1f1f',
  canvasSofter: '#161616',
  surfacePressed: '#333333',
  ink: '#ffffff',
  body: '#afafaf',
  hairlineMid: '#c4c4c4',
  mute: '#5e5e5e',
  hairline: '#282828',
  inverse: '#ffffff',
  onInverse: '#000000',
  inverseMuted: '#5e5e5e',
  backdrop: 'rgba(0, 0, 0, 0.7)',
  status: {
    ok: '#ffffff',
    near: '#F5A623',
    over: '#FF5A45',
  },
  canvasGlass: 'rgba(0, 0, 0, 0.88)',
  canvasFrost: 'rgba(20, 20, 20, 0.62)',
};

// DESIGN.md scales live in scales.json so tailwind.config.js shares the exact values.
export const spacing = scales.spacing;

export const rounded = scales.rounded;

export const elevation = {
  level0: {
    boxShadow: 'rgba(0, 0, 0, 0) 0px 0px 0px 0px',
  },
  level1: {
    boxShadow: 'rgba(0, 0, 0, 0.12) 0px 4px 16px 0px',
  },
  level2: {
    boxShadow: 'rgba(0, 0, 0, 0.16) 0px 4px 16px 0px',
  },
  level3: {
    boxShadow: 'rgba(0, 0, 0, 0.16) 0px 2px 8px 0px',
  },
} satisfies Record<string, ViewStyle>;

export type ThemeElevation = typeof elevation;

export const fontFamily = scales.fontFamily;

type TypographyStyle = { fontFamily: string; fontSize: number; lineHeight: number };

export const typography = Object.fromEntries(
  Object.entries(scales.typography).map(([name, { weight, fontSize, lineHeight }]) => [
    name,
    { fontFamily: fontFamily[weight as keyof typeof fontFamily], fontSize, lineHeight },
  ]),
) as Record<keyof typeof scales.typography, TypographyStyle>;

export type TypographyToken = keyof typeof typography;

export const nativeTypography = {
  stackHeaderTitle: {
    fontFamily: typography.displaySm.fontFamily,
    fontSize: typography.displaySm.fontSize,
  },
  tabLabel: {
    fontFamily: typography.bodySmStrong.fontFamily,
    fontSize: typography.bodySmStrong.fontSize,
  },
} as const;

export const touch = scales.touch;

export type HazardKind = HazardType | 'camera' | 'police' | 'bump';

export type HazardIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const hazardMeta: Record<HazardKind, { label: string; icon: HazardIconName }> = {
  camera: { label: 'Camera', icon: 'cctv' },
  police: { label: 'Police', icon: 'police-station' },
  bump: { label: 'Speed bump', icon: 'car-brake-alert' },
  accident: { label: 'Accident', icon: 'car-emergency' },
  pothole: { label: 'Pothole', icon: 'road-variant' },
  checkpoint: { label: 'Checkpoint', icon: 'police-badge' },
  flooding: { label: 'Flooding', icon: 'waves' },
};

// Icon for each kind of fixed road point; speed-bump zones get their own glyph.
export const fixedPointIcon: Record<CameraType, HazardIconName> = {
  fixed: 'cctv',
  average: 'cctv',
  red_light: 'cctv',
  police: 'police-station',
  speed_bump: 'car-brake-alert',
  bump_zone: 'traffic-cone',
};

// One place to pick the icon for any alert: fixed points by their type, reports by hazard.
export function alertIcon(featureType: CameraType | undefined, hazardType: HazardType | undefined): HazardIconName {
  if (featureType !== undefined) return fixedPointIcon[featureType];
  return hazardType !== undefined ? hazardMeta[hazardType].icon : 'alert';
}
