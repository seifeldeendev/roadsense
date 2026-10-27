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
**Rationale:** _to be filled in by the team member who owns these screens._

### AI-015 · 2026-10-24 · (Yehia's screens, built from Seif's session) · Trip History, Trip Details, Stats & Replay · OpenCode (opencode/glm-5.3-flash-free), orchestrated by Claude Code
**Prompt (verbatim):** `docs/ai-prompts/AI-015-trips-screens.txt`
**Output:** reusable mock trip builder + 6 Cairo road trips (`MOCK_TRIPS`, `DEMO_TRIP` unchanged), `buildSpeedSegments`, `summarizeTripEvents`, `getWeeklyStats`/`startOfWeek`, `groupTripsByDay` with tests, `useTripStore` (trips + replay), `setDriveRoutePoints` in the location service, `SegmentedRouteLine` in the map kit, the three screens with ViewModels and components, router tests (`tripScreens.test.tsx`).
**Line-by-line review found and fixed:** (1) weeks were moved by adding multiples of 24 h, which shifts every day by one hour across Egypt's daylight-saving change (29 Oct 2026) and mislabels the bar chart — now calendar `addDays` with a DST test; (2) Trip Details reloaded all trips and all hazards on every visit, flipping the shared hazard store to "loading" and flashing the Drive tab — screens now load only when the store is empty; (3) "This week" title stayed after paging to earlier weeks and duplicated the range label; (4) weekly "Over-limit" tile counted points without saying so; (5) tile radius token, unused style and a formatting glitch. Gates: tsc, jest 62/62, lint, Android + web export.
**Rationale:** _to be filled in by the team member who owns these screens._

### AI-016 · 2026-10-24 · Seif · integration of the Map and Trips branches · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim):** "start now implementing the other screens from the phase-1 file and start implementing them using $opencode-delegate and then check after he finish"
**Output:** merged `mohamed/map-reports` and `yehia/trips-stats` into `phase-1-integration` (conflicts in the map-kit barrel and this log, resolved by keeping both sides). Cross-feature follow-ups: Drive Mode's map now subscribes to the route that is actually being driven (`getDriveRoute` / `subscribeDriveRoute` in the location service, read with `useSyncExternalStore`), so "Replay in Drive Mode" draws the replayed trip instead of the Salah Salem demo; Trip Details marks the trip end with the kit's `PinMarker` instead of a second position arrow; new `driveRoute.test.ts`.
**Verification:** tsc, jest 80/80, lint, architecture/colour greps, Android + web export, and a running dev server served the Expo Go manifest, Android bundle and web page (200). _Seif: fill in your notes._

### AI-017 · 2026-10-25 · Seif · Radarbot-style Drive map (full-screen map + floating controls) · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim):** "I want the map is being identical like way in RadarBot cause our app is the same as RadarBot so check what radar bot is doing then refactor what we did here to be identical and do not forget to use @DESIGN.md and also implement all of this using $opencode-delegate" — then, after OpenCode runs were killed for low memory / stalled: "do the edits yourself stop opencode".
**Research:** Radarbot help centre (Main Screen, Display options, Alerts and warnings): Sound quick menu, Other options (satellite, traffic, screen mode), New alert/radar, Active alerts, Go to, keep-north option, direction-of-travel alerts. Behaviour copied; visuals follow DESIGN.md (no Radarbot branding). The spec handed to OpenCode is kept in `docs/ai-prompts/AI-017-radarbot-drive-map.txt`.
**Output:** Drive tab rebuilt as a full-bleed map: "Where to?" search + settings on top, speed-limit sign top-left, round Sound / Other options / Recentre buttons on the right, speed readout bottom-left, "New alert" button (black only while driving so the idle screen keeps one black CTA), bottom card with road name, "N alerts ahead" and Start/Stop. New `BottomSheet` primitive (with a close button for screen readers) used for Sound, Map options, New alert and Active alerts sheets. Settings gain soundMode / mapType / showTraffic / northUp; RoadMap gains mapType, showsTraffic, northUp; alerts are announced via pure `alertFeedback` (speak / vibrate / none); `findUpcomingAlerts` takes an optional look-ahead distance; `nearestRoadName`; `services/haptics`. Removed the old card components. Tests: `driveHelpers.test.ts`, look-ahead case, `driveScreen.test.tsx`.
**Verification:** tsc, jest 91/91 (run in band; one parallel run flaked in an unrelated map test under memory pressure and passed on re-run), lint, colour/architecture/branding greps, Android + web export. _Seif: check on device and add notes._

### AI-018 · 2026-10-25 · Seif · Radarbot-style alert panel, sound / map display / speed alarm settings · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim):** same request as AI-017 (spec in `docs/ai-prompts/AI-018-radarbot-alerts-settings.txt`).
**Output:** /alert is now a top-anchored banner over the live map (no dim): icon, title, road, live distance countdown, camera limit sign, a warning-progress bar (red + "Slow down" only when over the camera limit), round thumbs-up/down community votes. Alert settings gain Sound (shared `SoundModeList`), Map display (satellite, traffic, north up, road name) and Speed alarm (Off/80/100/120) via `useDisplaySettingsViewModel`; Drive announces a speed-alarm crossing once per crossing (pure `shouldTriggerSpeedAlarm` + tests) through a shared `announce` helper; Live Map honours satellite/traffic.
**Verification:** tsc, jest 96/96 (in band), lint, colour/architecture/branding greps, Android + web export. Unverified without a device: whether touches pass through the transparent modal to the map under the banner. _Seif: fill in your notes._

### AI-019 · 2026-10-25 · Seif · real GPS location · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim):** "the app is not getting my currrent location correct and also the selecting destination is not good as UX i want it the same as UBER"
**Cause:** Drive Mode only ever played the mock Salah Salem drive (`createDemoLocationSource`); nothing read the phone's GPS.
**Output:** `services/gps.ts` — permission request, current location (last known → fresh fix), and `GpsLocationSource` streaming real position/speed/heading via `expo-location` (deriving speed/heading from successive fixes when the device omits them); speed limit comes from the nearest known camera (`nearestSpeedLimit`, 0 = unknown → never amber/red, and not counted as over-limit). New `locationSource` setting (GPS default / Demo drive) in Alert settings; a queued trip replay or denied permission falls back to the demo with a message. The idle Drive map now centres on the real position with the user marker; the demo route line only shows in demo mode, during a replay, or for a planned route. Per-reading drive logic moved to `drivePointHandler.ts`. `expo-location` permission text added to app.json.
**Verification:** tsc, jest 98/98, lint, greps, `expo config`. Real GPS behaviour is device-only. _Seif: test outdoors on a phone and add notes._

### AI-020 · 2026-10-25 · Seif · road-following routes + destination search on the Drive screen (ride-hailing style) · Claude Code (claude-opus-5-5), written directly
**Prompts (verbatim):** "…the selecting destination is not good as UX i want it the same as UBER" and "the route is not being drawed correct and also notice that the selecting distination is sepereated screen not like uber you know what i mean"
**Causes:** routes were a few hand-picked waypoints joined by straight lines (cutting through blocks), and choosing a destination navigated to a separate screen.
**Output:** `data/osrm/OsrmRouteRepository` fetches real road geometry, distance and duration from the public OSRM demo server (no key; light use), falling back to the mock repository offline; the mock builds a straight-line estimate (`estimateRoute`, tested) from any start. Routes now start from the real location. The Drive screen hosts the whole flow: "Where to?" expands a full panel over the map (pickup dot + destination square inputs, "Set location on map", recent places, nearest suggestions with distances, live phone-geocoder results); choosing a place draws the route on the same map with a bottom card (time, distance, cameras/hazards on the way, Start drive, clear); pin mode pans the map under a fixed pin and reverse-geocodes it. Recent places persist (max 5). Route Preview (Live Map → "Plan a route") is kept and adapted to the new route store.
**Verification:** live OSRM call returned a 15.6 km / 18 min / 513-point road route; tsc, jest 100/100 (tests stub `fetch`), lint, greps, Android + web export. Not yet seen on a device. _Seif: fill in your notes._

