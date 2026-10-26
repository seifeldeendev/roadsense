import { View } from 'react-native';
import { AppButton, AppText, RadioList, Screen, SectionHeader, ToggleRow } from '@/components/ui';
import type { SoundMode } from '@/domain/entities';
import { useAppSettingsViewModel } from '../viewmodels/useAppSettingsViewModel';

const SOUND_OPTIONS: { value: SoundMode; label: string; icon: 'volume-high' | 'bell-ring-outline' | 'vibrate' | 'volume-off' }[] = [
  { value: 'all', label: 'All sounds', icon: 'volume-high' },
  { value: 'cameras', label: 'Cameras only', icon: 'bell-ring-outline' },
  { value: 'vibrate', label: 'Vibrate only', icon: 'vibrate' },
  { value: 'muted', label: 'Muted', icon: 'volume-off' },
];

export default function SoundVoiceScreen() {
  const vm = useAppSettingsViewModel();
  return (
    <Screen scroll>
      <View className="gap-xxxl pb-xl pt-lg">
        <View className="gap-sm">
          <SectionHeader title="Sound" />
          <RadioList options={SOUND_OPTIONS} value={vm.soundMode} onChange={vm.setSoundMode} />
        </View>

        <View className="gap-sm">
          <SectionHeader title="Voice" />
          <ToggleRow label="Voice alerts" value={vm.voiceEnabled} onValueChange={vm.setVoiceEnabled} />
          <ToggleRow label="Alert sound" value={vm.soundEnabled} onValueChange={vm.setSoundEnabled} />
        </View>

        <View className="gap-sm">
          {vm.voiceEnabled ? null : (
            <AppText variant="bodySm" color="body">
              Voice alerts are off — turn them on to test
            </AppText>
          )}
          <AppButton
            title="Test voice"
            variant="subtle"
            onPress={vm.testVoice}
            disabled={!vm.voiceEnabled}
            accessibilityLabel="Test voice"
          />
        </View>
      </View>
    </Screen>
  );
}
