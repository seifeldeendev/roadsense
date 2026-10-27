# Architecture migration report (Clean Architecture + MVVM + feature slices)

Branch `seif/radarbot-map`, 2026-10-27. All commits are local and unpushed. Every commit passed `tsc --noEmit`, `expo lint` and the full jest suite. The per-item AI log entries are AI-036 to AI-047 in `docs/ai-log.md`.

| Item | Commit | AI log |
|---|---|---|
| 1. Dismantle the location singleton | `c86b34a` | AI-036 |
| 2. Dependencies container and provider | `b4011cd` | AI-037 |
| 3. Prebuilt SQLite radar database | `0f2c480` | AI-038 |
| 3-index. lat/lng index and schema-aware seed version | `ad19423` | AI-039 |
| 4. Duplicate map components (closed, false premise) | `ae69909` (docs only) | AI-040 |
| 5. Layer boundaries enforced by lint | `f8de02b` | AI-041 |
| A. Composition root, map primitives, splitRoute | `a57f015` | AI-042 |
| B. Item 6 tests and "already loading" guards | `55ed37c` | AI-043 |
| C. gps and geocoding behind Dependencies | `a5ec16e` | AI-044 |
| D. Auth session gate | `c1e7095` | AI-045 |
| E. 3c-1 one-off camera queries | `9bea966` | AI-046 |
| F. 3c-2 working set, view queries, getAll() deleted | `078e0f4` | AI-047 |

Final state: tsc clean, lint clean, jest 198/198 across 36 suites, web export OK.

## Item by item

**1. Location singleton.** The ~150 lines of module state in `services/location.ts` were split three ways:
- a navigation store (route to drive, queued replay, planned route);
- `data/location/` sources: `ExpoLocationSource` and the demo source;
- a domain `LocationSource` interface.

A second `watch()` now ends the first instead of leaking it. `setRate` was dead code and was deleted. The road-name fix got a test.

**2. Dependencies.** The `di.ts` service locator was replaced by `Dependencies` + `createDependencies(overrides)`, `createXStore(deps)` factories and a `DependenciesProvider` (`useDependencies`, `useStores`). Mount-time loads go through `loadUnless(skip)`, which keeps each screen's original condition. A hazard report reads the car's position at tap time; the worst-case staleness was one GPS tick.

**3. SQLite radar database.** Measured on an Android release export:
- the Hermes bundle went from 4,364,504 to 4,204,428 B (−160 KB, −86 KB gzipped);
- the `.db` adds 438 KB, or 549 KB once the index was added.

Net install growth is about 390 KB, and each over-the-air update is about 86 KB smaller. This is groundwork for viewport queries, not a cold-start improvement: the old path never called `JSON.parse`, because Metro compiles the JSON into a module. Web keeps the JSON path, and a test proves SQLite and JSON return the same results.

**3-index.** Added the `cameras_lat_lng` index. The seed version now hashes the schema version, the schema SQL and the export, so a schema-only change re-seeds devices. A test fails if the shipped `.db` is stale or missing the index.

**4. Duplicate map components.** Closed with no code change: no duplicates existed (and no `MapCard`).

**5. Layer lint.** `import/no-restricted-paths` zones per layer and per feature slice, a framework-free domain, stores that receive dependencies rather than build them, and type-only domain imports in the outer layers.
- The first run reported 96 errors, 51 of them because the table left out `theme`; the table was amended.
- The lint found a real domain↔shared cycle (two constants), which was fixed.
- The remaining 15 violations were kept as errors with per-line TODO disables. Items A, C and D removed all of them.

**A.** Production stores moved to `src/composition` (19 files touched). `components/map` and `components/navigation` may import `components/ui`, never the reverse. `splitRoute` moved into `useDriveMapViewModel`; it had two call sites.

**B.** Store tests built from fakes, view-model tests inside a test provider, and OSRM fallback tests. Five load sites now skip while a load is in flight: route-preview hazards, trip-details pins, and the three trip screens. One test per site, and all five fail with the guards reverted.

