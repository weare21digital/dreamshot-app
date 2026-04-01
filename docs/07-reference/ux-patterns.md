# UX Patterns for Mobile Apps

> **Read this before building any screen.** These patterns prevent the most common UX failures in mobile apps — especially dark theme, pickers, and accessibility. They apply regardless of framework.

Related docs:
- [Theming](../02-configuration/theming.md) — color token config
- [UI Components](../02-configuration/ui-components.md) — skeleton component library
- [Audit & Polish](../06-build-and-deploy/audit-and-polish.md) — post-build verification
- [UX Requirements](../../specs/UX_REQUIREMENTS.md) — spec-phase UX research framework

---

## 1. Dark Theme Contrast

Dark themes fail when surfaces blend together. Every element must be visually distinguishable from its parent.

### Rules

| Rule | Why |
|------|-----|
| Never rely on background color alone to define a region | Dark surfaces are too close in value |
| Always add a visible border (1–2px) to cards, inputs, pickers | Borders survive any theme |
| Selected state = solid fill + white text | Must pop against both light and dark |
| Unselected state = surface bg + border + muted text | Must still be readable |
| Today/active indicators = accent border, not just color shift | Color shifts are invisible on dark |
| Never use `opacity < 0.5` for text on dark backgrounds | Contrast ratio fails WCAG |

### Color Token Usage

Use the 7 palette tokens defined in [Theming](../02-configuration/theming.md). Never reference raw hex in components.

```
background     — deepest layer (screen bg)
surface        — cards, modals, sheets
border         — edges, dividers, inactive outlines
text           — primary readable text (high contrast)
textSecondary  — labels, hints, metadata (medium contrast)
brand.primary  — accent (buttons, selected states, links)
status.error   — destructive actions, validation errors
```

**Dark theme minimum contrasts:**
- `text` on `background`: ≥ 7:1
- `text` on `surface`: ≥ 5:1
- `textSecondary` on `surface`: ≥ 3.5:1
- `primary` on `background`: ≥ 4:1

**Test**: Screenshot every screen in dark mode. If you squint and two adjacent areas merge, add a border or increase the contrast.

### Common Failures

| Component | Failure | Fix |
|-----------|---------|-----|
| Calendar/date cards | `surfaceVariant` bg invisible on dark | Use `surface` + `border` |
| Segmented controls | Background matches screen | Add border + padding around segments |
| Native date pickers | Inherit system appearance, not app theme | Set `themeVariant="dark"` explicitly |
| Nav arrows / small icons | Muted color on dark bg | Use `brand.primary` for interactive icons |
| Chip/tag backgrounds | Transparent or semi-transparent | Use `surface` with visible border |

---

## 2. Touch Targets & Accessibility

These patterns benefit ALL users. Treat them as defaults, not accommodations.

### Touch Target Sizes

| Element | Minimum Size | Rationale |
|---------|-------------|-----------|
| Buttons, tabs | 48×48dp (ideally 56dp+) | Apple HIG + WCAG 2.5.8 |
| List items | 56dp height | Finger-friendly tap zone |
| Close/dismiss buttons | 44×44dp + hitSlop 12 | Small targets cause rage taps |
| Spacing between targets | ≥ 8dp | Prevents mis-taps |

### Interaction Patterns (Preferred → Avoid)