### AI-021 · 2026-10-25 · Seif · real Egypt road database (radars, police, speed bumps) · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim):** "you may use now @radars_eg" with the type labels `F: radar, C: Cops, R: Speed Bump, SB: Speed Bump Zone`.
**Data:** `src/data/radars/radars_eg.json` — 4,255 points across Egypt (string fields, Arabic road names): 545 radars, 207 police, 3,094 speed bumps, 369 bump zones; 40 points with other codes (U, S, PN, B, CC, TC, SV, IP) are skipped because they have no label.
**Output:** `parseRadarFeed` + `RadarCameraRepository` replace the mock cameras (mock hazards stay as community reports). `CameraType` gains police / speed_bump / bump_zone; new alert switches Police and Speed bumps (saved settings migrated to v1 with them on); alerts titled "Police ahead" / "Speed bump ahead" / "Speed bump zone ahead", limit badges only for speed cameras; icons via `fixedPointIcon` / `alertIcon`; road speed limits only from points that state one. Maps draw only the nearest 150 points (`nearestPoints`); the route check skips points outside the route's bounding box; route summaries list counts per kind (`describeRouteAlerts`); Live Map gains Police / Bumps filters.
**Verification:** tsc, jest 107/107 (new `radarData.test.ts`, including loading the real file), lint, greps, Android + web export (Android JS 3.9 MB). _Seif: fill in your notes; confirm the dataset's source allows redistribution before pushing it to a public repo._

### AI-022 · 2026-10-25 · Seif · Account tab (ride-hailing style) and hide options · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim):** "add an option to hide whatever i want from the app and move the settings to the bottom navbar and create it identical to Uber"
**Output:** new `src/features/settings` with an Account tab (name + round avatar header, three grey shortcut tiles, an inverse promo band to switch GPS / demo drive, plain settings rows, sign out) and pages Map & layers (location, map display, per-type "Show on map"), Sound & voice, Drive screen (hide speed-limit sign, speedometer, road name, alerts-ahead pill) and Appearance. Settings gain `hiddenOnMap`, `showLimitSign`, `showSpeedometer`, `showAlertsAhead` and a generic `update`; pure `visibleOnMap` filters the Drive and Live maps. The settings cog left the Drive screen; Alert settings (graded screen, route kept) now holds only alert distance, types, amber, speed alarm, preview and reset. Shared `RadioList` primitive.
**Verification:** tsc, jest 108/108, lint, colour/architecture/branding greps, Android + web export. _Seif: fill in your notes._

### AI-023 · 2026-10-25 · Seif · route drawing review and fixes · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim):** "the route creation now got an issues while drawing so I think you need to review it again"
**Found and fixed:** (1) the route vanished at the start of a drive — before the first GPS fix the progress index is -1 and `RouteLine` kept only the last point; now `splitRoute` keeps the whole line ahead (+ tests). (2) In Demo drive, "Start drive" replaced the planned route with the Salah Salem demo; demo playback now simulates a drive along the planned route (`simulateDrive`, + tests) and a queued trip replay replaces the plan. (3) Choosing a destination before the first GPS fix silently routed from the demo start; the planner now fetches a fix first. (4) Route Preview and the Drive planner share the route store, so picking a destination in Route Preview drew it on the Drive map in the background; the Drive planner now draws only its own choices and Route Preview hands its route over on "Start drive". (5) When OSRM is unreachable the fallback (hand-made or straight-line) route is marked `estimated` and labelled "Estimated" on the route card.
**Verification:** tsc, jest 116/116, lint, greps, Android + web export. Not yet seen on a device. _Seif: fill in your notes._

### AI-024 · 2026-10-26 · Seif · floating tab bar · Claude Code (claude-opus-5-5), written directly
**Prompts (verbatim):** "reivew the navbar and start using $opencode-delegate turning the navbar into this mobile app UI, glassmorphism aesthetic with frosted glass effects, soft glowing lights, vibrant pink and purple color palette, … " → OpenCode could not run (free model never responded; paid models: "Insufficient account funds") → "start doing it yourself" → "no not thata colors please review the @DESIGN.md colors and follow them and the whole design at the md file just follow what it says".
**Output:** `src/components/navigation` — a floating tab bar in DESIGN.md terms: canvas pill (button-floating) with a light frosted blur behind a translucent canvas layer, hairline rim and Level 3 pill-float shadow; the active tab sits on a solid primary pill (selected chip) that springs between tabs (no motion when reduce-motion is on), with a filled icon and its label; inactive tabs are outline icons in `body` grey with accessibility labels. Same tab behaviour as the default bar (tabPress / navigateToTab / tabLongPress). `useTabBarSpace()` keeps Drive's bottom card, the pin picker, the planner list, Live Map's card and FAB, and the Trips / Stats / Account lists clear of the bar. The first pink/purple gradient draft was replaced before committing; `expo-linear-gradient` was removed again. The original brief is kept in `docs/ai-prompts/AI-024-tab-bar-brief.txt`.
**Verification:** tsc, jest 116/116 (one cold first run flaked and passed on 3 re-runs), lint, colour/architecture greps, Android + web export. On Android the blur needs a BlurTargetView, so it shows as the translucent canvas layer only. _Seif: fill in your notes._

### AI-025 · 2026-10-26 · Seif · native system tab bar · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim):** pasted spec for "native translucent/liquid glass bottom tabs … using react-native-bottom-tabs" (clarified by Seif: "the other prompt i sent is how the navbar styling i want"), choosing option 2 (react-native-bottom-tabs with a development build).
**Finding:** react-native-bottom-tabs cannot work with Expo Router in SDK 58. Its adapter (`@bottom-tabs/react-navigation`) calls `useNavigationBuilder` from `@react-navigation/native`, but SDK 58's Expo Router runs a vendored fork with its own `NavigationStateContext` (`expo-router/build/react-navigation/core`), so the navigator would never find the router's navigation context. The packages were installed, verified incompatible, and removed.
**Output:** the same native tab bar through Expo Router's built-in `NativeTabs` (`expo-router/native-tabs`): system UITabBar with Liquid Glass on iOS 26+ (minimises on scroll), Material navigation bar on Android; SF Symbols / Material Symbols icons with filled selected states; DESIGN.md colours (ink tint adapting to the glass via `DynamicColorIOS`, gray inactive, canvas background and soft indicator on Android); `ThemeProvider` to avoid white flashes. The custom JS glass bar and `expo-blur` were removed; `useTabBarSpace()` now offsets bottom overlays only on iOS, where the bar floats. Jest uses a JS-tabs stand-in (`test-support/nativeTabsMock.tsx`) because the system bar mounts every tab at once under Jest.
**Verification:** tsc, jest 116/116, lint, Android + web export. The native bar itself can only be seen on a device. _Seif: fill in your notes._

