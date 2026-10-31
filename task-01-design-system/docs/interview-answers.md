# Task 1 Interview Defence Answers

### 1. How would you structure design tokens?
I structure design tokens in a three-tier hierarchy so raw values never touch component code:
1. **Primitive (Reference) Tokens (`--ref-*`):** Context-agnostic raw values representing the available palette and scales (e.g., `--ref-primary-40: #00E676`, `--ref-primary-10: #052C26`, `--ref-neutral-100: #FFFFFF`). They state *what* the value is, never *where* it is used.
2. **Semantic (System/Role) Tokens (`--color-*`, `--type-*`):** Purpose-driven aliases that point to primitives (e.g., `--color-primary: var(--ref-primary-40)`, `--color-on-primary: var(--ref-primary-10)`, `--color-surface: var(--ref-neutral-100)`). They define the *job* a token performs in the UI.
3. **Component Tokens (when scale demands it):** Scoped aliases pointing to semantic tokens (e.g., `--button-primary-bg: var(--color-primary)`).
For Tekrise Academy's portal, we enforced a strict two-tier boundary (Primitives + Semantic Roles) in `tokens.css`, forbidding `styles.css` from referencing primitives or hex literals directly.

### 2. When is a token change breaking?
A token change is breaking in three scenarios:
1. **Structural/Naming Breaks:** Renaming or deleting a semantic token (e.g., changing `--color-on-surface-variant` to `--color-text-muted`) without a deprecation alias breaks every stylesheet consuming that variable, causing browsers to fall back to `inherit` or `initial`.
2. **Contract/Accessibility Breaks:** Changing the tonal target of a semantic role in a way that violates its contrast contract—for example, re-pointing `--color-on-primary` from `#052C26` (`Primary 10`) to `#FFFFFF` (`Primary 100`) on Tekrise's `#00E676` primary surface drops contrast from `9.45:1` to `1.56:1`, rendering button labels unreadable.
3. **Layout/Geometry Breaks:** Modifying typography size, weight, or line-height multipliers (e.g., shifting body line-height from `1.6x` to `2.0x`) alters intrinsic container heights and causes text truncation or overflow in fixed grid cards.

### 3. How would you support multiple brands and themes?
By keeping component stylesheets 100% bound to **semantic role names** (`--color-primary`, `--color-surface`, `--type-headline-lg`) and swapping only the underlying mapping layer:
* **Multiple Themes (Light / Dark / High-Contrast):** Both themes share the exact same 13-tone primitive palette. Under `:root` (Light), `--color-surface` points to `var(--ref-neutral-100)` and `--color-on-surface` points to `var(--ref-neutral-10)`. Under `[data-theme="dark"]`, `--color-surface` rebinds to `var(--ref-neutral-10)` and `--color-on-surface` rebinds to `var(--ref-neutral-95)`. Zero component CSS changes are required.
* **Multiple Brands (White-Labelling):** Each brand supplies its own primitive JSON file (`tekrise-primitives.json` vs. `brand-b-primitives.json`) and brand-specific role overrides (such as font family and shadow tint). The build script compiles brand-scoped CSS bundles while the application's HTML/CSS consumes the identical semantic role contract.

### 4. Can tokens guarantee accessible contrast?
No. Tokens can **enforce** a verified contrast decision across an entire codebase, but they cannot **guarantee** accessible contrast automatically for two reasons:
1. **High-Luminance Brand Overrides Break Standard Formulas:** When we pinned Tekrise Academy's electric green (`#00E676`, relative luminance $0.652$) to `Primary 40`, Material's default pairing (`On-Primary` = `Primary 100` `#FFFFFF`) produced a `1.56:1` ratio—an immediate WCAG failure. A human designer had to inspect the luminance and point `--color-on-primary` to `Primary 10` (`#052C26`) to achieve `9.45:1`.
2. **Misapplied Role Pairs in Code:** Even if every token pair (`--color-primary` + `--color-on-primary`) is accessible, nothing stops a developer or AI agent from placing `--color-on-surface-variant` text on top of `--color-primary` unless pairing rules are audited in code review.

