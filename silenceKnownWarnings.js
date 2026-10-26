// Runs before React Native's own setup (see metro.config.js), so it must not
// import react-native. NativeWind's runtime (react-native-css-interop 0.2.7)
// registers React Native's deprecated ImageBackground for className support as
// soon as it loads, which logs a deprecation warning although the app never
// uses ImageBackground. Only that one message is dropped; remove this file once
// NativeWind stops touching ImageBackground.
const NATIVEWIND_IMAGE_BACKGROUND_WARNING = 'ImageBackground is deprecated';

const warn = console.warn;
console.warn = (message, ...rest) => {
  if (typeof message === 'string' && message.startsWith(NATIVEWIND_IMAGE_BACKGROUND_WARNING)) return;
  warn(message, ...rest);
};