### AI-026 · 2026-10-26 · Seif · NativeWind styling across the app · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim):** "refine the app and redesign the whole components and screen using NativeWind and also review teh navbar again cause it's not same as i want" (navbar handled in AI-025).
**Output:** NativeWind 4.2.7 + Tailwind 3.4 (babel, metro, `global.css`, `tailwind.config.js`). The Tailwind theme is DESIGN.md: spacing, radii, Inter families and the type scale come from `src/theme/scales.json`, which `tokens.ts` also reads, so there is one source; colours are CSS variables (`bg-canvas`, `text-ink`, `bg-status-over` …) set at the root from the active light/dark palette (`src/theme/cssVars.ts`), so classes follow the theme. All UI primitives and the auth, onboarding, settings, trips, map and drive screens moved from StyleSheet to `className`; pressed states use `active:` classes. Kept as plain styles on purpose: DESIGN.md elevation shadows, hairline dividers (`StyleSheet.hairlineWidth`), icon colours, Animated views, and map markers / MapView (hundreds of snapshotted markers). Small refinements: chevrons on Account rows, a hairline-coloured divider in Map options (was black), sticky day headers with a canvas background in Trips, onboarding slides sized to the pager (they ended half-way on web).
**Verification:** tsc, jest 116/116 (Jest skips the NativeWind transform and stubs CSS; cold first runs still flake), lint, Android + web export; generated CSS checked for token values; web build checked in Chrome in dark mode (onboarding, sign-in, Account). Not yet seen on a device. _Seif: fill in your notes._

### AI-027 · 2026-10-26 · Seif · Google Maps on iOS and web · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim):** "I just wanted for all devices google maps api also for the  web and please at ios use google maps"
**Output:** iOS uses `PROVIDER_GOOGLE` like Android (Apple Maps only inside Expo Go, which has no Google Maps SDK); `app.config.ts` passes `EXPO_PUBLIC_GOOGLE_MAPS_KEY` to the react-native-maps config plugin (Android manifest + iOS Google Maps SDK). Web renders real Google maps through the Maps JavaScript API (`@vis.gl/react-google-maps`, `src/components/map/GoogleWebMap.tsx`): advanced markers reusing the native marker visuals, route and speed-status polylines, fit / follow camera, satellite, traffic and pan callbacks. Without a key web keeps the placeholder. Web markers need a map id (`EXPO_PUBLIC_GOOGLE_MAPS_MAP_ID`, default `DEMO_MAP_ID`), so the grayscale look on web needs a cloud-styled map id.
**Verification:** tsc, lint, jest 116/116 (a cold first run flaked again), Android export; web built with a dummy key and opened in Chrome: the Maps JavaScript API loaded and rejected the key as expected. No real key available, so no real map seen yet on any platform. _Seif: fill in your notes._

### AI-028 · 2026-10-26 · Seif · why not all radar points show · OpenCode (opencode/glm-5.3-flash-free, read-only plan agent), reviewed by Claude Code
**Prompt (verbatim):** "and also please using $opencode-delegate search for the cause that all of the data at @src/data/radars/radars_eg.json is not being viewed at the map"
**Output:** `docs/radar-visibility-findings.md`. Main cause: the maps draw only the nearest 150 points around a fixed centre (GPS fix or demo start) that does not follow panning; also 40 points with unlabelled type codes are skipped. No code changed.
**Verification:** Claude re-checked the type counts against the JSON and the cap/radius/centre code lines. _Seif: fill in your notes._

### AI-029 · 2026-10-26 · Seif · radar points follow the map when panning · OpenCode (opencode/glm-5.3-flash-free, build agent), reviewed by Claude Code
**Prompt (verbatim):** "make opencode implement this and review after him" (the fix suggested in docs/radar-visibility-findings.md).
**Output:** the map reports its visible region after each pan/zoom (`onRegionChange` on native `RoadMap` and the web Google map); new pure `pointsInView` (nearest 150 within half the visible diagonal, 2–50 km) and `isMinorRegionChange` (ignores <100 m / <10% zoom nudges) in `fixedPoints.ts`, with tests. Live Map and the idle Drive map draw the points around what is on screen; driving keeps the 4 km around the car. Live Map refits only on first load, filter change or Recentre (which returns to the driver), so panning never fights the user. The 40 unlabelled type codes are still skipped (meaning not confirmed).
**Review (Claude):** read the whole diff against the brief (scope, MVVM rules, no refit loop, driving unaffected), reran tsc, lint, jest 123/123 twice, Android + web export. Not yet seen on a device. _Seif: fill in your notes._

### AI-030 · 2026-10-26 · Seif · glass surfaces across the app · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim):** "start implementing the glassmorphism all over the app same as the navbar"
**Output:** new `GlassSurface` primitive (`src/components/ui/GlassSurface.tsx`, `expo-glass-effect` + `expo-blur`) that draws the tab bar's material where the platform can: Liquid Glass on iOS 26+ (interactive on buttons), a system chrome blur on older iOS, a 24 px CSS backdrop blur over a frosted fill on web, and a near-opaque canvas fill on Android (Android cannot blur the native map surface). Glass is used for everything that floats over the map or content: the request-form cards (Drive bottom bar, route summary, pin picker, Live Map card), the "Where to?" pill, round map buttons (Recentre via a new `IconButton surface="glass"`), the speedometer, the Live Map filter bar, bottom sheets and the alert panel. Kept solid on purpose: the black primary actions, the speed-limit sign and the inverse toast (contrast), and plain-background screens where glass would be invisible. Grayscale only, per DESIGN.md (new `canvasFrost` token).
**Verification:** tsc, lint, jest 123/123 (a cold first run flaked again), Android + iOS + web export; web Drive screen checked in Chrome (blur, fill and radii applied). Liquid Glass / iOS blur need a device. _Seif: fill in your notes._

### AI-031 · 2026-10-26 · Seif · Google Maps only (Apple Maps removed) · OpenCode (opencode/glm-5.3-flash-free, build agent), reviewed by Claude Code
**Prompt (verbatim):** "ask opencode for removing the Apple Maps integration and make it only google maps"
**Output:** `RoadMap` always uses `PROVIDER_GOOGLE` on iOS and Android; the iOS Expo Go fallback to Apple Maps (expo-constants check) and the Apple-only `altitude` camera field and `userInterfaceStyle` prop are gone; the app.config comment and the test mocks no longer mention Apple Maps. Consequence: the map no longer shows in Expo Go on iOS (no Google Maps SDK there); iPhone testing needs a development or store build.
**Review (Claude):** read the diff (scope OK, Apple sign-in untouched), moved one misplaced comment and dropped an empty one, grep found no Apple Maps leftovers; tsc, lint, jest 123/123 (a cold first run flaked again), iOS + Android export. _Seif: fill in your notes._

### AI-032 · 2026-10-26 · Seif · iPhone map back on Apple Maps · Claude Code (claude-opus-5-5), written directly
**Prompts (verbatim):** "there's no map being displayed on my iphone" → "remove the implementing of google maps and please add also profile screen …"
**Cause found:** the iPhone runs the app in Expo Go (no ios/ folder, no dev client, no EAS config), and Expo Go for iOS ships without the Google Maps SDK, so after AI-031 the map had nothing to draw with. Building iOS locally is not possible on Windows.
**Output:** iPhone uses Apple Maps again (works in Expo Go, no key), with the Apple camera altitude and light/dark `userInterfaceStyle` restored; Android keeps Google Maps (its only provider); the iOS Google Maps SDK is no longer added by the config plugin. The web Google map is unchanged. Apple Maps ignores the grayscale `customMapStyle`.
**Verification:** tsc, jest, iOS + Android export. Not yet seen on the iPhone. _Seif: fill in your notes._