### 5. How do you ensure that colour contrast guidelines are met within a website or application's design?
I enforce contrast at three checkpoints rather than treating it as a post-build audit:
1. **Design System Matrix (Pre-Code):** In Figma, before any screen is drawn, I map every allowed foreground/background role pair (`on-surface` on `surface`, `on-primary` on `primary`, `error` on `surface`, `outline` on `surface`) and calculate their exact WCAG contrast ratios. Any pair below `4.5:1` for normal text (or `3.0:1` for large text and UI boundaries) is either reassigned to a deeper tone or explicitly restricted to non-text decoration (as we did with raw `#00E676` on white).
2. **Semantic Token Pairing:** I name tokens using explicit `X` and `on-X` pairs (`primary` / `on-primary`, `error-container` / `on-error-container`) so developers and AI agents know exactly which text token belongs on which surface.
3. **Real-Device & DevTools Verification:** I verify rendered screens using Chrome DevTools' contrast inspector and test under low-brightness/glare conditions.

### 6. Can you discuss the differences between WCAG levels A, AA and AAA?
WCAG 2.1 organises accessibility conformance into three progressive tiers:
* **Level A (Minimum Baseline):** Addresses the most severe barriers that make an interface completely impossible for assistive-technology users to operate—such as providing text alternatives for non-text content (`alt`), full keyboard operability with no keyboard traps, and not relying on colour alone to convey error states. It sets no minimum colour contrast ratio.
* **Level AA (Industry & Legal Standard):** The target required by most global regulations (including ADA, EN 301 549, and enterprise compliance). It requires a minimum contrast ratio of **`4.5:1`** for normal text, **`3.0:1`** for large text ($\ge 24\text{px}$ or $\ge 18.66\text{px}$ bold) and active UI components/borders, visible focus indicators, and consistent navigation.
* **Level AAA (Enhanced Accessibility):** Requires **`7.0:1`** contrast for normal text and **`4.5:1`** for large text, no timing constraints, and sign-language interpretation for media. While achieving AAA across an entire brand palette is rarely possible, we hit AAA (`8.95:1` to `19.34:1`) on Tekrise's primary reading and button pairs.

### 7. Discuss the importance of semantic HTML in the context of accessibility.
Semantic HTML (`<main>`, `<nav>`, `<header>`, `<form>`, `<label>`, `<button>`, `<h1>`–`<h6>`) provides the built-in accessibility tree that screen readers (like macOS VoiceOver or NVDA) and keyboard navigation rely on before a single line of CSS or JavaScript runs:
1. **Implicit Roles & Keyboard Mechanics:** A native `<button>` automatically sits in the `Tab` order (`tabindex="0"`), announces itself as `"button"` to screen readers, and fires on both `Enter` and `Space`. A `<div class="btn">` has zero keyboard focusability or screen-reader role unless manually patched with ARIA attributes and keydown listeners.
2. **Form Association:** Wrapping or linking `<label for="matricPin">` to an `<input id="matricPin">` ensures that when a vision-impaired student tabs into the field, the screen reader announces the field's purpose alongside its required/invalid state.
3. **Structural Landmarks:** Proper heading hierarchy and landmark regions allow assistive users to jump directly to the main form without tabbing through every header link.

### 8. How do you handle design handoff to developers using Figma?
In an AI-assisted and modern design-engineering workflow, handoff is not throwing static pictures over a wall—it is shipping a verifiable contract:
1. **Single Source of Truth via Tokens:** Every colour, type style, and shadow in Figma is defined using Figma Variables and Styles matching the codebase's semantic naming (`primary`, `on-primary`, `type-label-lg`), exported as `tokens.json`, and compiled via script into `tokens.css`.
2. **Explicit Component States & Constraints:** Rather than only designing the happy path, I specify default, hover, focus-visible, disabled, loading, and inline-error states, plus responsive behaviour (`rem` padding rather than fixed heights, `max-width` text wrapping, and `clamp()` rules).
3. **Verification Post-Build:** Handoff ends only after auditing the built DOM—running `grep` for raw hex leaks and inspecting computed styles in DevTools to prove the implementation consumed the tokens.

### 9. Why do AI-generated interfaces tend to look generic, and what specifically do you hand an agent to stop it?
AI coding agents predict the statistical average of public training repositories—which overwhelmingly means Tailwind Indigo/Blue (`#3B82F6`), `Inter`/`Roboto` at default `1.5` line-heights, uniform `16px` padding, and pure black `rgba(0,0,0,0.1)` shadows. When given an underspecified prompt like *"make it look modern and clean,"* producing the most common interface is mathematically the correct output for the model.

