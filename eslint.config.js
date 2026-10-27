// https://docs.expo.dev/guides/using-eslint/
const fs = require('fs');
const path = require('path');
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// Layer boundaries: imports point inward only. Each zone forbids `target` from
// importing `from`, apart from `except` (paths relative to `from`).
// Domain types are the shared vocabulary: every layer may import them, and the
// layers that may use nothing else from the domain are held to `import type`
// below (this rule cannot tell type imports from value imports).
const featureSlices = fs
  .readdirSync(path.join(__dirname, 'src/features'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

// Shared presentation: the UI kit and the map and navigation primitives. The
// map and navigation primitives build on the UI kit; never the other way round.
const sharedPresentation = ['ui', 'map', 'navigation'];
const usesUiKit = (dir) => (dir === 'ui' ? [] : ['./components/ui']);

// Fire-and-forget UI affordances features may call directly; services that
// return data the app branches on go through Dependencies instead.
const featureServices = ['./services/haptics.ts', './services/speech.ts', './services/imagePicker.ts'];

const zone = (target, except, message) => ({ target, from: './src', except, message });

const routeZone = zone(
  './src/app',
  ['./app', './features', './domain'],
  'Route files only re-export feature screens (src/app may import features).',
);

// Layout files are the composition root: they wire providers, theme and fonts.
// Reading state to decide what to render is logic and stays out of them.
const layoutZone = zone(
  './src/app',
  ['./app', './features', './domain', './theme', './composition/AppDependenciesProvider.tsx', './stores/useThemeStore.ts'],
  'Layout files may wire providers, theme and fonts; state that decides what to render belongs in a feature.',
);

const layerZones = [
  zone('./src/domain', ['./domain'], 'src/domain imports nothing outside src/domain.'),
  zone('./src/data', ['./data', './domain', './shared', './services'], 'src/data may import only domain, shared and services.'),
  // Composition root: builds the production dependencies and stores.
  zone(
    './src/composition',
    ['./composition', './stores', './domain', './data/dependencies.ts'],
    'src/composition may import only stores, domain and data/dependencies.',
  ),
  zone(
    './src/stores',
    ['./stores', './domain', './shared', './data/dependencies.ts'],
    'src/stores may import only domain, shared and data/dependencies (DI).',
  ),
  zone(
    './src/features',
    [
      './features',
      './stores',
      './domain',
      './shared',
      './theme',
      ...sharedPresentation.map((dir) => `./components/${dir}`),
      ...featureServices,
    ],
    'src/features may import stores, domain, shared, theme, shared presentation and the UI-affordance services.',
  ),
  ...featureSlices.map((slice) => ({
    target: `./src/features/${slice}`,
    from: './src/features',
    except: [`./${slice}`],
    message: 'A feature slice must not import another slice; move shared presentation to components or shared.',
  })),
  zone('./src/services', ['./services', './shared', './domain'], 'src/services may import only shared (and domain types).'),
  zone('./src/shared', ['./shared', './domain'], 'src/shared imports nothing outside src/shared (and domain types).'),
  ...sharedPresentation.map((dir) =>
    zone(
      `./src/components/${dir}`,
      [`./components/${dir}`, ...usesUiKit(dir), './theme', './shared', './domain'],
      `src/components/${dir} may import only ${dir === 'ui' ? '' : 'components/ui, '}theme, shared and domain types.`,
    ),
  ),
  zone('./src/theme', ['./theme', './shared', './domain'], 'src/theme may import only shared (and domain types).'),
];

// App lifecycle events reach the app through Dependencies (AppLifecycle); only
// the service behind it touches AppState.
const APP_STATE_IMPORT = {
  name: 'react-native',
  importNames: ['AppState'],
  message: 'Use AppLifecycle from Dependencies; only src/services/appLifecycle.ts reads AppState.',
};

// Relative or aliased imports of src/domain.
const DOMAIN_IMPORT = '^(@/|(\\.\\./)+)domain(/|$)';

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'import/no-restricted-paths': ['error', { zones: [...layerZones, routeZone] }],
    },
  },
  {
    files: ['src/app/**/_layout.tsx'],
    rules: {
      'import/no-restricted-paths': ['error', { zones: [...layerZones, layoutZone] }],
    },
  },
  {
    // Outside domain, data, stores and features the domain is vocabulary only.
    files: [
      'src/app/**/*.{ts,tsx}',
      'src/services/**/*.{ts,tsx}',
      'src/shared/**/*.{ts,tsx}',
      'src/theme/**/*.{ts,tsx}',
      ...sharedPresentation.map((dir) => `src/components/${dir}/**/*.{ts,tsx}`),
    ],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: DOMAIN_IMPORT,
              allowTypeImports: true,
              message: 'Only domain types may be imported here; use `import type`.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/services/appLifecycle.ts'],
    rules: {
      'no-restricted-imports': ['error', { paths: [APP_STATE_IMPORT] }],
    },
  },
  {
    // The domain is framework-free.
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-*', 'react-native', 'react-native-*', 'expo', 'expo-*', '@expo/*', 'zustand', 'zustand/*'],
              message: 'src/domain is pure TypeScript: no React, React Native, Expo or Zustand.',
            },
          ],
        },
      ],
    },
  },
  {
    // Stores take data through the Dependencies type; building production
    // dependencies is the composition root's job.
    files: ['src/stores/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          // Repeats APP_STATE_IMPORT: this block's options replace the one above.
          paths: [
            ...['../data/dependencies', '@/data/dependencies'].map((name) => ({
              name,
              importNames: ['productionDependencies', 'createDependencies'],
              message: 'Stores receive Dependencies; only the composition root builds them.',
            })),
            APP_STATE_IMPORT,
          ],
        },
      ],
    },
  },
]);
