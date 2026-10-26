import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { useTheme } from '@/theme/useTheme';

type FormErrorNoteProps = {
  message: string;
};

export function FormErrorNote({ message }: FormErrorNoteProps) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center gap-sm rounded-md bg-canvas-soft p-md">
      <MaterialCommunityIcons name="alert-circle-outline" size={18} color={colors.ink} />
      <AppText variant="bodySmStrong">{message}</AppText>
    </View>
  );
}
