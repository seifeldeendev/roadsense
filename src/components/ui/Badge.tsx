import { View } from 'react-native';
import { AppText } from './AppText';

export type BadgeVariant = 'soft' | 'ink';

type BadgeProps = {
  text: string;
  variant?: BadgeVariant;
  color?: string;
};

export function Badge({ text, variant = 'soft', color }: BadgeProps) {
  const ink = variant === 'ink';
  return (
    <View
      className={`self-start rounded-pill px-xs py-xxs ${ink ? 'bg-ink' : 'bg-canvas-soft'}`}
      style={color !== undefined ? { backgroundColor: color } : undefined}
    >
      <AppText variant="bodySmStrong" color={ink ? 'onInverse' : 'ink'}>
        {text}
      </AppText>
    </View>
  );
}
