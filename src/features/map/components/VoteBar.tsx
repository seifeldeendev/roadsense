import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui';

type VoteBarProps = {
  confirmations: number;
  denials: number;
};

const MIN_TOTAL = 1;

export function VoteBar({ confirmations, denials }: VoteBarProps) {
  const total = Math.max(confirmations + denials, MIN_TOTAL);
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${confirmations} confirmations, ${denials} denials`}
      className="h-7 flex-row overflow-hidden rounded-pill border-hairline"
      style={hairline.border}
    >
      <View className="items-center justify-center bg-ink" style={{ flex: (confirmations / total) * 10 }}>
        {confirmations > 0 ? <AppText variant="caption" color="onInverse">{confirmations}</AppText> : null}
      </View>
      <View className="items-center justify-center bg-mute" style={{ flex: (denials / total) * 10 }}>
        {denials > 0 ? <AppText variant="caption" color="inverse">{denials}</AppText> : null}
      </View>
    </View>
  );
}

const hairline = StyleSheet.create({
  border: { borderWidth: StyleSheet.hairlineWidth },
});