### AI-033 · 2026-10-26 · Seif · Profile screen · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim):** "… please add also profile screen for the user to account details like name and profile pic and these stuff"
**Output:** `/settings/profile` (settings feature): large avatar with a camera badge and "Change photo" sheet (take photo, choose from library, remove; `expo-image-picker` with square crop, `services/imagePicker.ts`), Name, Email and optional Phone fields, validation shown after the first save attempt (`validateProfile`, `validatePhone`), Save disabled until something changes, errors from the repository shown inline. `User` gains optional `phone` and `avatarUri`; `AuthRepository.updateProfile` (mock keeps stored accounts in sync and refuses another account's email); `useSessionStore.updateProfile`. The Account header (name + photo) and a new "Personal info" row open it; the header shows the photo through a new `Avatar` primitive. `FormErrorNote` moved to the shared UI kit so features don't import each other. Jest `testTimeout` raised to 20 s: the screen suites' router setup kept exceeding 5 s when run in parallel.
**Verification:** tsc, lint, jest 134/134 four runs in a row (new `profile.test.ts`, `profileScreen.test.tsx`), iOS + Android + web export; Profile screen checked in Chrome. Camera / photo library need a device. _Seif: fill in your notes._

### AI-034 · 2026-10-26 · Seif · ImageBackground warning silenced · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim):** pasted warning "WARN  ImageBackground is deprecated and will be removed in a future release. …"
**Cause:** not app code — NativeWind's runtime (react-native-css-interop 0.2.7, latest) registers React Native's deprecated `ImageBackground` as soon as it loads, and because the NativeWind JSX runtime also compiles React Native's own LogBox, that happens during React Native's setup, before the app's entry. No fixed release exists (NativeWind 5 is still a release candidate).
**Output:** `silenceKnownWarnings.js` drops only that message; `metro.config.js` runs it before React Native's setup (`getModulesRunBeforeMainModule`) and the custom `index.js` entry keeps it in the bundle. Checked in a dev iOS bundle that it runs first. Remove when NativeWind stops touching `ImageBackground`.
**Verification:** lint, jest, iOS/Android/web export. _Seif: fill in your notes._

### AI-035 · 2026-10-26 · Seif · plan your drive on the home screen · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim):** "refine the plan your drive page i want it to be at the homepage not new screen"
**Output:** the full-screen "Plan your drive" panel is replaced by `PlannerDropdown`: tapping "Where to?" grows a glass card at the top of the Drive map (trip inputs, "Set location on map", recent places and suggestions, list capped at ~42% of the screen), the map stays visible below and tapping it closes the planner. The home screen also shows up to three one-tap place chips under the search pill (`QuickPlaces`; recent first, then nearest; hidden while driving). The trip inputs card lost its own surface so it sits inside the glass.
**Verification:** tsc, lint, jest 136/136 twice (new quick-place and tap-outside tests), iOS/Android/web export; web Drive screen checked in Chrome with the real Google map (dropdown over the map). _Seif: fill in your notes._

### AI-036 · 2026-10-27 · Seif · location state into a navigation store (architecture item 1) · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim, item heading):** "### 1. Dismantle the `src/services/location.ts` singleton (highest priority)"
**Output:** `src/services/location.ts` (module-level route state, a hand-rolled listener set, and a services→data import) is gone. `LocationSource` is now `getCurrent()` / `watch(cb): Unsubscribe`; `ExpoLocationSource` and the demo `MockLocationSource` live in `src/data/location/`; `useNavigationStore` (`createNavigationStore`, `reset()`) holds the demo, drive, planned and queued-replay routes; `services/gps.ts` keeps only permission and fix helpers. The Drive road name now updates when the drive route changes (a missing memo dependency; pinned by a test). Never-called demo playback-rate code removed.
**Verification:** tsc, lint, jest 138/138. _Seif: fill in your notes._

### AI-037 · 2026-10-27 · Seif · repositories injected through a provider (architecture item 2) · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim, item heading):** "### 2. Replace the `src/data/di.ts` service locator with an injectable seam"
**Output:** `src/data/di.ts` is replaced by `Dependencies` + `createDependencies(overrides)`; the hazard, route, session, trip and navigation stores are `createXStore(deps)` factories (the `useXStore` exports remain); `DependenciesProvider` in the root layout exposes `useDependencies()` / `useStores()`, and tests pass fakes to get fresh stores. Viewmodels no longer call `getState()`; mount-time loads use `loadUnless(skip)` with each screen's exact old condition; hazard reports read the position at tap time; a second `watch()` on a location source ends the first instead of leaking it.
**Verification:** tsc, lint, jest 143/143 (new `dependencySeam`, `locationSources` tests). _Seif: fill in your notes._

### AI-038 · 2026-10-27 · Seif · radar cameras from a prebuilt SQLite asset (architecture item 3) · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim, item heading):** "### 3. Move `radars_eg.json` (1.07 MB) into seeded SQLite"
**Output:** `npm run build:radars` (`scripts/build-radar-db.mjs`, Node's built-in `node:sqlite` + the app's `parseRadarFeed`) builds `assets/data/radars_eg.db` (4,215 cameras, 438 KB) with a content-hash seed version. On native, `openRadarDatabase` copies it into the SQLite directory only when missing or seeded from other data (`expo-asset` + `expo-file-system`, now explicit dependencies), and `SqliteRadarCameraRepository` reads it; web keeps the bundled JSON (`index.web.ts`). The `.db` is bundled through Metro's default `assetExts` (which lists `db`); `metro.config.js` is unchanged. The JSON moved to `assets/data/`.
**Why, honestly (measured, Android release export, before vs after):** JS bundle 4,364,504 → 4,204,428 B (−160 KB; −86 KB gzipped) because the minified JSON was smaller than the 1.07 MB file and expo-sqlite / expo-file-system add ~180 KB of JS; the `.db` adds 438 KB (155 KB gzipped), so **install size grows ~280 KB**. The win is ~86 KB less per over-the-air update (the `.db` re-downloads only when its seed version changes) and, mainly, the groundwork for querying cameras by viewport (item 3b). **Not a cold-start improvement:** every launch still loads all 4,215 cameras when the Drive tab mounts. The original task's premise was also wrong: the old path never called `JSON.parse`; Metro compiles a required `.json` into a JavaScript module that Hermes evaluates.
**Verification:** tsc, lint, jest 148/148 (tests read the shipped `.db` through `node:sqlite`, check it equals what the JSON parses to, fail on a stale seed version, and cover copy-only-when-needed); Android `export` and `export:embed` (`res/raw/assets_data_radars_eg.db`) and web export. Not measured on a device. _Seif: fill in your notes._

### AI-039 · 2026-10-27 · Seif · radar database index and schema-aware seed version · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim):** "Add the lat/lng index and fold a schema version into the seed hash."
**Cause fixed:** the seed version hashed only the JSON export, so a schema change that left the JSON alone would not re-copy the database, and a device could run new code against the old schema.
**Output:** `scripts/radarSchema.cjs` holds the schema SQL, a schema version and the seed-version hash (export + schema SQL + schema version), shared by the build script and the tests. The database gains `cameras_lat_lng` on `(lat, lng)`, which SQLite uses for bounding-box reads (`SEARCH cameras USING INDEX cameras_lat_lng`); nothing queries by box yet. The `.db` grows from 438 KB to 549 KB, so with AI-038 the app's install size is up ~390 KB net (JS bundle −160 KB, `.db` +549 KB). The index is groundwork for the bounding-box queries (items 3c-1 and 3c-2), not free.
**Verification:** tsc, lint, jest 149/149, including a new check that the shipped `.db` carries the current seed version and the index; a schema-version bump without a rebuild fails the tests. _Seif: fill in your notes._

### AI-040 · 2026-10-27 · Seif · duplicate map components (architecture item 4) closed as a false premise · Claude Code (claude-opus-5-5), investigated directly
**Prompt (verbatim, item heading):** "### 4. Consolidate duplicate map components"
**Claim checked:** the architecture review said `src/components/map/*` and `src/features/*/components/*` both own `DriveMap`, `RouteMapCard`, `RouteLine` and `SegmentedRouteLine`. Git history shows no feature-slice copy of any of them ever existed; the review most likely matched the same names appearing under two directory trees.
**Finding:** every map component has exactly one home, and the placement rule is already met. Feature-agnostic primitives live in `src/components/map/` (`RoadMap`, `RouteLine`, `SegmentedRouteLine`, the markers); their second definitions in `GoogleWebMap.tsx` / `WebMapFallback.tsx` and `SegmentedRouteLine.web.tsx` are the web variants chosen by `index.web.ts`, not copies. The four map cards live in their slices because each knows its feature's domain: `DriveMap` (drive: follows the car, cameras, hazards, traffic), `RouteMapCard` and `ReportMapCard` (map: a planned route; a reported hazard), `TripMapCard` (trips: speed-coloured segments and alert markers). `DriveMap` and `RouteMapCard` share no behaviour worth merging, and no feature slice imports another. The three cards share only a container className (`TripMapCard` already adds a border), which is not extracted.
**Output:** no code change. _Seif: fill in your notes._

### AI-041 · 2026-10-27 · Seif · layer boundaries enforced by lint (architecture item 5) · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim, item heading):** "### 5. Enforce the boundaries with lint, not convention"
**Output:** `eslint.config.js` encodes the layer table with `import/no-restricted-paths` (already installed through eslint-config-expo, no new dependency): a zone per layer, one per feature slice (no slice imports another), the domain barred from React / React Native / Expo / Zustand, stores barred from building production dependencies, and route files limited to features. Amendments agreed in review: features may use theme, the shared presentation folders (`components/ui`, `map`, `navigation`) and the fire-and-forget services (haptics, speech, imagePicker), but not gps / geocoding; layout files are the composition root and may wire providers, theme and fonts, but not read state that decides what to render; every layer may import domain types, and outside domain / data / stores / features that is enforced as `import type` (`@typescript-eslint/no-restricted-imports` with `allowTypeImports`, since `no-restricted-paths` cannot tell type from value imports); stores may import shared.
**Most of the first run was the table, not the code:** 51 of the 96 initial errors were features reading design tokens from `theme`, which the original layer table had simply left out; 35 more fell to the other amendments. Corrected in the config, not in code.
**Found by the graph, not by folder discipline:** a domain ↔ shared cycle. Two domain usecases read rules from `shared/constants` (`HEADING_CONE_DEG`, `HAZARD_DENIAL_LIMIT`) while `shared/constants` imports domain types. Both constants moved into the usecases that apply them; the cycle is gone.
**Remaining debt at this commit (15; AI-042 removes 9 of them, each an error with a per-line `eslint-disable` and a TODO, countable with `grep -rn "eslint-disable-next-line" src`):** `TODO(gps-di)` ×4 (gps / geocoding behind Dependencies), `TODO(auth-gate)` ×2 (session reads in `_layout.tsx` and `app/index.tsx`), `TODO(composition-root)` ×6 (store default instances and `DependenciesProvider` building production dependencies), `TODO(map-boundaries)` ×3 (`components/map` imports the UI kit once and calls the `splitRoute` usecase twice).
**Verification:** lint clean, tsc, jest 149/149; planted violations (domain importing React and a store, a cross-slice import, a feature importing data and gps, a service importing a usecase and a store) each fail with the expected rule while the allowed cases pass. _Seif: fill in your notes._

### AI-042 · 2026-10-27 · Seif · layer boundaries finished: composition root and map primitives (architecture item 5, part 2) · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim, item heading):** "### A. Finish item 5 (one commit)"
**Output:** the five store default instances and the production wiring of `DependenciesProvider` moved to `src/composition/` (`stores.ts` builds `productionStores` and re-exports `useHazardStore` etc. for code outside a feature; `AppDependenciesProvider` mounts them). Store files now export only their factories, and the generic `DependenciesProvider` takes dependencies (and optionally prebuilt stores) and throws outside a provider instead of silently falling back to production. Lint gains a composition zone and lets layout files mount `AppDependenciesProvider`. `components/map` and `components/navigation` may import `components/ui`, never the reverse. `splitRoute` left the map primitives: `useDriveMapViewModel` returns `drivenRoute` / `remainingRoute`, and both `RouteLine` variants (native and web) just draw what they are given.
**Size:** 26 files: 19 for the composition root (7 of them tests that read the old module-level stores), 7 for the map boundaries.
**Debt:** all 6 `composition-root` and 3 `map-boundaries` disables removed; 6 remain (`gps-di` ×4, `auth-gate` ×2).
**Verification:** tsc, lint, jest 149/149, web export. _Seif: fill in your notes._

### AI-043 · 2026-10-27 · Seif · tests past the domain layer, and no second fetch mid-flight (architecture item 6) · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim, item heading):** "### B. Item 6 — tests past the domain layer (one commit)"
**Output:** `__tests__/stores.test.ts` builds the hazard, route, trip and session stores from fake repositories (`createXStore(fakeDeps)`): load success and failure, `loadUnless` skipping while a load is in flight, report and vote, a slower route for an abandoned destination being ignored, replay play / tick / seek / restart, sign-in, profile update, sign-out. `__tests__/viewModels.test.tsx` renders view models inside a test `DependenciesProvider`. `__tests__/osrmRouteRepository.test.ts` covers the OSRM fallback: network failure, error status, malformed responses (no routes, non-Ok code, one-point geometry, non-JSON body) and success (GeoJSON `[lng, lat]` order, rounding, not estimated).
**Behaviour fix (in scope):** route-preview hazards, trip-details pins and the three trip-screen loads lacked the "not already loading" guard, so a screen mounting while another screen's load was in flight started a second fetch. Each now also skips while loading; each screen's data-needed condition is unchanged. A test per site starts a load, mounts the screen, and expects one fetch; with the five guards reverted, five tests fail.
**Correction:** my item-3 list of unguarded loads missed a sixth with the same drift, the trip planner's destinations (`useTripPlannerViewModel`). It was not in this item's scope and is left as known debt.
**Verification:** tsc, lint, jest 172/172 (35 suites). _Seif: fill in your notes._

### AI-044 · 2026-10-27 · Seif · gps and geocoding behind Dependencies · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim, item heading):** "### C. gps-di (one commit)"
**Output:** the domain's `LocationSources` gains `requestPermission()` and `currentPosition()`, and a new `Geocoder` interface (`search`, `describe`) joins `Dependencies`. `createDependencies` wires them to the existing `services/gps` and `services/geocoding` functions, which stay in the infrastructure layer. The Drive map, Drive mode and trip planner view models and the planner's search / pin-label hooks read them through `useDependencies()`; haptics, speech and imagePicker stay direct, as agreed. No behaviour change: the injected objects are stable, so no effect runs more often than before.
**Debt:** the 4 `gps-di` disables are removed; 2 remain (`auth-gate`).
**Verification:** tsc, lint, jest 173/173, including a test that the planner's search is debounced and served by an injected geocoder. _Seif: fill in your notes._

### AI-045 · 2026-10-27 · Seif · session gate in the auth slice · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim, item heading):** "### D. auth-gate (one commit)"
**Output:** session-driven rendering moved out of routing into `features/auth`: `useSessionGateViewModel` derives `hasHydrated`, the three route-group guards (`canOnboard`, `canSignIn`, `canUseApp`) and the start route; `SessionGate` holds the app behind the native splash until the fonts are ready and the saved session has been read back, then hides the splash; `SessionRedirectScreen` performs the index redirect. `app/index.tsx` is now a one-line re-export; the root layout keeps only wiring (fonts, providers, theme, the `Stack` declarations bound to the gate's guards). No behaviour change: nothing renders until fonts and hydration are both ready, exactly as before, and the guards and start route are the same expressions.
**Debt:** the 2 `auth-gate` disables are removed; `grep -rn "eslint-disable-next-line" src` now returns nothing.
**Note for tests:** every session store persists under the same key, so a test that builds several must await `persist.rehydrate()` before setting state, or rehydration from the shared mock storage overwrites it.
**Verification:** tsc, lint, jest 176/176 (new gate guard / start-route cases; the app-flow screen tests exercise the gate end to end). _Seif: fill in your notes._

### AI-046 · 2026-10-27 · Seif · one-off camera queries (architecture item 3c-1) · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim, item heading):** "### E. 3c-1 — one-off camera queries (one commit)"
**Output:** `CameraRepository` gains `getInBounds(bounds)`, `getByIds(ids)` and `getFirstSpeedCamera()`. SQLite answers them in road-database (rowid) order, the box query through the `cameras_lat_lng` index; the web JSON path filters in memory. `useCameraStore` (built from deps) passes them to view models, which still never touch a repository, and `useAsyncResult` (shared) runs one lookup per key. The five one-off consumers migrated: report details (cameras within a 300 m box of the hazard, keyed by hazard id so a vote does not re-query), trip details (`getByIds` for the trip's camera alerts), alert settings (`getFirstSpeedCamera`, looked up once on mount), route preview and trip planner (the route's box). The route box is `routeAlertBounds`, the same box `getAlertsAlongRoute` already filtered by (its `routeBox` became the domain helper `boundsAround`), so the query returns exactly the cameras the function could report. `getAll()` and `HazardState.cameras` stay for the drive loop and the two maps (item 3c-2).
**No new runtime patterns:** one query per key change (hazard, trip, route, mount); no refetch on pan, no caching. A failed query counts as "no cameras", as a failed full load did before.
**UX kept the same, deliberately:** report details, route preview and the trip planner stay in their existing loading state until their camera query answers, so no screen shows coordinates instead of a road name, or "Nothing reported on the way", ahead of the cameras. The added wait is one indexed query. Trip-details markers appear when their `getByIds` answers, as they appeared when the camera list loaded before. Alert settings no longer loads the hazard store just for the preview's sample camera (invisible: nothing else on that screen used it).
**Verification:** tsc, lint, jest 183/183, web export. The SQLite-equals-JSON test now covers every query on both implementations: 200 seeded random boxes (city- to country-sized, >150 non-empty, some empty), an edge-inclusive box, 50 random id sets with unknown ids, and the first speed camera. View-model tests pin the loading gate and each query. _Seif: fill in your notes._

### AI-047 · 2026-10-27 · Seif · camera working set and view queries; getAll() deleted (architecture item 3c-2) · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim, item heading):** "### F. 3c-2 — the two runtime patterns, then delete getAll() (one commit)"
**Correction, before any code (third stated claim corrected in this migration, and the one with real user impact):** the working set was approved at 5 km / 2 km, with my recommendation that Live Map's default view and the idle road name read from it. I had not checked the radii those screens draw. Measured on the real database (603 sampled positions × 4 directions, set centred 2 km from the car): Live Map's default view draws 10 km, and a 5 km set loses **53%** of its markers at 97% of positions (≈50% even with the set centred on the car). The driving map draws 4 km, and it loses **9.3%** at 57% of positions. Road name and alerts (≤ 2 km) lose none. Replaced by a derivation, not a constant: `WORKING_SET_RADIUS_M = REFETCH_DISTANCE_M + MAX_CONSUMER_RADIUS_M`, where `MAX_CONSUMER_RADIUS_M` is the largest of the registered consumer radii (Live Map 10 km, driving map 4 km, active alerts 2 km, spoken alerts 800 m, road match 600 m), giving 12 km / 2 km. Measured at 12 km / 2 km: 0 missing for every consumer. Set size within 12 km: median 71 and max 416 of 4,215 cameras (5 km: median 22, max 162). The three screen radii moved from their view models into `domain/usecases/cameras/cameraRadii.ts`, because the domain cannot import features; the view models now import them, so a changed radius resizes the set.
**Output:** `useCameraStore` holds one working set: the cameras within 12 km of the followed position. That position is the car while driving, else the phone's last fix, else the demo drive's start. It is fetched again once the position is 2 km from the set's centre. `useCamerasAround(centre, radius)` (stores layer) answers every map and road-name read: it uses the working set when the set covers the circle, and otherwise queries that area (pattern 1: panned or route-framed views). The query reaches 2 km further, so small pans reuse it. The view models then apply the same `nearestPoints` / `pointsInView` as before, over a superset in database order, so the output is unchanged. While a new area loads, `useLatest` keeps the drawn markers; the map never flashes empty. The drive loop (alerts, speed limit) reads the working set and moves it with each reading. `getAll()` is deleted from the repository interface, both implementations and the fake; `HazardState.cameras` is deleted, and the hazard store loads hazards only. `hasLoaded` replaces `cameras.length > 0` in the three load guards, so "loaded once" keeps its meaning when there are no hazards.
**Failure policy:**
- **Both tiers.** A fetch never empties the current set; only a successful fetch replaces it. A failed fetch is retried with backoff: 1 s, 2 s, 4 s, … capped at 30 s, with the delay reset on success. Only one fetch runs at a time; when it lands, the position is checked again. A failed view query (pattern 1) leaves the drawn markers in place and is retried on the next pan.
- **Driving tier.** Before the drive starts, the set is made fresh for the start position: the demo source's first point, or the phone's last fix for GPS. "Fresh enough to start a drive on" means centred within 2 km of the start, the same rule as the refetch trigger. An idle set that meets the rule is reused without fetching; a set that is present but centred further away is fetched again, not trusted because it exists. A GPS drive with no fix yet takes its first reading as the start.
- **What the driver sees when the pre-drive fetch fails.** The drive starts (speed, hazards and reports still work). Above the bottom bar, a banner reads **"Camera alerts unavailable — retrying"**, and it is spoken (or vibrated) per the sound mode, like a camera alert. It stays until the set covers the car's alert lookups again. The same banner appears mid-drive whenever the set no longer covers the car (more than 10 km off-centre) and the latest fetch failed.
- **Idle tier.** No banner, no alarm. A failure is a normal empty or stale map: the markers already drawn stay, and the backoff carries on. The Drive tab's full-screen loading state waits for the first set or its first failure, not past it.
- **Backgrounding.** On background the set stops following, and pending retries are cancelled. On resume, the followed position is cleared, so a position from before is never trusted. Idle following resumes at once from the current idle position. A drive resumes from its next reading, and that reading is judged by the same 2 km rule (refetching if needed) and the same coverage check for the banner. A resumed app never drives on a set centred where the phone was an hour ago.
**Found while migrating:** a simulated drive on a planned route works out every speed limit when the source is built, so a working set would have left limits beyond 12 km at 0. That drive now runs one query along the whole route (`boundsAround(route, 600 m)`), falling back to the working set on failure. Tested equal to the full-database limits on a ~60 km real-data route. Starting a drive now awaits the cameras, so a second tap during that await is ignored rather than starting two drives.
**Verification:** tsc, lint, jest 198/198 (36 suites), web export.
- The coverage guard asserts every registered consumer radius ≤ set radius − refetch distance. It also checks 0 missing cameras on the real database, with the car 2 km off-centre in four directions (148 positions; over 10,000 camera checks).
- With the set pinned back to 5 km, the guard fails: Live Map 10,000 > 3,000, driving map 4,000 > 3,000, and 32,582 cameras missing.
- Store tests cover: refetch only past 2 km; the set kept through failures; backoff timing; reuse of a fresh idle set at drive start; a refetch for a set that is present but stale; a reported pre-drive failure; suspend and resume.
- View-model tests cover: a pan outside the set queries the view and keeps the old markers until the answer arrives, while the default view makes one fetch and no query; a drive whose camera fetch fails starts and shows and speaks the warning.
- The dev-only time-to-first-cameras log on the Drive tab was left in the working tree for device timing and is not in this commit. _Seif: fill in your notes._

### AI-048 · 2026-10-27 · Seif · architecture migration final report (queue item G) · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim, item heading):** "### G. Final report"
**Output:** `docs/architecture-migration-report.md`. It covers:
- every item's change, measurements and corrections;
- the behavior changes under their own heading, including the three screens that now wait on a camera query (AI-046);
- the three corrected claims (install size, the missed sixth unguarded load, and the 5 km / 2 km working set);
- the layer table against the lint config against the code, including where they don't line up exactly (React hooks in the stores layer);
- the remaining debt, including the trip planner's unguarded destinations load.

Lint is clean, and `grep -rn "eslint-disable" src` returns nothing. _Seif: fill in your notes._

### AI-049 · 2026-10-27 · Seif · AppState behind Dependencies (audit section 7) · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim, section heading):** "## 7. The one authorised fix"
**Output:** the domain gains `AppLifecycle` (`subscribe(onChange) → Unsubscribe`, with `AppActivity` = active, inactive or background). `src/services/appLifecycle.ts` is the only file that reads React Native's `AppState`. `Dependencies.lifecycle` wires it in, the same shape as `location` and `geocoder`. `useFollowWorkingSet` (`src/stores/cameraHooks.ts`) subscribes through `useDependencies()`, so the stores layer no longer imports `react-native` for this.
**Lint:** `no-restricted-imports` bans `AppState` from `react-native` across `src/`, except `src/services/appLifecycle.ts`. The stores block repeats the ban, because a later flat-config block's options replace an earlier block's. Planted `AppState` imports in stores, features and shared are all caught. The rule is deliberately narrow: `Platform` from `react-native` still passes in stores, because `src/stores/persistStorage.ts` imports it together with AsyncStorage. That is a separate audit finding and is not fixed here.
**Test:** `__tests__/appLifecycle.test.ts` drives the lifecycle through a fake `AppLifecycle`:
- in the background, a new fix fetches nothing;
- on return, the current position is followed and refetched;
- unmounting unsubscribes;
- a resumed drive trusts no position until its next reading.

With the hook's `suspend()` call removed, the first test fails.
**Verification:** tsc, lint, jest 200/200 (37 suites, exits without `--forceExit`). 8 files touched. _Seif: fill in your notes._

### AI-050 · 2026-10-27 · Seif · independent audit of the architecture migration · Claude Code (claude-opus-5-5), investigated directly
**Prompt (verbatim, title):** "# Audit the completed Clean Architecture + MVVM migration"
**Output:** `docs/architecture-audit.md`, with 25 findings, each with file:line, severity and a proposed fix. Only Section 7 changed code (AI-049). Counts:
- **2 critical:** a working-set fetch that never settles leaves the driver silent with no banner; a lost or never-started GPS feed is never surfaced (this predates the migration).
- **7 high:** four lint gaps (route-file logic, scoped `@react-native-*` packages in the domain, domain `.tsx`, packages in stores); stores-layer persistence outside DI, contradicting the report's "only mismatch" claim; the stale ~280 KB figure in AI-038 and in commit `0f2c480`; AI-046 calling a behaviour change "UX kept the same".
- **The rest:** medium and low.

**Evidence method:**
- 48 planted violations, deleted afterwards by literal path; the lint caught 42 of 47, and the control passed;
- 8 code mutations, each applied, run and reverted: 7 caught, 1 survives (the OSRM status check);
- guard-test runs with a registered radius raised and with the set decoupled;
- greps for the superseded numbers in docs and commit messages.

**Correction to my own process:** I cleaned up the first batch of plants with `rm -f $(…)` before you asked for literal paths only. `git status` afterwards showed nothing else removed. The second batch was deleted one literal path at a time. _Seif: fill in your notes._

### AI-051 · 2026-10-27 · Seif · fix round 1: hung camera queries and a dead location feed are failures the driver hears about (audit F12, F13) · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim, round heading):** "## Round 1 — the two criticals (do these first, alone)"
**F12 — a camera query that hangs is a failure.**
- **Timeout.** Every camera query goes through `withTimeout` in `useCameraStore`: the working-set fetch, `findInBounds`, `findByIds` and `findFirstSpeedCamera`. A request that passes `CAMERA_QUERY_TIMEOUT_MS` (5 s) is rejected, and takes the same path as a failed fetch (`fetchFailed`, backoff, set kept).
- **Why 5 s.** It is based on measurement. `scratchpad/latency.cjs` runs node:sqlite against the shipped `.db` on desktop: the 12 km working set has a median of 0.16 ms and a max of 1.4 ms; the worst query, a 52 km panned view of 2,400 rows, has a max of 5.6 ms. Device latency is not measured. The first query of a fresh install also copies the 549 KB database, hence ~900× headroom over the desktop worst case.
- **State model.** `driveCoverage` is judged at the car's position, or at the drive's start before the first reading (`drivingFrom`). `followed` is no longer used, because it can point at the phone (F14). The states are `covered`, `refreshing` (the car is outside the set and a request is outstanding, which the timeout now bounds) and `unavailable` (the request failed or timed out). Leaving the set is never quiet: `refreshing` shows "Loading cameras near you…", and `unavailable` shows and speaks "Camera alerts unavailable — retrying". In normal driving neither state appears, because the refetch starts at 2 km and the set covers the car's lookups until 10 km.
- **Drive start.** `prepareDrive` has one deadline: it never waits longer than the timeout, even behind an older fetch that is hanging. It then starts the drive warned.
- **Bug found and fixed.** `prepareDrive` used to give up as soon as an older fetch, centred somewhere else, timed out, without ever trying the drive's own start. Now only a failure of the fetch for the start ends the wait.

**F13 — location that fails or stops is detected.**
- **Watch start failure.** `LocationSource.watch` takes an `onError`. `ExpoLocationSource` passes `watchPositionAsync`'s `errorHandler` (SDK 58 signature, checked in `node_modules/expo-location`) and its start rejection through to it, and stays silent after unwatch.
- **Staleness.** The drive store records `drivingSince`, `lastReadingAt` and `locationError`. `driveLocationStatus` turns these into `live`, `waiting` (no first reading after 5 s), `lost` (no reading for 5 s, i.e. 5 missed 1 Hz readings) or `failed`. The view model ticks a clock once a second while driving, because a stopped feed sends nothing.
- **One banner.** There is still only one banner mechanism, now called `driverWarning` (it was `cameraWarning`). Location problems come first, because without a live position no alert can fire. Every message except "Loading cameras…" is spoken or vibrated per the sound mode.
- **Frozen speed.** While the feed is not live, `speedKmh` is null, and the readout shows "–" with the accessibility label "Speed unknown". The limit sign and the over-limit colour are hidden.

**Behaviour changes, deliberate and required by the round:**
- three new banner texts: location failed, waiting for GPS, GPS lost;
- "Loading cameras near you…" whenever the car is outside its set while a request is outstanding;
- the speed dash while the feed is not live.

**Not done, filed:** permission recovery flows (re-requesting permission, opening settings) and platform-specific restarts of a broken watch. The driver is warned; recovery still means stopping and restarting the drive.

**Tests:**
- **`__tests__/driverWarnings.test.tsx`** uses fake timers, and its `afterEach` clears timers so a failure can't hang the suite. It covers: a hang at drive start (the drive starts at exactly the timeout, warned and spoken); a hang mid-drive (quiet while covered, warned once the car is 11 km on); the car leaving the set while a request is outstanding (warned at once, then told it failed); an outright pre-drive failure; a watch that fails to start; readings that stop (dash, no limit, then live again); and no first reading.
- **`locationSources.test.ts`:** Expo start rejection and `errorHandler` are reported, and silent after unwatch.
- **`stores.test.ts`:** the single `prepareDrive` deadline, behind a hung fetch for elsewhere.
- **Break-and-revert, all caught:** no query timeout (3 failures); pending counted as covered (1); readings never stale (1); frozen speed shown (3); Expo `errorHandler` dropped (1, after the new test; it survived before it); Expo start failure dropped (1); no overall `prepareDrive` deadline (1).

**Verification:** tsc, lint, jest 208/208 (38 suites, exits without `--forceExit`). _Seif: fill in your notes._

### AI-052 · 2026-10-27 · Seif · fix round 2: tests that could not fail, and a working set that cannot be misread (audit F17, F18, F11) · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim, round heading):** "## Round 2 — tests that cannot fail"
**F17.**
- **Fix.** The OSRM error-status case now answers 503 with a body holding a usable route, the same body the success case accepts, so only the status check can make it fall back. It asserts the exact fallback route.
- **Proof.** With `if (!response.ok) throw` deleted, exactly that test fails (1 of 8), where before all 8 passed.

**F18.**
- **Original leak.** The driver-warning test that could hang moved to `__tests__/driverWarnings.test.tsx` in round 1. That file runs on fake timers and clears them in `afterEach`.
- **Same leak elsewhere.** Auditing the other tests found the pattern in three more places: `viewModels.test.tsx` (planner debounce), `driveRoute.test.ts` (demo playback) and `locationSources.test.ts` (demo watch). Each switched to fake timers mid-test and back at its end, so a failed assertion left fake timers on for every later test in the file. All three now restore and clear in `afterEach`. `stores.test.ts` already restored real timers in `afterEach`, and now also clears pending ones.
- **Proof.** With the driver warning removed, the full suite without `--forceExit` fails 7 tests in 1 suite and exits (code 1) in 13 s instead of hanging.

**F11, by type.**
- **Private list.** `WorkingSet` is now a class with its camera list private, and there are two ways in:
  - `forConsumer(consumer, at)` takes a key of `WORKING_SET_CONSUMER_RADII_M` and returns only the cameras within that consumer's registered radius. An unregistered name doesn't compile, and if it is cast past the type it throws rather than reading nothing.
  - `inArea(centre, radius)` is for map views of any size. It returns null unless the set covers the whole circle; the maps then query the area, as before.
- **No behaviour change.** The drive reads are `spokenAlerts` (≤ 800 m, filtered again by the alert-distance setting), `roadMatch` (600 m, the speed limit) and `activeAlerts` (2 km), each within the radius its code already used. A set that is off-centre still alerts on what it holds; the banner (AI-051) owns coverage.
- **Proof.** Typecheck-time `@ts-expect-error` lines cover an unregistered consumer and a direct read of the list.
  - Making the list public fails `tsc` (`Unused '@ts-expect-error'`).
  - `forConsumer` ignoring its radius fails 1 test.
  - `inArea` never returning null fails 1 test.

**Re-sampling of the round 1 and 2 tests:** every mutation listed in AI-051 and above was caught; none passed against broken code.
**Verification:** tsc, lint, jest 211/211 (38 suites, exits without `--forceExit`). _Seif: fill in your notes._

### AI-053 · 2026-10-27 · Seif · fix round 3, part 1: domain import allowlist and layer-shape guard tests (audit F1, F2, F3); F4/F5 stopped on scope · Claude Code (claude-opus-5-5), written directly
**Prompt (verbatim, round heading):** "## Round 3 — the lint gaps (F1–F5)"
**F2 — rule inverted.**
- **Allowlist.** `src/domain` may import nothing but itself. The framework denylist became the pattern `^(?!\.\.?/|@/domain(/|$))`: no packages (scoped or not), no Node built-ins. Relative imports that leave the domain stay the layer zone's job.
- **Wider glob.** The rule's `files` glob now includes `.tsx`.
- **Six colocated tests excluded.** The new rule immediately flagged six colocated unit tests in `src/domain/usecases/**` (`*.test.ts`, importing `@jest/globals`). They are excluded by path, as test code, not domain code.
- **Proof.** It catches the original `@react-native-async-storage/async-storage` plant, plus two of mine that the old denylist passed: `nativewind`, and the scoped `@vis.gl/react-google-maps`.

**F1 and F3 — guard tests, not lint.** `__tests__/layerShape.test.ts` reads the source tree through `test-support/sourceFiles.js`:
- no file under `src/domain` is `.tsx`;
- every non-layout file in `src/app` is exactly one line, `export { default } from '@/features/<slice>/screens/<Screen>'`.

With the original plants put back, both tests fail and name the files. The route test also names the two route plants that held a store import, which lint already caught.

**All plants re-run.** I recreated all 48 plants from the audit (47 violations plus the control) from `scratchpad/plants.cjs` and deleted each afterwards by literal path:
- lint catches 43 of the 47 violations (it was 42);
- the guard tests catch 2 of the 4 lint misses (route logic, domain `.tsx`): **45 of 47** overall;
- the control (`import type` from the domain in `theme`) correctly passes;
- the 2 still missed are packages in stores (`expo-location`, and `react-native` `Platform`). These are F4/F5.

**Stopped: F4/F5 are scope growth (stop condition 4).**
- **Why.** Putting AsyncStorage behind `Dependencies` works for the route and session stores, which `createStores(deps)` builds. But `useSettingsStore` and `useThemeStore` are module singletons (F9) that import `persistStorage` directly, and a store has no way to reach `Dependencies` except by being built through `createStores`.
- **Size.** Moving them is F9's change: 22 files import the two stores (src, tests and the root layout).
- **Knock-on to F4.** F4's package allowlist for stores depends on it: until `persistStorage.ts` is gone, the allowlist fails on it unless that file is exempted.
- **Options for Seif:** (A) fold F9 into round 3; (B) do F5 for the two DI-built stores now, with a scoped, recorded exemption for `persistStorage.ts` in the stores allowlist until F9.

**Verification:** tsc, lint, jest 213/213 (39 suites, exits without `--forceExit`). _Seif: fill in your notes._
