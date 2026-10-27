# RoadSense — AI Engineering Log

Format required by the module: verbatim prompt → output → my changes & verification → rationale.
Full verbatim prompts are stored in `docs/ai-prompts/`.

---

### AI-001 · 2026-10-24 · Seif · planning · Claude Code (claude-opus-5-5)
**Prompt (verbatim):** "we're trying to start implementing @phase-1.md our propsal was @"Mobile Application Development Project Proposal.pdf" and the selected idea is RoadSense so i want from you to write .md plan file for implementing each detail in @phase-1.md" — followed by "review this webpage and crawl accross the website for any detail that might help at the plan you wrote https://labverse-indol.vercel.app/mobile-development/coursework/cw-01"
**Output:** `docs/phase-1-plan.md` (task-by-task plan, folder structure, data model, screen specs).
**My changes & verification:** _Seif: fill in what you changed/checked in the plan._
**Rationale:** _Seif: fill in._

### AI-002 · 2026-10-24 · Seif · domain / data / services / stores · OpenCode (opencode/glm-5.3-flash-free), orchestrated by Claude Code
**Prompt (verbatim):** `docs/ai-prompts/AI-002-core-layers.txt`
**Output:** entities, repository interfaces, use cases (`getSpeedStatus`, `findUpcomingAlerts`, `isHazardExpired`, `applyVote`, geo utils), Cairo mock fixtures + mock repositories, `MockLocationSource`, speech wrapper, Zustand stores, 16 Jest tests; added ESLint config for `npx expo lint`.
**My changes & verification:** Re-ran `npx tsc --noEmit`, `npm test` (16/16) and `npx expo lint` independently; read all use cases, stores and services. Fixed `Trip.startedAt/endedAt` to epoch ms (matches the data model) and a leaked interval in `MockLocationSource.setRate()` when called while stopped. _Seif: add your own review notes._
**Rationale:** _Seif: fill in._

