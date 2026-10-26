import type { ReactNode } from 'react';
import { View } from 'react-native';

export function AuthFormCard({ children }: { children: ReactNode }) {
  return (
    <View className="gap-lg rounded-xl bg-canvas p-xxl">
      {children}
    </View>
  );
}
