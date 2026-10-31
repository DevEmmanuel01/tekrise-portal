# Task 01: The Design System, and Proving the Agent Used It

## 1. What This Task Was
Building an engineering-grade design system in Figma for the **Tekrise Academy Student & Admissions Portal**, exporting it as structured JSON tokens, compiling it via script into semantic CSS custom properties (`tokens.css`), and proving through codebase searches, agent interrogation, and a deliberate Git branch regression that the coding agent actually consumed the system.

## 2. What We Built
* **Business Brief (`docs/business-brief.md`):** Defined Tekrise Academy (Ibadan hybrid tech institute), its student/admissions users, tuition installment workflow, and institutional-yet-modern visual direction.
* **Colour System (`docs/colour-roles.md`):** Extracted Tekrise's `#00E676` primary green and `#052C26` deep forest teal. Pinned `#00E676` at `Primary 40` and solved the high-luminance contrast trap by mapping `--color-on-primary` to `Primary 10` (`#052C26`, `9.45:1` AAA) rather than white (`1.56:1` fail).
* **15-Style Typography Scale & Divergences (`docs/type-scale.md`, `docs/divergences.md`):** Built 5 roles × 3 sizes in `Inter` using strict `1.4x`, `1.5x`, and `1.6x` line-height multipliers, documenting three deliberate divergences from M3 defaults and the exact scenarios where our choices would fail.
* **Brand-Tinted Shadows (`docs/shadows.md`):** Three elevation tiers (`soft`, `medium`, `hard`) tinted with `rgb(5, 44, 38)` (`primary-10`) instead of black.
* **Token Converter & Screen Proof (`convert-tokens.mjs`, `tokens.css`, `index.html`, `styles.css`):** Automated JSON-to-CSS compilation enforcing semantic role usage (`0` raw hex values in component CSS).

## 3. Key Decisions & What We Got Wrong First
* **Mistake 1 (Incomplete Figma Export):** Our first token export (`evidence/05-tokens-incomplete.json`) omitted Figma Variables (colours), exporting only typography and shadows. We caught this via line-count and missing `--color-*` output, re-exported with variables enabled (`evidence/06-tokens-complete.json`), and documented the diff.
* **Mistake 2 (Unconstrained Initial Agent Prompt):** Our first prompt allowed the agent to reference primitive variables directly. We rewrote the prompt (`docs/prompts.md`) to lock primitives behind internal `--ref-*` variables and require semantic `--color-*` roles on all UI elements.
* **Known Defects:** Documented in `docs/defects.md` with exact file and line references.

## 4. Evidence & Deliverables Index
* **Documentation (`docs/`):** `business-brief.md`, `colour-roles.md`, `type-scale.md`, `divergences.md`, `shadows.md`, `prompts.md`, `defects.md`, `interview-answers.md`.
* **Evidence (`evidence/`):**
  * `01-palette-before-pin.png` & `02-palette-after-pin.png`
  * `03-spacing-default.png` & `04-spacing-chosen.png`
  * `05-tokens-incomplete.json` & `06-tokens-complete.json`
  * `07-raw-value-search.txt` (Command + 0 raw hex matches output)
  * `08-agent-typography-answer.txt`
  * `09-screen-without-system.png` & `10-screen-with-system.png`
  * `11-broken-referencing.png` & `12-git-log-branch-unmerged.txt`
