import * as ImagePicker from 'expo-image-picker';

export type PhotoSource = 'library' | 'camera';

// Square crop, compressed: a profile photo never needs full resolution.
const PICK_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.7,
};

// Asks for permission, then returns the chosen photo's local URI, or null when
// the driver cancels or refuses access.
export async function pickProfilePhoto(source: PhotoSource): Promise<string | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(PICK_OPTIONS)
      : await ImagePicker.launchImageLibraryAsync(PICK_OPTIONS);
  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}
