# Design System Specification: The Ethereal Canvas

## 1. Overview & Creative North Star: "The Digital Aurora"
The Creative North Star for this design system is **"The Digital Aurora."** Much like the northern lights dancing against a pitch-black sky, this system relies on the juxtaposition of infinite depth and vibrant, kinetic energy. 

To move beyond the "standard app" look, we reject rigid, boxed layouts in favor of **Organic Fluidity**. We achieve this through:
*   **Intentional Asymmetry:** Hero images and generative results should never feel "trapped." Use overlapping elements where a glass card partially obscures a background glow or image.
*   **Editorial Scaling:** We use extreme contrast between our `display-lg` typography and `body-sm` labels to create a high-end magazine feel.
*   **Depth through Atmosphere:** The UI is not a flat plane; it is an atmospheric space where elements float at varying levels of "fog" and "light."

---

## 2. Colors: Depth & Luminescence
Our palette is rooted in the void of space, punctuated by the high-frequency energy of AI creation.

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** Boundaries must be defined solely through background color shifts. To separate a feed from a header, transition from `surface` (`#060e20`) to `surface-container-low` (`#091328`). If you feel the urge to draw a line, use a gap of `spacing-4` instead.

### Surface Hierarchy & Nesting
Treat the UI as stacked sheets of obsidian and frosted glass.
*   **Base Layer:** `surface` (#060e20)
*   **Secondary Content Areas:** `surface-container` (#0f1930)
*   **Interactive Cards:** `surface-container-high` (#141f38)
*   **Floating Modals:** `surface-bright` (#1f2b49) with backdrop-blur.

### The "Glass & Gradient" Rule
Primary actions (like "Generate") must never be a flat color. Use a **Signature Gradient**:
*   **Direction:** 135° Linear
*   **Stops:** `primary-dim` (#9c48ea) to `secondary` (#53ddfc).
*   **Interaction:** On hover/active, shift the gradient opacity or increase the spread of a `secondary` glow.

---

## 3. Typography: Editorial Authority
We pair the technical precision of **Inter** with the futuristic, wide stance of **Space Grotesk** for headings.

*   **Display & Headlines (Space Grotesk):** These are your "Brand Moments." Use `display-lg` (3.5rem) for empty states or welcome screens. The tight tracking and bold weight convey power and cutting-edge tech.
*   **Titles & Body (Inter):** These handle the "Utility." Inter’s high x-height ensures legibility against dark backgrounds.
*   **Hierarchy Tip:** Always skip a size in the scale to create drama. Pair a `headline-lg` title with a `body-md` description to emphasize the premium editorial feel.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows feel "dirty" on deep charcoal backgrounds. We use **Luminous Elevation**.

*   **The Layering Principle:** To lift a card, move it up the surface tier (e.g., from `surface-container-low` to `surface-container-highest`). The slight shift in blue-gray tones creates a cleaner "lift" than a shadow.
*   **Ambient Glows:** For floating elements, use an extra-diffused shadow (Blur: 40px) using a 10% opacity version of `primary` (#cc97ff). This mimics a neon light reflecting off a dark floor.
*   **Glassmorphism:** Use `surface-container-low` at 60% opacity with a `backdrop-filter: blur(20px)`. This is mandatory for bottom navigation bars and top app bars to allow the AI-generated art to bleed through the UI.
*   **The "Ghost Border":** If accessibility requires a border, use `outline-variant` (#40485d) at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Style & Substance

### Buttons
*   **Primary:** Signature Gradient (Purple to Cyan), `rounded-full`, `headline-sm` text. No border. Subtle outer glow using `secondary-dim`.
*   **Secondary:** Glass effect. `surface-bright` at 20% opacity, `backdrop-blur-md`, with a `Ghost Border`.
*   **Tertiary:** Ghost style. No background, `primary` (#cc97ff) text, `label-md` bold.

### Input Fields (Prompt Bars)
*   **Style:** `surface-container-lowest` background. Large `rounded-md` (1.5rem). 
*   **Focus State:** Instead of a border, the background shifts to `surface-container-high` and a subtle `primary` glow emanates from beneath the input.

### AI Result Cards
*   **Constraint:** **No Dividers.**
*   **Layout:** Use `rounded-lg` (2rem) for the image container. Text overlays should sit on a `surface-container-lowest` (black) gradient fade at the bottom of the image for legibility.

### Selection Chips
*   **Unselected:** `surface-container-high`, `on-surface-variant` text.
*   **Selected:** `primary` background, `on-primary-fixed` (black) text for maximum "pop."

---

## 6. Do's and Don'ts

### Do:
*   **Do** use `spacing-8` and `spacing-10` to create "breathable" luxury. High-end design is defined by the space you *don't* fill.
*   **Do** allow images to break the container. An AI-generated character's head should slightly overlap the headline above it.
*   **Do** use `tertiary` (#ff86c3) sparingly for "Magic" features (e.g., Upscaling or Variating).

### Don't:
*   **Don't** use pure `#000000` except for the `surface-container-lowest` layer. It kills the "atmospheric" depth.
*   **Don't** use 1px dividers. Use a `surface` color shift or `spacing-6`.
*   **Don't** use standard "Material Design" ripple effects. Use subtle scale-up (1.02x) or opacity fades for interactions.
*   **Don't** use sharp corners. Everything must feel sculpted and ergonomic (minimum `rounded-DEFAULT` of 1rem).

---

## 7. Tokens Reference (Summary)
*   **Primary Action:** `linear-gradient(135deg, #9c48ea 0%, #53ddfc 100%)`
*   **Main Background:** `#060e20`
*   **Surface High:** `#141f38`
*   **Corner Radius (Action):** `9999px`
*   **Corner Radius (Card):** `2rem`