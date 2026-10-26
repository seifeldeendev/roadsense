const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// The warning filter must run before React Native's setup, which already loads
// NativeWind's runtime (see silenceKnownWarnings.js).
const runBeforeMain = config.serializer.getModulesRunBeforeMainModule;
config.serializer.getModulesRunBeforeMainModule = (entryFilePath) => [
  require.resolve('./silenceKnownWarnings.js'),
  ...runBeforeMain(entryFilePath),
];

module.exports = withNativeWind(config, { input: './global.css' });
