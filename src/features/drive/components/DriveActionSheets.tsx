import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText, Badge, BottomSheet } from '@/components/ui';
import type { HazardType, UpcomingAlert } from '@/domain/entities';
import { formatDistance } from '@/shared/format';
import { alertIcon, hazardMeta, rounded, spacing, touch } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { ReportButton } from './ReportButton';

const ICON_CIRCLE = 40;

type ReportSheetProps = {
  visible: boolean;
  reportTypes: HazardType[];
  onReport: (type: HazardType) => void;
  onClose: () => void;
};

export function ReportSheet({ visible, reportTypes, onReport, onClose }: ReportSheetProps) {
  return (
    <BottomSheet visible={visible} title="New alert" onClose={onClose}>
      <AppText variant="bodySm" color="body">
        Your location and time are added for you.
      </AppText>
      <View style={styles.grid}>
        {reportTypes.map((type) => (
          <ReportButton
            key={type}
            icon={hazardMeta[type].icon}
            label={hazardMeta[type].label}
            onPress={() => onReport(type)}
          />
        ))}
      </View>
    </BottomSheet>
  );
}

type ActiveAlertsSheetProps = {
  visible: boolean;
  alerts: UpcomingAlert[];
  onOpenAlert: (alert: UpcomingAlert) => void;
  onClose: () => void;
};

export function ActiveAlertsSheet({ visible, alerts, onOpenAlert, onClose }: ActiveAlertsSheetProps) {
  const { colors } = useTheme();
  return (
    <BottomSheet visible={visible} title="Active alerts" onClose={onClose}>
      <FlatList
        data={alerts}
        keyExtractor={(alert) => alert.refId}
        style={styles.list}
        ListEmptyComponent={
          <AppText variant="bodyMd" color="body">
            Nothing ahead right now
          </AppText>
        }
        renderItem={({ item }) => {
          const icon = alertIcon(item.camera?.type, item.hazard?.type);
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.title}, ${formatDistance(item.distanceM)}`}
              onPress={() => onOpenAlert(item)}
              style={[styles.row, { borderBottomColor: colors.hairline }]}
            >
              <View style={[styles.iconCircle, { backgroundColor: colors.canvasSoft }]}>
                <MaterialCommunityIcons name={icon} size={20} color={colors.ink} />
              </View>
              <View style={styles.text}>
                <AppText variant="bodyMdStrong">{item.title}</AppText>
                <AppText variant="bodySm" color="body">
                  {formatDistance(item.distanceM)}
                  {item.roadName !== undefined ? ` · ${item.roadName}` : ''}
                </AppText>
              </View>
              {item.speedLimitKmh !== undefined ? (
                <Badge text={`${item.speedLimitKmh} km/h`} variant="ink" />
              ) : null}
            </Pressable>
          );
        }}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  list: {
    maxHeight: 360,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: touch.large,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconCircle: {
    width: ICON_CIRCLE,
    height: ICON_CIRCLE,
    borderRadius: rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
});
