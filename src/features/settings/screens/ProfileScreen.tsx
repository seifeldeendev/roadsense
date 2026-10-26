import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton, AppText, Avatar, BottomSheet, FormErrorNote, Screen, SectionHeader, TextField } from '@/components/ui';
import type { HazardIconName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { useProfileViewModel } from '../viewmodels/useProfileViewModel';

const AVATAR_SIZE = 112;

// Personal info: photo, name, email and phone, saved together.
export default function ProfileScreen() {
  const vm = useProfileViewModel();
  const { colors } = useTheme();
  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen scroll>
        <View className="gap-xxxl pb-xl pt-lg">
          <View className="items-center gap-md">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
              onPress={vm.openPhotoSheet}
              className="active:opacity-70"
            >
              <Avatar initials={vm.initials} uri={vm.avatarUri} size={AVATAR_SIZE} />
              <View className="absolute bottom-0 right-0 h-touch w-touch items-center justify-center rounded-full border-2 border-canvas bg-primary">
                <MaterialCommunityIcons name="camera-outline" size={20} color={colors.onPrimary} />
              </View>
            </Pressable>
            <AppButton title="Change photo" variant="subtle" onPress={vm.openPhotoSheet} accessibilityLabel="Change photo" />
          </View>

          <View className="gap-lg">
            <SectionHeader title="Personal info" />
            <TextField
              label="Name"
              value={vm.name}
              onChangeText={vm.setName}
              error={vm.errorFor('name')}
              placeholder="Your name"
              autoComplete="name"
              textContentType="name"
            />
            <TextField
              label="Email"
              value={vm.email}
              onChangeText={vm.setEmail}
              error={vm.errorFor('email')}
              placeholder="you@example.com"
              autoComplete="email"
              textContentType="emailAddress"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextField
              label="Phone (optional)"
              value={vm.phone}
              onChangeText={vm.setPhone}
              error={vm.errorFor('phone')}
              placeholder="+20 100 000 0000"
              autoComplete="tel"
              textContentType="telephoneNumber"
              keyboardType="phone-pad"
            />
          </View>

          {vm.formError !== null ? <FormErrorNote message={vm.formError} /> : null}
          <AppButton
            title="Save changes"
            variant="large"
            onPress={vm.save}
            loading={vm.saving}
            disabled={!vm.hasChanges || vm.saving}
            accessibilityLabel="Save changes"
          />
        </View>
      </Screen>

      <BottomSheet visible={vm.photoSheetOpen} title="Profile photo" onClose={vm.closePhotoSheet}>
        <View>
          <PhotoOption icon="camera-outline" label="Take photo" onPress={() => vm.choosePhoto('camera')} />
          <PhotoOption icon="image-outline" label="Choose from library" onPress={() => vm.choosePhoto('library')} />
          {vm.avatarUri !== undefined ? (
            <PhotoOption icon="trash-can-outline" label="Remove photo" onPress={vm.removePhoto} />
          ) : null}
        </View>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

function PhotoOption({ icon, label, onPress }: { icon: HazardIconName; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="min-h-touch-lg flex-row items-center gap-md py-md active:opacity-70"
    >
      <MaterialCommunityIcons name={icon} size={24} color={colors.ink} />
      <AppText variant="bodyLg">{label}</AppText>
    </Pressable>
  );
}
