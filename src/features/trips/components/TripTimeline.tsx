import { StyleSheet, View } from 'react-native';
import { AppText, Card } from '@/components/ui';

export type TimelineLine = { id: string; text: string };

type TripTimelineProps = {
  lines: TimelineLine[];
};

export function TripTimeline({ lines }: TripTimelineProps) {
  if (lines.length === 0) {
    return (
      <AppText variant="bodyMd" color="body">
        Nothing notable happened on this drive.
      </AppText>
    );
  }
  return (
    <Card variant="content">
      <View>
        {lines.map((line, index) => (
          <View
            key={line.id}
            className={index === 0 ? '' : 'mt-sm border-hairline pt-sm'}
            style={index === 0 ? undefined : divider.top}
          >
            <AppText variant="bodySm">{line.text}</AppText>
          </View>
        ))}
      </View>
    </Card>
  );
}

const divider = StyleSheet.create({
  top: { borderTopWidth: StyleSheet.hairlineWidth },
});
