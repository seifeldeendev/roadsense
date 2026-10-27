// App entry: pulls the warning filter into the bundle (metro.config.js runs it
// before React Native's setup), then starts Expo Router.
require('./silenceKnownWarnings');
require('expo-router/entry');
