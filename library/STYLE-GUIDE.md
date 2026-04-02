# DreamShot — Style Guide

> Single source of truth for DreamShot UI styling.
> Builder reads this before UI work and updates it when adding new UI classes/components.

---

## Stack

- **Framework:** Expo Router + React Native
- **Styling:** React Native StyleSheet + theme tokens (`src/config/theme.ts`)
- **Theme:** Lumina Synth dark-surfaces palette (single tonal system used in both modes)

---

## Tokens

| Token | Value |
|---|---|
| Primary | `#CC97FF` |
| Secondary | `#53DDFC` |
| Accent | `#FF86C3` |
| Signature gradient | `['#9C48EA', '#53DDFC']` |
| Surface | `#091328` |
| Surface variant | `#0F1930` |
| Surface high | `#141F38` |
| Text | `#DEE5FF` |
| Text muted | `#A3AAC4` |
| Border (tonal, avoid hard 1px contrast) | `#0F1930` |
| Border variant | `#141F38` |
| Radius small/default/large | `10 / 14 / 18` |

---

## Guidelines

- Prefer tonal separation (`surface` / `surfaceVariant` / `surfaceContainerHigh`) over sharp 1px borders.
- New gradients should use DreamShot signature purple→cyan direction.
- Avoid legacy warm/gold royal accents in new UI.
- Keep semantic class/element naming clear when adding new reusable components.

## Home/Gallery Patterns

- Home header uses a compact brand lockup (`blur-on` icon + gradient DreamShot wordmark from purple→cyan) with a circular glass notification action.
- Hero blocks use large rounded cards (24 radius), deep overlay (`rgba(6,14,32,0.5)`), and dual CTA actions:
  - Primary CTA: signature gradient pill (`#9C48EA` → `#53DDFC`) with white label.
  - Secondary CTA: glass pill with cyan-tinted border.
- Popular creations should use a bento composition with one featured large tile and supporting smaller tiles.
- Image card overlays are bottom-anchored, semi-transparent black (`rgba(0,0,0,0.5)`) with title + author metadata.
- Bottom tab bar style for DreamShot main tabs is glassmorphic:
  - Blur backdrop (`expo-blur`, dark tint, medium intensity)
  - translucent shell (`rgba(15, 25, 48, 0.55)`)
  - rounded container (24 radius)
  - no explicit divider lines (`borderTopWidth: 0`)

## Create/Generation Hub Patterns

- `style-detail.tsx` is now the prompt-first Create screen pattern.
- Prompt composer uses a two-layer card:
  - outer glow shell (`promptGlow`) for focus halo
  - inner `promptCard` with `surface-container-lowest` black base
- Focus state should shift background from pure black to low-surface (`#091328`) and add purple glow, not border outlines.
- Style choices use horizontal rounded chips; selected chip uses cyan fill with dark text.
- Aspect ratio selector uses two-column rounded cards with subtle outline, cyan-highlight on selected.
- Primary Generate CTA is full-width, pill-shaped, signature gradient `#9C48EA → #53DDFC`.

## Typography System

- **Headlines:** `SpaceGrotesk_700Bold` (or `SpaceGrotesk_500Medium` for secondary headings)
- **Body/labels:** Inter family (`Inter_400Regular`, `Inter_500Medium`, `Inter_600SemiBold`, `Inter_700Bold`)
- Fonts are loaded in `mobile-app/app/_layout.tsx` via `expo-font` + `@expo-google-fonts/*` packages.
- `APP_THEME.typography` in `mobile-app/src/config/theme.ts` is the canonical token map for font families.
- Legacy `serif` heading usage has been replaced with Space Grotesk heading tokens.

- Generation progress screen uses a shimmer-first loading treatment (moving purple→cyan sweep) instead of a spinner.
- Result screen media should render full-bleed edge-to-edge, with primary actions grouped as pill quick-actions: Save / Share / Remix.

## My Collection/Profile Patterns

- `my-gallery.tsx` now follows a profile-led collection layout:
  - centered avatar with soft purple glow ring
  - 3 glass stat cards for Creations / Saved / Recent
  - chip filters for `All`, `Favorites`, `Recent`
- Collection cards use rounded, borderless masonry-style tiles with variable aspect ratios for visual rhythm.
- Empty state headline uses `SpaceGrotesk_700Bold` at display scale to match design direction.

## Bottom Tab Bar Pattern

- Main tabs use a glassmorphic shell: `rgba(9,19,40,0.6)` + dark blur backdrop.
- Tab container has rounded top corners (`32`) and soft purple lift shadow (`0 -10 40 rgba(156,72,234,0.1)`).
- Active tab state uses cyan icon/text (`#53DDFC`) with `surfaceContainerHigh` rounded pill background.
- DreamShot tab labels/icons map to: Home (`home`), Create (`smart-button`) as MaterialIcons mapping for Material Symbols `magic_button`, Styles (`grid-view`), Profile (`person`).