To stop this, you hand the agent three concrete engineering artifacts before it writes a line of UI code:
1. **A compiled token file (`tokens.css` / `tokens.json`)** containing a pinned brand primary (`#00E676`), accessible semantic role mappings (`--color-on-primary: #052C26`), a 15-style typographic scale with deliberate tracking/weight divergences, and brand-tinted shadows.
2. **A business brief (`business-brief.md`)** defining the exact emotional tone and user constraints.
3. **A strict constraint rule (`AGENTS.md` / prompt guardrail)** forbidding raw hex literals, primitive token usage, or hardcoded font sizes, verified via automated `grep` checks.

### 10. Your line height for display large is a specific number. Why that number and not one step either side of it? What would you lose with each?
Our `type-display-lg` font size is **`56px` (`3.5rem`)** and its line height is **`78px` (`4.875rem`)**, derived from our **`1.4x`** Display multiplier ($56 \times 1.4 = 78.4 \rightarrow 78\text{px}$).
* **Why `78px` (`1.4x`):** On Tekrise Academy's portal, Display Large renders multi-word titles and Naira tuition totals (`₦180,000`) that wrap onto two lines on mobile and tablet screens. `78px` provides `22px` of leading—enough clearance so capital ascenders, currency symbols (`₦`), and Yoruba diacritical marks never collide with descenders (`g`, `p`, `y`) from the line above, while keeping the two lines visually locked as one thought.
* **What we lose at one multiplier step higher (`1.5x` = `84px` or `1.6x` = `90px`):** A 2-line heading balloons to `168px–180px` tall, splitting the headline into two disconnected sentences and pushing critical form inputs below the fold on laptop screens.
* **What we lose at a tighter ratio (e.g., Material's `1.12x` = `64px`):** Descenders on line 1 nearly touch capital letters and `₦` double-bars on line 2, creating visual cramping.

### 11. Point at one place in your own token structure that you would build differently if you started again. Say what you would do instead and what it would cost.
If I started again, I would split our spacing and border-radius values out of `styles.css` and include them inside `06-tokens-complete.json` and `tokens.css` alongside colours, typography, and shadows. Currently, our token pipeline strictly governs colour roles, the 15 typography styles, and the 3 elevation shadows, while spacing (`0.75rem`, `1.5rem`) and corner radii (`0.5rem`, `0.75rem`) live as CSS rules in `styles.css`.
* **What I would do instead:** Define a 4pt/8pt spatial scale (`--space-1: 0.25rem` through `--space-12: 3rem`) and a 3-tier radius scale (`--radius-sm: 0.375rem`, `--radius-md: 0.625rem`, `--radius-lg: 1rem`) as Figma Variables exported directly into `tokens.json`.
* **What it would cost:** It adds ~20 extra variables to manage in Figma and increases initial setup and audit time by 30–40 minutes, plus requires stricter prompt constraints so the agent doesn't confuse button internal padding tokens with layout gap tokens.

### 12. Wrong-answer analysis: "I set up design tokens by exporting the hex values from Figma into a CSS file, so every colour in the codebase comes from one place. That makes it a single source of truth."
This candidate has confused **named CSS constants (primitives)** with a **semantic design token architecture**.
* **What is missing:** There is no **semantic role layer** (`--color-surface`, `--color-on-surface`, `--color-primary`, `--color-on-primary`) separating *what a colour is* (`--green-400: #00E676`) from *what job it performs in the interface*. Furthermore, there is no automated pipeline (`tokens.json` $\rightarrow$ script $\rightarrow$ `tokens.css`) keeping Figma and code synchronised, nor covers for typography or elevation.
* **What will go wrong in Month Four:** In month four, the business asks for Dark Mode or decides that cards should shift from pure white (`--white: #FFFFFF`) to a soft tinted surface while modals remain white. Because developers bound 200 components directly to `--white: #FFFFFF`, changing `--white` breaks modals and text contrast simultaneously. The team is forced to manually inspect and rewrite every component selector across the codebase, proving the CSS file was never a single source of truth for design intent.
