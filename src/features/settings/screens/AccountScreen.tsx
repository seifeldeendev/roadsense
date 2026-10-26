import { StyleSheet, View } from 'react-native';
import { AppButton, AppText, Card, Screen } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { AccountHeader, QuickTile, SettingsRow } from '../components/AccountParts';
import { useAccountViewModel } from '../viewmodels/useAccountViewModel';

// Account tab: name and avatar, shortcut tiles, a promo band, then settings rows.
export default function AccountScreen() {
  const vm = useAccountViewModel();
  return (
    <Screen scroll>
      <View style={styles.container}>
        <AccountHeader name={vm.name} email={vm.email} initials={vm.initials} />

        <View style={styles.tiles}>
          <QuickTile icon="bell-outline" label="Alerts" onPress={() => vm.open('/settings/alerts')} />
          <QuickTile icon="layers-outline" label="Map layers" onPress={() => vm.open('/settings/map')} />
          <QuickTile icon="history" label="Activity" onPress={() => vm.open('/trips')} />
        </View>

        <Card variant="inverse">
          <View style={styles.promo}>
            <AppText variant="displaySm" color="onInverse">
              {vm.isDemoDrive ? 'Demo drive is on' : 'Test alerts indoors'}
            </AppText>
            <AppText variant="bodyMd" color="inverseMuted">
              {vm.isDemoDrive
                ? 'Drive Mode plays the recorded Salah Salem drive instead of your GPS.'
                : 'Play a recorded Cairo drive instead of your GPS to hear alerts at your desk.'}
            </AppText>
          </View>
          <AppButton
            title={vm.isDemoDrive ? 'Use my GPS' : 'Use the demo drive'}
            variant="secondary"
            onPress={vm.toggleDemoDrive}
            accessibilityLabel={vm.isDemoDrive ? 'Use my GPS' : 'Use the demo drive'}
          />
        </Card>

        <View>
          <SettingsRow icon="bell-ring-outline" label="Alerts" onPress={() => vm.open('/settings/alerts')} />
          <SettingsRow icon="map-outline" label="Map & layers" onPress={() => vm.open('/settings/map')} />
          <SettingsRow icon="volume-high" label="Sound & voice" onPress={() => vm.open('/settings/sound')} />
          <SettingsRow icon="cellphone-screenshot" label="Drive screen" onPress={() => vm.open('/settings/drive-screen')} />
          <SettingsRow icon="theme-light-dark" label="Appearance" onPress={() => vm.open('/settings/appearance')} />
        </View>

        <AppButton
          title={vm.signingOut ? 'Signing out…' : 'Sign out'}
          variant="subtle"
          onPress={vm.signOut}
          disabled={vm.signingOut}
          accessibilityLabel="Sign out"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xxxl, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  tiles: { flexDirection: 'row', gap: spacing.md },
  promo: { gap: spacing.sm, marginBottom: spacing.lg },
});
