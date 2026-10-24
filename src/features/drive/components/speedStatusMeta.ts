import type { SpeedStatus } from '@/domain/usecases/drive/getSpeedStatus';
import { colors } from '@/theme/tokens';

export type { SpeedStatus };

export const STATUS_COLOR: Record<SpeedStatus, string> = {
  ok: colors.status.ok,
  near: colors.status.near,
  over: colors.status.over,
};
