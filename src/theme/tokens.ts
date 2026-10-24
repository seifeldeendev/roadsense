import type { HazardType } from '@/domain/entities';

export const colors = {
  background: '#0B1020',
  surface: '#151C31',
  surfaceAlt: '#1E2742',
  border: '#2A3555',
  text: '#F8FAFC',
  muted: '#94A3B8',
  primary: '#7CFFB2',
  danger: '#FB7185',
  ok: '#22C55E',
  near: '#F59E0B',
  over: '#EF4444',
  camera: '#3B82F6',
  accident: '#EF4444',
  pothole: '#F97316',
  checkpoint: '#A855F7',
  flooding: '#0EA5E9',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const typography = {
  size: {
    caption: 12,
    body: 15,
    title: 20,
    heading: 28,
    display: 64,
  },
} as const;

export const touch = {
  min: 48,
  large: 64,
} as const;

export type HazardKind = HazardType | 'camera';

export const hazardMeta: Record<HazardKind, { label: string; color: string; icon: string }> = {
  camera: { label: 'Camera', color: colors.camera, icon: '📷' },
  accident: { label: 'Accident', color: colors.accident, icon: '🚗' },
  pothole: { label: 'Pothole', color: colors.pothole, icon: '🕳️' },
  checkpoint: { label: 'Checkpoint', color: colors.checkpoint, icon: '🚧' },
  flooding: { label: 'Flooding', color: colors.flooding, icon: '🌊' },
};
