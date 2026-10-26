import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText, Badge, BottomSheet } from '@/components/ui';
import type { HazardType, UpcomingAlert } from '@/domain/entities';
import { formatDistance } from '@/shared/format';
import { alertIcon, hazardMeta } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { ReportButton } from './ReportButton';

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
      <View className="flex-row flex-wrap gap-md">
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
        className="max-h-[360px]"
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
              className="min-h-touch-lg flex-row items-center gap-md border-hairline py-md active:bg-canvas-soft"
              style={divider.bottom}
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-canvas-soft">
                <MaterialCommunityIcons name={icon} size={20} color={colors.ink} />
              </View>
              <View className="flex-1 gap-xxs">
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

const divider = StyleSheet.create({
  bottom: { borderBottomWidth: StyleSheet.hairlineWidth },
});
