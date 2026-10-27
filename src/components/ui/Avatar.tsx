import { View } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from './AppText';

type AvatarProps = {
  initials: string;
  uri?: string | undefined;
  size: number;
};

// Round profile photo, or the driver's initials on soft gray when there is none.
export function Avatar({ initials, uri, size }: AvatarProps) {
  const shape = { width: size, height: size, borderRadius: size / 2 };
  if (uri !== undefined) {
    return <Image source={{ uri }} style={shape} contentFit="cover" accessibilityLabel="Profile photo" />;
  }
  return (
    <View className="items-center justify-center bg-canvas-soft" style={shape}>
      <AppText variant={size >= 96 ? 'displayLg' : 'displaySm'}>{initials}</AppText>
    </View>
  );
}
