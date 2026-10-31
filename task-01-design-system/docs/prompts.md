# Task 1 Prompts Log (Verbatim, Including Failed Attempts)

## 1. Initial Attempt (Failed — Exposed Primitive Variables to Component CSS)

### Verbatim Prompt Used:
```text
Write a script to convert task-01-design-system/evidence/06-tokens-complete.json into a CSS variables file called tokens.css, and build a student portal screen for Tekrise Academy using those CSS variables.

Read task-01-design-system/evidence/06-tokens-complete.json and the markdown specs in task-01-design-system/docs/.

1. Write and run a Node.js script at task-01-design-system/convert-tokens.mjs that parses 06-tokens-complete.json and outputs task-01-design-system/tokens.css.
2. CRITICAL RULE: In tokens.css, define primitive colours as internal variables (--ref-*) ONLY inside :root, and expose semantic colour roles (--color-primary, --color-on-primary, --color-surface, --color-on-surface, --color-surface-container, --color-on-surface-variant, --color-outline, --color-error, --color-on-error-container, --color-error-container, --color-success, --color-success-container, etc.) that reference those primitives via var(). Also generate CSS custom properties and utility classes for all 15 typography styles (.type-display-lg through .type-label-sm) and the 3 brand-tinted shadows (--shadow-soft, --shadow-medium, --shadow-hard).
3. Build the Tekrise Academy Student Tuition & Cohort Standing screen at task-01-design-system/index.html and task-01-design-system/styles.css.
4. STRICT CONSTRAINT: styles.css and index.html must NEVER use raw hex codes (#...), rgb(), hsl(), or primitive (--ref-*) variables. Every colour, typography style, and shadow on the interface must consume semantic role variables and typography classes from tokens.css so the design system remains the single source of truth.
