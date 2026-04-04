# DreamShot Mobile — Style Guide

> Single source of truth for DreamShot mobile UI patterns.
> Builder: read before UI work; update when adding NEW reusable visual patterns.

---

## Stack

- **Framework:** Expo Router + React Native
- **Styling:** React Native `StyleSheet.create`
- **Theme:** Light + dark palettes via `useAppTheme()`

---

## Core UI Patterns

### Screen layout

- `SafeAreaView` root + `ScrollView` body for long screens.
- Sticky bottom CTA uses absolute footer container with side insets.

### Create flow cards

- Prompt and photo selector use dark elevated cards with:
  - rounded corners (`14-18` radius)
  - subtle 1px border (`rgba(109,117,140,0.3)` range)
  - accent state via cyan/purple tokens (`#53DDFC`, `#CC97FF`, `#9C48EA`)

### Selection controls

- Pill chips for style selection with active cyan fill.
- Aspect options use 2-column bordered cards with active border/fill.

### Photo selection section (Create)

- `photoPreviewWrap`: fixed-height preview container with placeholder fallback.
- `photoActionBtn`: secondary outlined action for camera/gallery sources.
- Generate CTA must remain disabled until a source image is selected.

---

## Typography

- Headings: `SpaceGrotesk_700Bold`
- Support/body labels: `Inter_700Bold` or palette secondary text for hints

---

## Notes for future updates

- Keep interactive controls visually consistent with existing DreamShot chips/buttons.
- If new reusable card/button/selector variants are introduced, document them here in the same commit.
