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
