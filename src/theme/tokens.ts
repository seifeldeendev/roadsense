import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { HazardType } from '@/domain/entities';
import type { ViewStyle } from 'react-native';

export const colors = {
  primary: '#000000',
  onPrimary: '#ffffff',
  canvas: '#ffffff',
  canvasSoft: '#efefef',
  canvasSofter: '#f3f3f3',
  surfacePressed: '#e2e2e2',
  blackElevated: '#282828',
  ink: '#000000',
  body: '#5e5e5e',
  hairlineMid: '#4b4b4b',
  mute: '#afafaf',
  onDark: '#ffffff',
  hairline: '#e2e2e2',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  status: {
    ok: '#000000',
    near: '#F5A623',
    over: '#E11900',
  },
} as const;

export const spacing = {
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const rounded = {
  none: 0,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
  pillTab: 36,
  full: 9999,
} as const;

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

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  bold: 'Inter_700Bold',
} as const;

export const typography = {
  displayXxl: { fontFamily: fontFamily.bold, fontSize: 52, lineHeight: 64 },
  displayXl: { fontFamily: fontFamily.bold, fontSize: 36, lineHeight: 44 },
  displayLg: { fontFamily: fontFamily.bold, fontSize: 32, lineHeight: 40 },
  displayMd: { fontFamily: fontFamily.bold, fontSize: 24, lineHeight: 32 },
  displaySm: { fontFamily: fontFamily.bold, fontSize: 20, lineHeight: 28 },
  bodyLg: { fontFamily: fontFamily.medium, fontSize: 18, lineHeight: 24 },
  bodyMd: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24 },
  bodyMdStrong: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 20 },
  bodySm: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20 },
  bodySmStrong: { fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 16 },
  caption: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 20 },
  buttonLarge: { fontFamily: fontFamily.medium, fontSize: 18, lineHeight: 24 },
  buttonMd: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 20 },
} as const;

export type TypographyToken = keyof typeof typography;

export const touch = {
  min: 44,
  large: 56,
} as const;

export type HazardKind = HazardType | 'camera';

export type HazardIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const hazardMeta: Record<HazardKind, { label: string; icon: HazardIconName }> = {
  camera: { label: 'Camera', icon: 'cctv' },
  accident: { label: 'Accident', icon: 'car-emergency' },
  pothole: { label: 'Pothole', icon: 'road-variant' },
  checkpoint: { label: 'Checkpoint', icon: 'police-badge' },
  flooding: { label: 'Flooding', icon: 'waves' },
};
