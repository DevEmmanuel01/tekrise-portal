# Known Defects: Task 1 (Design System & Token Pipeline)

## Defect 1: Single-Pass Token Reference Resolution in `convert-tokens.mjs`
* **File & Location:** `task-01-design-system/convert-tokens.mjs` (Lines 24–38, role-alias resolution block).
* **Description:** The converter script resolves single-hop token aliases (e.g., `{color.primitives.primary.40}` $\rightarrow$ `var(--ref-primary-40)`), but does not recursively resolve multi-hop semantic-to-semantic aliases (such as a component token `{color.roles.primary}` pointing to another role `{color.primitives.primary.40}`).
* **Production Cost:** If a designer in Figma chains a component-level variable to a semantic role variable (a 2-hop alias), the converter outputs a broken CSS variable reference (`var(--ref-roles-primary)`), causing the browser to fall back to `transparent` or `inherit` in production without throwing a build error.

## Defect 2: Absence of Automated Dark-Mode Media Query / `[data-theme="dark"]` Output in `tokens.css`
* **File & Location:** `task-01-design-system/tokens.css` (Lines 1–65, `:root` semantic role declarations).
* **Description:** Although the 13-tone primitive palettes (`0` through `100`) are fully present in `:root` to support both light and dark modes from a single source, `tokens.css` currently binds semantic roles only for the Light scheme (`--color-surface: var(--ref-neutral-100)`).
* **Production Cost:** Users operating devices with `prefers-color-scheme: dark` in low-light environments receive the high-luminance light surface (`#FFFFFF`), causing eye strain and missing the secondary benefit of generating 13 tonal steps.

## Defect 3: Static `px`/`rem` Font Sizes Without Fluid Viewport Scaling on `type-display-lg`
* **File & Location:** `task-01-design-system/tokens.css` (Lines 68–76, `.type-display-lg` class definition).
* **Description:** In the raw Task 1 token export from Figma, `type-display-lg` exports as a fixed `3.5rem` (`56px`) with a `4.875rem` (`78px`) line-height rather than a fluid `clamp()` expression.
* **Production Cost:** On narrow `320px–360px` Android screens (common among Tekrise students in Ibadan), a fixed `56px` heading wraps long words awkwardly until responsive `clamp()` overrides are applied in Task 2 Step 10.