| Preferred | Avoid | Why |
|-----------|-------|-----|
| Tap to select/deselect | Toggle on first tap, edit on second | Confusing dual-behavior |
| Explicit add/remove buttons | Minimum-1 selection (can't deselect) | Traps users |
| List of items + "Add" button | Grid of fixed options | Flexible, scalable, clear |
| Tap to edit, × to remove | Swipe gestures | Swipe is undiscoverable for many users |
| Bottom sheet modal picker | Inline expanding picker | Inline pickers eat screen space |
| Confirmation on destructive actions | Immediate delete | Undo is harder than confirming |

### Text & Typography

- Body text: ≥ 16sp (never smaller for readable content)
- Labels/metadata: ≥ 13sp
- Section headers: ≥ 18sp, bold
- Never rely on color alone to convey meaning (add icons, badges, or labels)

---

## 3. Date & Time Pickers

Date/time pickers are the most commonly broken UI in mobile apps.

### Rules

1. **Never show inline spinners** — they eat half the screen and look broken
2. **Always use a bottom-sheet modal** with a Done button
3. **Done must commit the value** even if the user didn't scroll (use the default/current value)
4. **Tapping outside the sheet = cancel** (don't commit)
5. **Show the current value clearly** in the trigger field before opening
6. **12-hour format** for user-facing display (store 24h internally)
7. **Platform-native pickers** are fine but need contrast fixes on dark themes

### Pattern: Tappable Field → Modal Picker

```
┌─────────────────────────┐
│ 🕐  8:00 AM        [✎] │  ← Tap to open picker modal
└─────────────────────────┘

        ↓ opens ↓

┌─────────────────────────┐
│ Change Time      [Done] │
│                         │
│    ◄ 7  [8]  9 ►       │  ← Native spinner in sheet
│    ◄ 55 [00] 05 ►      │
│    ◄ PM [AM] -- ►      │
│                         │
└─────────────────────────┘
```

### Date Range Pattern

For "From / To" date selection:
- Show both dates as tappable fields side by side
- Open one modal at a time (never two inline spinners)
- Validate: start ≤ end, end ≤ today
- Quick presets above the fields: "Last 7 days", "Last 30 days", "All time"

---

## 4. Lists & Schedules — The Universal Pattern

When users need to manage a set of items (times, days, tags, etc.), use the **list + add** pattern:

```
┌─────────────────────────────────┐
│ 🕐  8:00 AM          [✎]  [×] │
│ 🕐  2:00 PM          [✎]  [×] │
│ 🕐  9:00 PM          [✎]  [×] │
├╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┤
│ Quick add: [Morning] [Noon] .. │  ← Preset chips (grayed when used)
├╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┤
│      ╌╌╌ + Add custom ╌╌╌      │  ← Dashed border button
└─────────────────────────────────┘
```

### Why This Works

- **Clear state**: user sees exactly what's selected
- **Easy remove**: × button, no ambiguity
- **Easy edit**: tap the item → opens picker modal
- **Easy add**: presets for common values, custom for anything else
- **No minimum trap**: can remove all items (form validates on submit)
- **Scales**: works for 1 item or 20

### When to Use Grid Instead

Only when options are:
- Fixed (not user-customizable)
- Small set (≤ 6)
- Mutually exclusive (radio-style, not multi-select)
- Example: frequency picker (Daily / Weekly / As-needed)

---

## 5. Navigation & Tab Bar

### Tab Bar

- Max 5 tabs (iOS guideline; 4 is better)
- Order by frequency of use: most-used leftmost
- Active tab: solid icon + accent color
- Inactive tab: outline icon + muted color
- Bottom padding for home indicator (iOS) / gesture bar (Android)

### Cross-Screen Data Freshness

| Scenario | Pattern |
|----------|---------|
| User changes data on Screen A, navigates to Screen B | Screen B must reflect the change immediately |
| Tab switch | Refetch or invalidate on focus |
| Pull-to-refresh | Always supported on scrollable content |
| Background → Foreground | Refetch if data is time-sensitive |

**Cache invalidation rule**: When a mutation succeeds, invalidate ALL query keys that could display the affected data — not just the current screen's key.

### Loading States

- **Offline-first / local storage**: No loading spinners. Data is instant.
- **Network-dependent**: Skeleton screens (not spinners) for first load; silent refresh after.
- **Mutations**: Disable the button + show inline progress (not a blocking modal).

---

## 6. Form Design

### Layout

- One field per row (never side-by-side inputs on mobile)
- Labels above inputs (not inside as placeholders — they disappear on focus)
- Group related fields with section headers
- Primary action (Save/Submit) at the bottom, full-width, 56dp+ height
- Disabled state: reduced opacity (0.4) + non-interactive

### Validation

- Validate on submit, not on every keystroke
- Show errors inline below the field (red text)
- Scroll to first error
- Clear field error when user starts editing that field

### Keyboard

- `keyboardShouldPersistTaps="handled"` on ScrollViews with forms
- Numeric keyboard for number inputs
- Dismiss keyboard on scroll

---

## 7. Component Consistency (Switches, Buttons, Inputs)

Inconsistent components are the #1 visual polish killer. They happen silently when different screens are built at different times.

### The Switch Problem (real-world example)

A single app had **three visually different toggle switches** because:

1. **Mixed component libraries** — Some screens used `Switch` from `react-native-paper` (Material Design 3 styling), others used React Native's built-in `Switch`. Paper's Switch renders a filled colored thumb; RN's renders a white thumb on a colored track. Completely different visual language.
2. **Inconsistent color props** — Even when using the same `Switch` component, developers passed different color values: one used `brand.primary` for the track, another used `primaryContainer`, a third used `brand.primary + '66'` (translucent). One had a white thumb, another had a purple thumb.
3. **No shared component** — Each screen defined its Switch inline with whatever props the developer remembered.

### Rules

| Rule | Why |
|------|-----|
| **Pick ONE Switch component** (RN or Paper, not both) | Mixing gives different rendering, especially thumb shape/size |
| **Create a shared `<AppSwitch>` wrapper** | Single source of truth for colors, sizing, accessibility props |
| **Never set component colors inline** | Use theme tokens via the wrapper; inline colors drift over time |
| **Audit all instances after any theme change** | `grep -rn "Switch\|trackColor\|thumbColor"` across the project |

### Recommended pattern

```tsx
// src/components/ui/AppSwitch.tsx
import { Switch } from 'react-native';
import { useAppTheme } from '../../contexts/ThemeContext';

export function AppSwitch({ value, onValueChange, disabled }: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const { palette, brand } = useAppTheme();
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: palette.border, true: brand.primary }}
      thumbColor={value ? '#fff' : palette.surfaceVariant}
    />
  );
}
```

### This applies to ALL repeated components

Switches are the most visible offender, but the same problem occurs with:
- **Buttons** (primary/secondary/destructive — inconsistent border radius, padding, font weight)
- **Text inputs** (different border colors, placeholder opacity, focus states)
- **Cards** (varying border radius, shadow, padding across screens)
- **Chips/tags** (different padding, font size, active states)

**The fix is always the same: one wrapper component per pattern, used everywhere.**

### Pre-flight check

Add to your audit: `grep -rn "<Switch" src/ app/` — every instance should be the shared `<AppSwitch>`. If you find a raw `<Switch>` with inline colors, it's a bug.

---

## 8. Pre-Flight Checklist

Run for every screen before marking it done:

- [ ] Dark theme: all elements have visible borders/contrast
- [ ] Light theme: no elements disappear on white
- [ ] Touch targets ≥ 48dp
- [ ] No inline date/time spinners (use modal pickers)
- [ ] Modal pickers have Done button that works without scrolling
- [ ] Cache invalidation: changes on Screen A reflected on Screen B
- [ ] Empty state: screen looks intentional with zero data
- [ ] Tab bar: doesn't overlap home indicator
- [ ] Form validation: errors show inline, clear on edit
- [ ] Keyboard: doesn't cover active input
- [ ] Tested on device (not just simulator)
- [ ] Component consistency: no raw `<Switch>` with inline colors (use `<AppSwitch>`)
- [ ] No mixed component libraries for the same primitive (e.g., Paper Switch + RN Switch)