**C.** `LocationSources.requestPermission` / `currentPosition` and a `Geocoder` interface were added to `Dependencies`. `haptics`, `speech` and `imagePicker` remain direct calls (fire-and-forget UI affordances).

**D.** `useSessionGateViewModel`, `SessionGate` and `SessionRedirectScreen` live in the auth slice. `app/index.tsx` is a one-line re-export, and the root layout only wires things together.

**E (3c-1).** Added `getInBounds`, `getByIds` and `getFirstSpeedCamera`. The five one-off consumers moved off the full list. The equivalence test runs every query on both implementations: 200 seeded boxes, an edge-inclusive box, 50 id sets, and the first speed camera.

**F (3c-2).** A single camera working set, centred on the car while driving, else the last GPS fix, else the demo start. Its radius is derived as refetch distance + largest consumer radius = 2 + 10 = 12 km, and it is refetched once the centre is 2 km away.
- **Size:** at most 416 of 4,215 cameras, median 71.
- **View queries (pattern 1):** panned and route-framed views query their own area through `useCamerasAround`, and drawn markers stay until the replacement arrives.
- **Failure policy:** two tiers, written out in AI-047. While driving, the driver is warned; while idle, the map simply shows an empty or stale state.
- **Removed:** `getAll()` and `HazardState.cameras` are deleted.
- **Guard test:** checks that every consumer radius fits inside the set minus the refetch distance, and that zero cameras go missing across real-data positions. Pinned back to 5 km, it fails with 32,582 cameras missing.
- **Planned-route speed limits:** simulated drives on a planned route compute every speed limit up front, so they now query along the whole route. On a ~60 km real-data route the limits match what the full database gave.

## Behavior changes

The standing rule was "no behavior changes unless the item says so". These changes were made anyway, and each is deliberate:

1. **Three screens now wait for a camera query before leaving their loading state (E):** report details, route preview, and the trip planner's route card.
   - **Before:** these screens read cameras from the full list that the hazard load had already brought in.
   - **Now:** each runs one indexed query, and the screen stays in its existing loading state until that query answers.
   - **Why:** without the wait, the screens would briefly show coordinates instead of a road name, or "Nothing reported on the way", and then correct themselves. That is worse than one extra indexed query.
   - The change is logged in AI-046.
2. **Driving with no cameras is now announced (F, required by the item).** If the cameras around the car can't be fetched, the drive still starts, and a banner above the bottom bar reads "Camera alerts unavailable — retrying". It is also spoken or vibrated, following the sound mode. This UI is new. Before, the only failure mode was the Drive tab's full-screen error when the whole list failed to load.
3. **A camera failure no longer blocks the Drive tab (F, idle tier).** The full-screen error now covers hazard-load failures only. A failed camera fetch while idle shows a map without cameras and retries with backoff. The driver is warned only once a drive starts.
4. **Starting a drive awaits the cameras around the start point (F).** For a demo drive, the start is the source's first point; for GPS, the last fix. The wait is one indexed query when the idle set is stale, and nothing when it is fresh. A second tap during the wait is ignored.
5. **Road name for a planned route that starts outside the working set (F).** This applies only to demo mode before a drive. The road name now comes from a query, so it can be blank for the length of that query. Before, it came from the in-memory list.

## Corrections of stated claims

1. **Item 3 size.** I first claimed the change made the app "~1 MB smaller". The measurement showed −160 KB in the bundle against +438 KB for the database. You then corrected the net install growth to ~390 KB once the 549 KB indexed `.db` landed. The correction is recorded in AI-039 (its text was edited in the AI-040 commit, `ae69909`) and in AI-038, whose ~280 KB figure is marked superseded. The commit message of `0f2c480` still says ~280 KB; it is superseded, not rewritten.
2. **Unguarded loads.** My item-3 list of unguarded loads missed a sixth one: the trip planner's destinations load. It was outside item 6's scope, so it was logged as debt (see below) and not folded into B.
3. **Working-set geometry.** 5 km / 2 km was approved on my recommendation, but I had not checked the radii the consumers draw. Measured on the real database with the car 2 km off-centre, the Live Map's 10 km default view lost **53%** of its markers, and the 4 km driving map lost **9.3%**. Replaced by the 12 km derivation and its guard test. Of the three, this is the correction that affected users. It is recorded in AI-047 and in the F commit message.

