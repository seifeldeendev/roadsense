import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { ToggleRow } from '@/components/ui';
import type { AlertTarget } from '@/domain/entities';
import { hazardMeta, type HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const TYPE_ROWS: { type: AlertTarget; label: string }[] = [
  { type: 'camera', label: 'Speed cameras' },
  { type: 'accident', label: 'Accidents' },
  { type: 'pothole', label: 'Potholes' },
  { type: 'checkpoint', label: 'Checkpoints' },
  { type: 'flooding', label: 'Flooding' },
];

type AlertTypeListProps = {
  enabledTypes: AlertTarget[];
  onToggle: (type: AlertTarget) => void;
};

export function AlertTypeList({ enabledTypes, onToggle }: AlertTypeListProps) {
  const { colors } = useTheme();
  return (
    <View>
      {TYPE_ROWS.map(({ type, label }) => (
        <ToggleRow
          key={type}
          label={label}
          value={enabledTypes.includes(type)}
          icon={
            <MaterialCommunityIcons
              name={hazardMeta[type].icon as HazardIconName}
              size={20}
              color={colors.ink}
            />
          }
          onValueChange={() => onToggle(type)}
        />
      ))}
    </View>
  );
}
