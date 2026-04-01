# Platform Gotchas

> **Hard-won lessons from real builds.** Check this doc when something breaks unexpectedly. Updated as new gotchas are discovered.

---

## React Native / Expo

### Expo Router

| Gotcha | Impact | Fix |
|--------|--------|-----|
| Eager tab screen imports | Barrel exports (`index.ts`) pull in heavy deps transitively, even if not rendered | Avoid barrel re-exports of heavy components; import directly |

### React Native Reanimated

| Gotcha | Impact | Fix |
|--------|--------|-----|
| Missing Babel plugin | Worklets fall back to JS thread | Add `react-native-reanimated/plugin` to `babel.config` |
| Plugin added but binary not rebuilt | Same as above — plugin needs native code | Rebuild with `expo run:ios` (hot-reload is not enough) |

### Native Driver

| Gotcha | Impact | Fix |
|--------|--------|-----|
| `useNativeDriver: true` with SVG | Animation silently fails, can block touch thread | Use `useNativeDriver: false` for any SVG property animation |
| `useNativeDriver: true` with layout props | Crash or no-op | Native driver only supports `transform` and `opacity` |

### DateTimePicker (@react-native-community)

| Gotcha | Impact | Fix |
|--------|--------|-----|
| No `themeVariant` prop on dark theme | Picker text invisible (dark on dark) | Add `themeVariant="dark"` and `textColor={palette.text}` |
| iOS `onChange` only fires on scroll | Tapping Done without scrolling commits nothing | Track value in state; commit the tracked value on Done press |
| Inline display eats screen space | Two pickers = entire screen covered | Always use bottom-sheet Modal wrapper |

### React Query (TanStack)

| Gotcha | Impact | Fix |
|--------|--------|-----|
| `refetchOnWindowFocus` does nothing in RN | Data never refreshes on tab switch | Use `useFocusEffect` to invalidate queries on screen focus |
| Mutation only invalidates current screen's query key | Other screens show stale data | Invalidate ALL related query keys in `onSuccess` |
| Async service functions not awaited in mutation | Query invalidation races with data write | `await` all async service calls before letting mutation complete |

### JS Thread Blocking (The #1 "Touch Freeze" Cause)

| Gotcha | Impact | Fix |
|--------|--------|-----|
| **Unbounded loops in data processing** (`while(true)`, missing break conditions) | JS thread blocked → entire app freezes. Scrolling works (native) but NO taps register. Phone heats up. | **Always add safety bounds** (`maxIterations`, `maxLookback`). Every `while` loop needs an exit condition that's reachable with empty/missing data. |
| Circular imports between services | Module initialization hangs at import time → same freeze symptom | Restructure imports or use lazy require |
| Heavy synchronous computation in `useFocusEffect` | Runs on every tab switch, blocks JS thread | Move heavy computation to `useEffect` with async wrapper, or memoize with `useMemo` |

> **Debugging tip:** When taps stop working but scrolling still works, the problem is almost always a **blocked JS thread** — not a touch-swallowing overlay, not a broken component, not a provider issue. Look for infinite loops, heavy synchronous computation, or circular imports first. Check Metro logs for hangs. Add `console.log` breadcrumbs around suspect code to find where execution stalls.

### MMKV / Local Storage

| Gotcha | Impact | Fix |
|--------|--------|-----|
| Reads are synchronous | Tempting to add loading states — don't | No spinners needed for MMKV reads |

### react-native-paper

| Gotcha | Impact | Fix |
|--------|--------|-----|
| Barrel import from `react-native-paper` | Pulls entire Paper library even for one type | Use `import type { X }` for TypeScript types when you only need TS definitions |

### Metro Bundler

| Gotcha | Impact | Fix |
|--------|--------|-----|
| HMR after significant changes | Stale modules, SVG double-registration errors | Restart Metro with `--clear` |
| Multiple Metro instances | Port conflict, wrong bundle served | `lsof -ti :8081 \| xargs kill -9` before starting |
| Metro dies silently | App shows old bundle or dev client launcher | Check if Metro process is still alive |

### iOS Build

| Gotcha | Impact | Fix |
|--------|--------|-----|
| CocoaPods locale errors | Build fails with encoding errors | Prefix with `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8` |
| Native module added without rebuild | Module unavailable at runtime, or falls back to JS (Reanimated) | Always `expo run:ios` after adding native packages |
| Tab bar overlaps home indicator | Bottom tabs cut off on modern iPhones | `paddingBottom: 20, height: 76` on tab bar |

---

## iOS Platform

| Gotcha | Impact | Fix |
|--------|--------|-----|
| System date picker appearance | Ignores app's dark/light mode | Set `themeVariant` explicitly |
| Swipe-back broken for screens inside Tabs | Users can't navigate back | Move detail screens to root Stack |
| Keyboard covers input fields | Users can't see what they're typing | Use `KeyboardAvoidingView` or scroll to focused input |
| Home indicator gesture area | Taps near bottom edge don't register | Keep interactive elements above safe area |

---

## Android Platform

| Gotcha | Impact | Fix |
|--------|--------|-----|
| Back button behavior in nested navigators | Unexpected navigation or app exit | Test hardware back button on every screen |
| Status bar color on dark theme | White status bar on dark screen | Set `StatusBar` style explicitly |
| `google-services.json` missing | Gradle build fails even if not using Firebase | File required by Google Services plugin — see [Android Config](../03-platform-setup/android-config-file.md) |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-02-25 | Initial version — lessons from PillMinder, BudgetVault, QuickNutrition, ZapArc builds |
