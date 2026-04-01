# Design Document — DreamShot

## Overview
DreamShot extends mobile-skeleton-app with a style-first generation journey:
style discovery → source image selection → async generation progress → result actions → persisted gallery history.

Architecture intent:
- No-auth user flow (user lands directly in Royal UI)
- Backend used as secure AI proxy only
- Coin economy is device-local with IAP-backed top-ups

## Information Architecture

```
app/
  (main)/
    home.tsx                    # style gallery
    style-detail.tsx            # style detail + generation actions
    photo-picker.tsx            # camera/gallery source image intake
    generation-progress.tsx     # async generation status
    result.tsx                  # generated output + actions
    my-gallery.tsx              # local generated history
    coins.tsx                   # coin balance + pack purchase
    settings.tsx                # theme/restore/legal links
```

Launch behavior:
- Default route must resolve to `/(main)/home`
- Any legacy auth entry route (`/auth`, `/auth/welcome`) must redirect into Royal main flow

## UX Contract (from design HTMLs)

### Global visual language
- Light default surface: `#F5F3EF`
- Primary navy: `#1B1F5E`
- Accent gold: `#C9A84C`
- Serif-forward heading typography (Playfair-style treatment)
- Soft framed cards and rounded portrait imagery

### Shared structural motifs
- Royal top header with crown branding
- Coin balance pill in header affordance row
- Bottom navigation style mirrored across core screens
- Intentional spacing and gold divider accents

## Data Models

```ts
export interface StylePreset {
  id: string;
  title: string;
  description: string;
  prompt: string;
  animationPrompt: string;
  exampleImage: string;
  photoCost: number; // 20
  videoCost: number; // 50
}

export interface GenerationJob {
  id: string;
  styleId: string;
  type: 'photo' | 'video';
  sourceImageUri: string;
  status: 'queued' | 'processing' | 'succeeded' | 'failed';
  resultUri?: string;
  createdAt: string;
  errorMessage?: string;
}

export interface GalleryItem {
  id: string;
  type: 'photo' | 'video';
  previewUri: string;
  resultUri: string;
  styleTitle: string;
  createdAt: string;
}
```

## Service Architecture

### Mobile-side hooks
- `useGeneratePhoto`: starts photo generation, performs coin deduction, handles refund on failure
- `useGenerateVideo`: submits video generation and polls status lifecycle
- `useGenerationJob`: AsyncStorage-backed pending job persistence + recovery

### Backend endpoints (proxy-only)
| Method | Path | Description | End-user Auth |
|--------|------|-------------|---------------|
| POST | `/ai/photo/generate` | Create photo generation job for style + source image | Not required for app flow |
| POST | `/ai/video/generate` | Create video generation job from image/style | Not required for app flow |
| GET | `/ai/jobs/:id` | Poll generation job status | Not required for app flow |

Note: transport-level app security (API key / app secret / origin restrictions) may still apply at backend boundary, but no user login dependency is allowed in Royal UX.

## Patterns Applied
- `docs/07-reference/ux-patterns.md`
  - maintain touch targets and accessible contrast
  - include empty states by intent, not omission
- `docs/07-reference/platform-gotchas.md`
  - avoid aggressive polling loops on JS thread
  - preserve stable mutation/persistence order for wallet + jobs
- `docs/02-configuration/ui-components.md`
  - prefer skeleton theme/component primitives before introducing one-off widgets

## Non-Goals (Phase 1/2)
- No social/auth profile system
- No server-side user account data model
- No real-time push-notification dependency for completion (poll + resume only)