## Layer table vs lint config vs code

The lint config (`eslint.config.js`) encodes the prompt's table plus the amendments you approved in item 5:

| Layer | Table (as amended) | Lint zone |
|---|---|---|
| domain | itself only; no React, RN, Expo or Zustand | `zone('./src/domain', ['./domain'])` plus the framework ban |
| data | domain, shared, services | matches |
| stores | domain, data via DI only, plus shared (amendment) | domain, shared, `data/dependencies.ts`; may not import `productionDependencies` / `createDependencies` |
| composition | new row (item 5 / A): builds production stores | composition, stores, domain, `data/dependencies.ts` |
| features | stores, domain, shared, ui, plus theme, map/navigation, haptics/speech/imagePicker (amendments) | matches; per-slice zones forbid importing another slice |
| app | features only | features (domain types allowed, `import type` only) |
| app `_layout` files | composition-root row (amendment) | adds theme, `AppDependenciesProvider`, `useThemeStore` |
| services, shared | shared only (domain types allowed) | matches, `import type` only |
| components ui/map/navigation, theme | theme, shared; map/navigation may use ui (amendment) | matches, `import type` only |

**Code vs lint:**
- `npx expo lint` reports 0 errors and 0 warnings.
- `grep -rn "eslint-disable-next-line" src` returns nothing; `grep -rn "eslint-disable" src` returns nothing. There are no boundary-rule disables.
- The ViewModel contract (no `getState()` in view models) holds, with one approved exception: the drive point handler, a long-lived callback, reads the stores it is handed for each reading (item 2).

**Where the table, the config or the code don't line up exactly:**
- `src/stores/cameraHooks.ts` and `DependenciesProvider.tsx` are React hooks and components in the stores layer, and `cameraHooks` imports `react-native` (for `AppState`). The table treats stores as state only. The lint only restricts paths inside `src`, so it does not flag package imports here.
- **Correction (audit F5):** this list originally implied the `AppState` import was the only mismatch. It wasn't: `src/stores/persistStorage.ts` also imported AsyncStorage and `react-native` (`Platform`). Both are fixed. `AppState` is behind `Dependencies.lifecycle` (AI-049), and persistence is behind `Dependencies.storage`, with a package allowlist for stores (AI-056). See `docs/architecture-audit.md`.
- `__tests__/` and `test-support/` are outside the zones, by design.

## Remaining debt

1. **Trip planner destinations load is unguarded.** `useTripPlannerViewModel`'s destinations `loadUnless` lacks the "already loading" condition, so a mount during another screen's load starts a second fetch. This is the sixth unguarded load, found in item 3 and not folded into item 6.
2. **Three stores are still module singletons.** `useDriveStore`, `useSettingsStore` and `useThemeStore` are not built through `createStores`, so tests reset them by hand.
3. **React and `react-native` code in the stores layer.** `cameraHooks.ts` imports `react-native` (`AppState`), and the hooks there use React. It could move to a shared presentation-logic layer, and the lint could ban framework packages in stores outright.
4. **Device timing not yet measured.** The dev-only time-to-first-cameras log on the Drive tab is in the working tree (uncommitted, `useDriveMapViewModel.ts`) for you to run on a physical device. Remove it after.
5. **Pattern-1 queries have no backoff.** A failed view query keeps the drawn markers and is retried on the next pan or zoom; only the working set retries on a timer.
6. **A GPS drive with no fix yet does its pre-drive fetch at its first reading.** The Drive tab requests a fix on mount, so this is rare.
7. **The camera warning can be spoken again during one outage.** Changing the sound mode or voice setting while the warning is showing triggers it again.
8. **Web still loads the whole JSON export into memory.** This is by design (no SQLite on web) and is unchanged.
9. **AI log placeholders.** The "_Seif: fill in your notes_" lines in AI-036 to AI-047 are still yours to fill.
10. **Historical prompts still mention `getAll()`.** These are the prompts in `docs/ai-prompts/`; they are records and were left as written.
