# Design Document — [App Name]

<!--
BEFORE WRITING THIS FILE:
Read specs/SPEC_WRITING_GUIDE.md — it defines the exact format, correctness
properties, testing strategy, and architecture sections required. Then read
specs/mobile-app-skeleton/design.md as a reference for level of detail.

Key patterns to follow:
- Overview paragraph explaining the architecture
- Mermaid diagrams for system architecture (if helpful)
- Navigation structure showing actual file paths in app/ directory
- TypeScript interfaces for all data models
- API endpoint tables (if backend mode)
- UI component mapping: which skeleton components each screen uses
- Configuration models with actual TypeScript types
- Error handling patterns
- Security considerations specific to this app

What to include that's DIFFERENT from skeleton:
- New screens and their routes
- App-specific data models (TypeScript interfaces)
- Custom components not in the skeleton UI library
- New API endpoints (if backend mode)
- Theme customization (brand colors)
- External services or APIs your app integrates with

What NOT to repeat:
- Skeleton architecture (auth module, payment module, etc.)
- Existing UI component library (just reference which ones you use)
- Base theme structure (just override brand colors)
- Storage strategy (same as skeleton unless changing it)

Reference design mockups: "See design/<screen_name>/code.html" for each screen.
-->

## Overview

[Brief architecture overview. What does this app add on top of the skeleton?]

## Screens & Navigation

```
app/
  (auth)/
    welcome.tsx                  # Inherited from skeleton
    verify-code.tsx              # Inherited from skeleton (backend mode only)
  (main)/
    _layout.tsx                  # Tab layout
    home.tsx                     # [Describe what home shows in this app]
    [your-screen].tsx            # [New screen]
    profile.tsx                  # Inherited from skeleton
    settings.tsx                 # Inherited from skeleton
    premium.tsx                  # Inherited from skeleton
```

### [Screen Name]

- **Route:** `app/(main)/[screen].tsx`
- **Mockup:** `design/[screen_name]/code.html`
- **Purpose:** [What the user does here]
- **Skeleton components used:** [e.g., SearchInput, DataCard, ChipSelector, SectionHeader]
- **Custom components needed:** [List any new components to build]
- **Data:** [What data is displayed and where it comes from]

## Data Models

```typescript
// App-specific types (src/types/[app].ts or src/features/[feature]/types.ts)
interface YourModel {
  id: string;
  // Define all fields with types
}
```

## API Endpoints (if backend mode)

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/api/[resource]` | [Description] | Yes |

## Theme Customization

```typescript
// src/config/theme.ts — override brand colors
const brand = {
  primary: '#......',    // [Color name/purpose]
  secondary: '#......',  // [Color name/purpose]
  accent: '#......',     // [Color name/purpose]
};
```

## External Dependencies

[List any new npm packages needed beyond the skeleton's dependencies.]
