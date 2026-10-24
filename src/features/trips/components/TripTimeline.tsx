import { StyleSheet, View } from 'react-native';
import { AppText, Card } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { useThemedStyles, type ResolvedTheme } from '@/theme/useTheme';

export type TimelineLine = { id: string; text: string };

type TripTimelineProps = {
  lines: TimelineLine[];
};

export function TripTimeline({ lines }: TripTimelineProps) {
  const styles = useThemedStyles(timelineStyles, undefined);
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
          <View key={line.id} style={index === 0 ? styles.firstRow : styles.row}>
            <AppText variant="bodySm">{line.text}</AppText>
          </View>
        ))}
      </View>
    </Card>
  );
}

function timelineStyles(theme: ResolvedTheme) {
  return StyleSheet.create({
    firstRow: {
      paddingTop: 0,
    },
    row: {
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.hairline,
    },
  });
}
