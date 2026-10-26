# Why the map doesn't show every radar point

Investigated 2026-10-26 by OpenCode (glm-5.3-flash-free, read-only); every claim below was re-checked against the code and data.

`src/data/radars/radars_eg.json` holds 4,255 points. At most **150** are drawn at once.

| # | Where | What drops points | Points affected | Intended? |
|---|-------|-------------------|-----------------|-----------|
| 1 | `src/features/map/viewmodels/useLiveMapViewModel.ts:22-23,118` | `nearestPoints(…, 150, 10 km)` around **one fixed centre**: your GPS fix, or the demo-route start when there is none | ~4,065 of 4,215 on Live Map (238 lie within 10 km; 150 kept) | Cap: yes (performance). **Centre not following the map: bug.** Panning to Giza or Alexandria shows nothing. |
| 2 | `src/features/drive/viewmodels/useDriveMapViewModel.ts:15-17,79-90` | Same cap on Drive: 4 km around the car while driving; route-frame centre, 4–30 km, when idle | ~4,130 of 4,215 | Same as #1. `onCenterChange` is only wired to the pin picker (`DriveModeScreen.tsx:56`). |
| 3 | `src/data/radars/parseRadarFeed.ts:16-30` | Type codes other than F/C/R/SB are skipped | 40 (S 12, B 13, PN 7, CC 4, U/TC/SV/IP 1 each) | By design (no label was given), but they disappear silently. |
| 4 | `src/domain/usecases/drive/mapLayers.ts` (`hiddenOnMap`) | Per-type "Show on map" switches | 0 by default | Yes |
| 5 | `useLiveMapViewModel.ts:111-128` | Live Map filter chips | 0 with "All" | Yes |
| 6 | `useTripDetailsViewModel.ts:67-72` | Trip map shows only the alerts recorded on that trip | almost all | Yes |
| 7 | `src/components/map/index.web.ts` | Web without `EXPO_PUBLIC_GOOGLE_MAPS_KEY` draws no markers | all on web | Yes (placeholder) |

Not a cause: no points have invalid coordinates (0 dropped); `speed_limit: "0"` (3,537 points) only hides the km/h badge.

## Fix (applied in AI-029)
1. Feed the map's visible region back into the view models (`onCenterChange`/region, debounced) and recompute `nearestPoints` around it, sizing the radius to the zoom. Panning then always shows nearby points. Or replace the cap with marker clustering (e.g. supercluster) so all 4,215 points are reachable when zoomed in.
2. Map the extra codes to types once their meaning is known (PN/B look like police/bump variants), or log them.
