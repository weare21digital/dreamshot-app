# Design Mockups

Before writing any code, create visual mockups for every screen in your app.

> **Designs are references, not pixel-perfect targets.** Use them to understand layout, component arrangement, and screen flow. The **app spec** (`specs/`) is the real source of truth for what to build — designs just show roughly how it should look. Don't obsess over exact spacing, shadows, or styling from the mockups.

## Workflow

```
Idea → Google Stitch (HTML mockups) → Review & iterate → Build from mockups
```

1. **Describe your screens** to [Google Stitch](https://stitch.withgoogle.com/) (or similar AI design tool)
2. **Get HTML + PNG** for each screen
3. **Store in your repo** under `design/`
4. **Iterate** until the design feels right
5. **Build** — use the mockups as reference when implementing screens

## Directory Structure

```
design/
├── screen_name_1/
│   ├── code.html        # Interactive HTML mockup
│   └── screen.png       # Screenshot/preview
├── screen_name_2/
│   ├── code.html
│   └── screen.png
└── screen_name_3/
    ├── code.html
    └── screen.png
```

Use descriptive folder names with underscores (e.g., `welcome_screen`, `home_screen`, `nutrition_details`).

## Skeleton Example Designs

The skeleton ships with example mockups in the `design/` directory:

```
design/
├── README.md
├── welcome_screen/    # Auth screen — Google, Apple, email sign-in
│   └── code.html
├── home_screen/       # Dashboard — stats grid, categories, feature cards
│   └── code.html
└── profile_screen/    # Profile — avatar, premium badge, settings list
    └── code.html
```

Study these to understand the expected format, then replace them with your app's designs.

## Color Convention (Important)

Every design HTML should define brand colors in the **tailwind config block**. This is the bridge between your designs and the codebase — `setup.sh` extracts these colors and writes them into `src/config/theme.ts`.

```js
tailwind.config = {
    theme: {
        extend: {
            colors: {
                "primary": "#2bee3b",       // → brand.primary
                "secondary": "#1a2e1c",     // → brand.secondary
                "accent": "#3b82f6",        // → brand.accent
                "background-light": "#f2f5f3",  // → light.background
                "background-dark": "#102212",    // → dark.background
            },
        },
    },
}
```

**Use the same color names across all your design files.** The script reads the first file that has them.

## Tips for Good Mockups

### What to include
- **All main screens** — every tab/route the user will see
- **Both states** — empty states, loading states, filled states
- **Light and dark** — if your app supports both themes
- **Mobile proportions** — design at ~390×844 (iPhone 15 ratio)

### What makes a useful mockup
- Use your actual brand colors (from `src/config/theme.ts`)
- Include realistic data, not "Lorem ipsum"
- Show navigation patterns (tabs, back buttons, headers)
- Include interactive elements (buttons, inputs, toggles)

### Google Stitch prompts that work well
- "Design a mobile app screen for [description]. Use [brand color] as primary. iPhone proportions, clean modern UI."
- "Create a food search dashboard with a search bar at top, category chips, and a grid of food cards with calorie counts. Primary color: #2BEE3B, dark background."
- Include screenshots of your skeleton's existing screens as reference for consistent style

## From Mockup to Implementation

When building screens from mockups:

1. **Open the HTML** in a browser — it's interactive and inspectable
2. **Map HTML elements to React Native components** — divs become Views, spans become Text, etc.
3. **Use skeleton UI components** where possible (`src/components/ui/`) — DataCard, SearchInput, ChipSelector, etc.
4. **Use theme tokens** from `useAppTheme()` — never hardcode colors from the HTML
5. **Match the layout, adapt the details** — mockups show component arrangement, not exact pixels

> **Spec > Design.** If the spec says something different from the mockup, follow the spec. Designs are rough visual guides for layout and component identification — the spec defines the actual requirements and behavior.

### HTML → React Native mapping

| HTML | React Native | Skeleton Component |
|------|-------------|-------------------|
| Search input | `TextInput` | `SearchInput` |
| Card with data | `View` + `Text` | `DataCard` / `CompactDataCard` |
| Chip/tag row | `ScrollView` + `Chip` | `ChipSelector` |
| Grid layout | `FlatList` numColumns | `CategoryGrid` |
| Section title | `Text` | `SectionHeader` |
| Badge/pill | `View` + `Text` | `MetricBadge` / `FeatureBadge` |
| Progress circle | SVG | `ProgressRing` |
| Banner/alert | `View` | `InfoBanner` |
| Stats row | `View` row | `StatGrid` |

## Related Docs

- [UI Component Library](../02-configuration/ui-components.md)
- [Theming](../02-configuration/theming.md)
- [Zero to App Store](../00-zero-to-store.md)