### AI-003 · 2026-10-24 · Seif · theme / ui primitives / navigation shell · OpenCode (opencode/glm-5.3-flash-free), orchestrated by Claude Code
**Prompt (verbatim):** `docs/ai-prompts/AI-003-ui-shell.txt`
**Output:** `src/theme/tokens.ts`, 11 UI primitives in `src/components/ui`, root Stack + 4-tab layout, 9 thin route files, 9 placeholder feature screens for the team to replace.
**My changes & verification:** Re-ran tsc, jest (16/16), lint; confirmed in `node_modules/expo-router/build/index.d.ts` that `Tabs` from `expo-router` is deprecated in favour of `expo-router/js-tabs` (the implementer's deviation). Raised `Chip` min height from 40 to `touch.min` (48) to meet the touch-target rule. _Seif: add your own review notes._
**Rationale:** _Seif: fill in._

### AI-004 · 2026-10-24 · Seif · features/drive (Drive Mode, Alert Overlay, Alert Settings) · OpenCode (opencode/glm-5.3-flash-free), orchestrated by Claude Code
**Prompt (verbatim):** `docs/ai-prompts/AI-004-drive-screens.txt`
**Output:** 3 screens, 3 ViewModel hooks + helpers, 8 feature components in `src/features/drive/`.
**My changes & verification:** Re-ran tsc, jest (16/16), lint and an Android bundle export; checked screens/components import no stores, services or data. Fixed two bugs: (1) a new alert while the overlay was open pushed a second stacked `/alert` modal — now the open overlay just updates; (2) the "target behind you" auto-dismiss ran while not driving, so "Preview alert" could close instantly after a stopped drive — now only checked while driving. _Seif: add your own review notes and on-device test results._
**Rationale:** _Seif: fill in._

### AI-005 · 2026-10-24 · Seif · design system (tokens, fonts, ui primitives, navigation) · OpenCode (opencode/glm-5.3-flash-free), orchestrated by Claude Code
**Prompt (verbatim):** `docs/ai-prompts/AI-005-design-system.txt` (applies `DESIGN.md`)
**Output:** tokens rewritten to DESIGN.md (black/white/grayscale, Inter type scale, 4-px spacing, pill/xl radii, elevation levels), Inter fonts loaded behind the splash screen, light header/tab bar with vector icons, all ui primitives restyled, new `AppText` and `IconButton`; callers migrated.
**Design decision:** DESIGN.md forbids accent colours, but FR1 requires amber/red speed status — kept two semantic colours (`status.near`, `status.over`) used only for speed status.
**My changes & verification:** Re-ran tsc, jest (16/16), lint; grepped `src/` for hex literals, `fontWeight`, letter-spacing and upper-casing outside tokens — none. Reviewed tokens against DESIGN.md tables. _Seif: add your notes._
**Rationale:** _Seif: fill in._

### AI-006 · 2026-10-24 · Seif · features/drive redesign to DESIGN.md · OpenCode (opencode/glm-5.3-flash-free), orchestrated by Claude Code
**Prompt (verbatim):** `docs/ai-prompts/AI-006-drive-redesign.txt`
**Output:** Drive Mode (speed card with level-2 shadow, black next-alert band, monochrome report tiles, one black CTA), Alert Overlay (modal card, pill vote buttons), Alert Settings (tab-toggle segmented controls, faq-row toggles, validation note); ViewModels unchanged.
**My changes & verification:** Re-ran tsc, jest, lint, Android export; grepped screens/components for hex, font props, letter-spacing and store/service/data imports — none. Replaced a duplicated `SpeedStatus` union with a type re-export from the domain so it can't drift. _Seif: add on-device review notes._
**Rationale:** _Seif: fill in._

### AI-007 · 2026-10-24 · Seif · dark mode + appearance toggle · OpenCode (opencode/glm-5.3-flash-free), orchestrated by Claude Code
**Prompt (verbatim):** `docs/ai-prompts/AI-007-dark-mode.txt`
**Output:** light/dark semantic palettes (dark = DESIGN.md polarity flip: black canvas, white primary CTA, white inverse band), persisted theme preference store (System/Light/Dark), ThemeProvider + `useTheme`/`useThemedStyles`, hairline borders on elevated surfaces in dark, all ui primitives / navigation / drive screens migrated, Appearance section in Alert settings.
**My changes & verification:** Re-ran tsc, jest (16/16), lint; grepped for hex/rgba outside `src/theme`, static colour imports, raw font props, and store imports in screens — none. Reviewed ThemeProvider/useTheme and confirmed speed-status colours still drive the gauge and status line. _Seif: test both schemes on device and add notes._
**Rationale:** _Seif: fill in._

### AI-008 · 2026-10-24 · Seif · splash, onboarding, sign-in / sign-up, route guards · OpenCode (opencode/glm-5.3-flash-free), orchestrated by Claude Code
**Prompt (verbatim):** `docs/ai-prompts/AI-008-onboarding-auth.txt`
**Output:** User entity, AuthRepository + mock (demo@roadsense.app / Drive2026), pure form validators with 13 new Jest tests, persisted session store, `Stack.Protected` guards (onboarding → auth → app), branded in-app splash, 3-slide onboarding, `TextField` primitive, sign-in and sign-up screens with validation, Account / sign-out section in settings, black native splash in app.json.
**My changes & verification:** Re-ran tsc, jest (29/29), lint, Android export and the architecture/colour greps. Fixed a bug where the splash's `onFinished` callback was recreated on every root render, restarting the 1.2 s splash timer on hydration or theme change (now a stable `useCallback`). Note: mock accounts created via sign-up live in memory only until the real backend is added. _Seif: walk through the flow on device and add notes._
**Rationale:** _Seif: fill in._

### AI-009 · 2026-10-24 · Seif · fix launch flow + DESIGN.md sizing · OpenCode (opencode/glm-5.3-flash-free), orchestrated by Claude Code
**Problem reported:** flow broke after onboarding; sizes didn't match DESIGN.md.
**My diagnosis before delegating:** (1) deleting `src/app/index.tsx` made `(onboarding)/index` the only "/" anchor, so once the onboarding/auth guards flipped the router had no valid fallback route; (2) onboarding slides used the full window width inside a 16-px-padded `Screen`, so pages were wider than the pager (clipped, off-centre, wrong dot index); (3) pill buttons and text inputs used padding that didn't match DESIGN.md component specs.
**Prompt (verbatim):** `docs/ai-prompts/AI-009-fix-flow-sizes.txt`
**Output:** always-available `index` redirect route + `/onboarding` route, edge-to-edge measured pager with `getItemLayout`, splash no longer intercepts touches, DESIGN.md padding for pills/inputs/icon buttons, display text capped at 1.3× OS font scale, and `__tests__/appFlow.test.tsx` — 4 router tests that render the real `src/app` and walk launch → onboarding → skip → sign-in → demo sign-in → drive → settings → sign-out.
**My changes & verification:** confirmed `node_modules` untouched; moved the RNTL "don't clean up" opt-out from a global jest setup file into the flow test only; re-ran tsc, jest (33/33), lint, Android export and the colour/font/import greps. _Seif: verify on device and add notes._
**Rationale:** _Seif: fill in._

### AI-010 · 2026-10-24 · Seif · auth input sizing + Google/Apple buttons · Claude Code (claude-opus-5-5), written directly (no OpenCode)
**Prompt (verbatim):** "review the sizes of the input at the sign-in/up and please also add btns for signup using google,apple"
**Output:** `TextField` fixed to DESIGN.md text-input height (16 + 24 + 16 = 56; was ~79 because row padding, row min-height and input min-height stacked); 24-px password toggle with a 44-pt hit area. Mock provider sign-in (`AuthProvider`, `signInWithProvider` in repository → store → `useSocialAuthViewModel`), `SocialAuthButtons` ("or" divider + white secondary pills with monochrome Google/Apple glyphs) on sign-in and sign-up; flow test extended (34/34).
**My changes & verification:** _Seif: fill in._
**Rationale:** _Seif: fill in._

### AI-011 · 2026-10-24 · Seif · Google Maps (shared map kit + Drive Mode map card) and prefilled demo login · OpenCode (opencode/glm-5.3-flash-free), orchestrated by Claude Code
**Prompt (verbatim):** `docs/ai-prompts/AI-011-maps-prefill.txt`
**Output:** `src/components/map` (RoadMap with PROVIDER_GOOGLE on Android / Apple Maps on iOS Expo Go, grayscale light/dark Google map styles, camera / hazard / user markers, route line with travelled progress), Drive Mode map card (demo route, cameras, hazards, follow-camera while driving, Recentre pill), `useDriveMapViewModel`, pure `fitRouteRegion` / `nearestRouteIndex` with tests, `app.config.ts` that adds the native Google Maps key only when `EXPO_PUBLIC_GOOGLE_MAPS_KEY` is set, `DEMO_CREDENTIALS` prefilled on sign-in in `__DEV__`.
**My line-by-line review found and fixed:** (1) the user arrow was rotated inside a marker view that is snapshotted after 400 ms, so it froze at the first heading — now uses the Marker `rotation` prop; (2) camera/hazard/user markers never refreshed after a light/dark switch — `useTracksViewChanges` now re-arms on a redraw key; (3) `DriveMapCard` (a feature component) called domain use cases — route framing and expired-hazard filtering moved into `useDriveMapViewModel`; (4) `activeHazards` included expired hazards; (5) `fitRouteRegion([])` produced Infinity/NaN — falls back to central Cairo (+ test); (6) unused test import and a comment typo. Re-ran tsc, jest (41/41), lint, Android export, `expo config`. _Seif: check the map on an Android phone in Expo Go and add notes._
**Rationale:** _Seif: fill in._

### AI-012 · 2026-10-24 · Seif · fix `npx expo start` crash ("window is not defined") · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim):** pasted terminal output of `npx expo start` ending in `ReferenceError: window is not defined … at Object.setHasHydrated`.
**Cause:** `app.json` had the template's `"web": { "output": "server" }`, so the dev server rendered routes in Node; the session store's `setHasHydrated` persisted through AsyncStorage, whose web build calls `window.localStorage`, which doesn't exist in Node.
**Fix:** web output set to `"single"` (RoadSense has no need for server rendering) and a shared `src/stores/persistStorage.ts` that uses AsyncStorage normally but a no-op storage when running on web without `window`.
**Verification:** reproduced the crash by requesting `/` from a running dev server; after the fix the same request, the Expo Go manifest and the Android bundle all return 200 with no errors; tsc, jest (41/41), lint pass. _Seif: fill in your notes._

### AI-013 · 2026-10-24 · Seif · fix web crash in react-native-maps · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim):** pasted Metro web log ending in `TypeError: (0 , _reactNativeWebDistIndex.codegenNativeComponent) is not a function` from `react-native-maps/src/specs/NativeComponentGooglePolygon.ts`.
**Cause:** react-native-maps is native-only; opening the app in a browser imported it through `src/components/map`.
**Fix:** `src/components/map/index.web.ts` + `WebMapFallback.tsx` — Metro resolves the `.web.ts` entry on web, so the native module is never bundled there; the map card shows a "The live map runs in the mobile app" placeholder and overlays render nothing. Android/iOS are unchanged.
**Verification:** web export contains no react-native-maps native specs and does contain the fallback; Android export still contains react-native-maps; tsc, lint, jest (41/41) pass. _Seif: fill in your notes._

### AI-014 · 2026-10-24 · (Mohamed's screens, built from Seif's session) · Live Map, Report Details, Route Preview · OpenCode (opencode/glm-5.3-flash-free), orchestrated by Claude Code
**Prompt (verbatim):** `docs/ai-prompts/AI-014-map-screens.txt`
**Output:** Destination/PlannedRoute entities, RouteRepository + 5 mock Cairo routes, `getAlertsAlongRoute` + `pointToSegmentDistanceM` with tests, `useRouteStore`, marker press props + `PinMarker` in the map kit, the three screens with ViewModels and components, router tests (`mapScreens.test.tsx`).
**Line-by-line review found and fixed:** (1) Live Map re-fit the map on every render because the filter key array was rebuilt each render — memoised; (2) Route Preview map had no initial region and relied on `fit()` before the map was ready — now gets the route frame; (3) a slower route response could overwrite a newer destination — stale responses ignored; (4) route alert icons were looked up by title text — alerts now carry `hazardType`; (5) "Start drive" showed before any route was chosen, and no loading state while a route loaded; (6) the pure use case read the clock internally — `now` is a parameter; (7) navigation moved from the screen into the ViewModel; unused prop and a hard-coded radius removed; (8) a test that asserted nothing now checks the filter counts. Gates: tsc, jest 58/58, lint, Android + web export.
### AI-015 · 2026-10-24 · (Yehia's screens, built from Seif's session) · Trip History, Trip Details, Stats & Replay · OpenCode (opencode/glm-5.3-flash-free), orchestrated by Claude Code
**Prompt (verbatim):** `docs/ai-prompts/AI-015-trips-screens.txt`
**Output:** reusable mock trip builder + 6 Cairo road trips (`MOCK_TRIPS`, `DEMO_TRIP` unchanged), `buildSpeedSegments`, `summarizeTripEvents`, `getWeeklyStats`/`startOfWeek`, `groupTripsByDay` with tests, `useTripStore` (trips + replay), `setDriveRoutePoints` in the location service, `SegmentedRouteLine` in the map kit, the three screens with ViewModels and components, router tests (`tripScreens.test.tsx`).
**Line-by-line review found and fixed:** (1) weeks were moved by adding multiples of 24 h, which shifts every day by one hour across Egypt's daylight-saving change (29 Oct 2026) and mislabels the bar chart — now calendar `addDays` with a DST test; (2) Trip Details reloaded all trips and all hazards on every visit, flipping the shared hazard store to "loading" and flashing the Drive tab — screens now load only when the store is empty; (3) "This week" title stayed after paging to earlier weeks and duplicated the range label; (4) weekly "Over-limit" tile counted points without saying so; (5) tile radius token, unused style and a formatting glitch. Gates: tsc, jest 62/62, lint, Android + web export.
**Rationale:** _to be filled in by the team member who owns these screens._
