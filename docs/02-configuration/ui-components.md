# UI Component Library

> ⚠️ **Requires development builds**
> Native modules require **`npx expo run:ios`** / **`npx expo run:android`**. **Expo Go is not supported.**

The skeleton includes a library of **reusable, themed UI components** in `src/components/ui/`. All components use `useAppTheme()` and adapt to light/dark mode automatically.

## Preview

A **ComponentShowcase** screen is available in dev builds at `app/(main)/components.tsx`. Access it via the "Component Library" link on the WelcomeScreen (dev mode only).

## Components

### SearchInput
Full-width search bar with icon and optional mic button.
```tsx
<SearchInput placeholder="Search 10,000+ items..." onChangeText={setText} />
```

### CategoryGrid
Horizontal row of icon + label category items.
```tsx
<CategoryGrid
  items={[
    { icon: 'restaurant', label: 'Fruits', onPress: () => {} },
    { icon: 'eco', label: 'Veggie', onPress: () => {} },
  ]}
/>
```

### DataCard
Rich card with title, subtitle, calorie badge, and macro breakdown (protein/carbs/fat).
```tsx
<DataCard
  title="Avocado, Medium"
  subtitle="1 unit (201g)"
  calories={322}
  macros={[
    { label: 'Protein', value: '4g', color: brand.primary },
    { label: 'Carbs', value: '17g', color: brand.accent },
    { label: 'Fat', value: '29g', color: status.warning },
  ]}
/>
```

### CompactDataCard
Minimal card with title, macros summary, and calorie count.
```tsx
<CompactDataCard
  title="Whole Milk"
  subtitle="P: 8g  C: 12g  F: 8g"
  rightLabel="150 KCAL"
  rightSub="240ml"
/>
```

### MetricBadge
Colored badge showing a label and value (e.g., macro nutrients).
```tsx
<MetricBadge label="PROTEIN" value="4g" color={brand.primary} />
```

### ProgressRing
SVG circular progress indicator with centered value. Requires `react-native-svg`.
```tsx
<ProgressRing progress={75} value="17g" label="Carbs" color={brand.accent} />
```

### StatGrid
Two-column grid of label/value pairs (e.g., micronutrients).
```tsx
<StatGrid
  items={[
    { label: 'Fiber', value: '13.4g' },
    { label: 'Sugar', value: '1.3g' },
  ]}
/>
```

### InfoBanner
Alert-style banner with icon and message. Supports `info`, `warning`, `success`, `error` variants.
```tsx
<InfoBanner variant="warning" message="This item contains allergens." />
```

### ChipSelector
Horizontal row of selectable chips (single selection).
```tsx
<ChipSelector
  options={['50g', '100g', '200g', '500g']}
  selected="200g"
  onSelect={setServing}
/>
```

### FeatureBadge
Icon + title + description row for feature lists (e.g., premium benefits).
```tsx
<FeatureBadge icon="star" title="LIFETIME PRO ACCESS" description="No monthly fees." />
```

### SectionHeader
Uppercase section title with optional action button.
```tsx
<SectionHeader title="Data Cards" actionLabel="See All" onAction={() => {}} />
```

## Theming Pattern

All components follow this pattern:

```tsx
import { useAppTheme } from '../../contexts/ThemeContext';

function MyComponent() {
  const { palette, brand, status } = useAppTheme();
  
  return (
    <View style={{ backgroundColor: palette.cardBackground, borderColor: palette.borderVariant }}>
      <Text style={{ color: palette.text }}>Title</Text>
      <Text style={{ color: palette.textSecondary }}>Subtitle</Text>
    </View>
  );
}
```

**Key tokens:**
- `palette.background` / `palette.surface` — screen and card backgrounds
- `palette.text` / `palette.textSecondary` — primary and secondary text
- `palette.cardBackground` / `palette.borderVariant` — card styling
- `brand.primary` — accent color for active states, buttons, icons
- `brand.accent` — secondary accent
- `status.success/error/warning/info` — semantic colors

**Brand-tinting pattern** for subtle colored backgrounds:
```tsx
backgroundColor: `${brand.primary}06`  // 6% opacity tint
borderColor: `${brand.primary}12`      // 12% opacity border
```

## Adding New Components

1. Create `src/components/ui/MyComponent.tsx`
2. Use `useAppTheme()` for all colors — never hardcode
3. Export from `src/components/ui/index.ts`
4. Add a demo section in `ComponentShowcase.tsx`
5. Use `@expo/vector-icons` (not `react-native-vector-icons`): `import { MaterialIcons as Icon } from '@expo/vector-icons'`

## Related Docs
- [Theming](theming.md)
- [Architecture](../07-reference/architecture.md)
