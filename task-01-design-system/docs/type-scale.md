# Typography System: Tekrise Academy Portal

## 1. Typeface Selection
We selected **`Inter`** (`'Inter', -apple-system, BlinkMacSystemFont, sans-serif`) with `font-variant-numeric: tabular-nums` enabled globally across numeric tables and tuition counters.
* **Why `Inter` over Tekrise's existing `ui-sans-serif`:** Tekrise Academy's marketing site uses `ui-sans-serif`, which delegates rendering to the operating system (San Francisco on macOS, Roboto on Android, Segoe UI on Windows), causing line wraps and input heights to shift across student devices. `Inter` provides a tall x-height (`0.53`), open apertures for low-DPI Android screens, and native tabular numerals (`tnum`) so Naira installment columns (`₦180,000.00`) align vertically to the pixel.

## 2. Line-Height Formula & Multiplier Rationale
Every style's line height is derived strictly from the formula $\text{Line Height} = \text{round}(\text{Font Size} \times \text{Multiplier})$ using the three allowed multipliers (`1.4`, `1.5`, `1.6`):
* **Display & Headline Roles (`1.4x` multiplier):** Large headings (`24px` to `56px`) are short (typically 1–2 lines). A `1.5x` or `1.6x` multiplier at `56px` creates `84px–90px` of vertical spacing, disconnecting the first line of a wrapped heading from the second. `1.4x` keeps multi-line headings visually grouped while preventing descenders (`g`, `y`, `p`) from colliding with ascenders below.
* **Title & Label Roles (`1.4x` multiplier):** Titles and button/input labels sit inside bounded UI containers (cards, buttons, table headers, badges). Using `1.4x` creates predictable vertical centering inside `rem`-padded buttons.
* **Body Role (`1.6x` multiplier for Body Large/Medium, `1.5x` for Body Small):** Students read project briefs, compliance terms, and fee breakdown notes on 6-inch mobile screens. A generous `1.6x` line height on `16px` and `14px` body prose prevents eye-tracking errors across lines on shaky commute connections, while `1.5x` on `12px` captions keeps helper text compact underneath form inputs.

## 3. Complete 15-Style Type Scale (5 Roles × 3 Sizes)

| Role & Size | Token Name | Font Family | Weight | Font Size | Multiplier | Line Height | Letter Spacing | Primary Use Case in Tekrise Portal |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Large** | `type-display-lg` | Inter | `600` (SemiBold) | `56px` (`3.5rem`) | `1.4x` | `78px` (`4.875rem`) | `-0.02em` (`-1.12px`) | Marketing hero & cohort launch splash |
| **Display Medium** | `type-display-md` | Inter | `600` (SemiBold) | `45px` (`2.8125rem`) | `1.4x` | `63px` (`3.9375rem`) | `-0.02em` (`-0.90px`) | Portal onboarding welcome header |
| **Display Small** | `type-display-sm` | Inter | `600` (SemiBold) | `36px` (`2.25rem`) | `1.4x` | `50px` (`3.125rem`) | `-0.015em` (`-0.54px`) | Total tuition balance figure on dashboard |
| **Headline Large** | `type-headline-lg` | Inter | `600` (SemiBold) | `32px` (`2.0rem`) | `1.4x` | `45px` (`2.8125rem`) | `-0.015em` (`-0.48px`) | Top-level page titles (e.g., "Student Registration") |
| **Headline Medium** | `type-headline-md` | Inter | `600` (SemiBold) | `28px` (`1.75rem`) | `1.4x` | `39px` (`2.4375rem`) | `-0.01em` (`-0.28px`) | Section headers (e.g., "Installment Ledger") |
| **Headline Small** | `type-headline-sm` | Inter | `600` (SemiBold) | `24px` (`1.5rem`) | `1.4x` | `34px` (`2.125rem`) | `-0.01em` (`-0.24px`) | Modal headers & empty-state titles |
| **Title Large** | `type-title-lg` | Inter | `600` (SemiBold) | `22px` (`1.375rem`) | `1.4x` | `31px` (`1.9375rem`) | `0em` (`0px`) | Card titles (e.g., "Data Analytics — Cohort 04") |
| **Title Medium** | `type-title-md` | Inter | `500` (Medium) | `16px` (`1.0rem`) | `1.4x` | `22px` (`1.375rem`) | `0.005em` (`+0.08px`) | Form subsection titles & navigation tabs |
| **Title Small** | `type-title-sm` | Inter | `500` (Medium) | `14px` (`0.875rem`) | `1.4x` | `20px` (`1.25rem`) | `0.005em` (`+0.07px`) | Table column headers & compact list titles |
| **Body Large** | `type-body-lg` | Inter | `400` (Regular) | `16px` (`1.0rem`) | `1.6x` | `26px` (`1.625rem`) | `0em` (`0px`) | Primary form input values & lead paragraphs |
| **Body Medium** | `type-body-md` | Inter | `400` (Regular) | `14px` (`0.875rem`) | `1.6x` | `22px` (`1.375rem`) | `0.005em` (`+0.07px`) | Standard dashboard descriptions & policy text |
| **Body Small** | `type-body-sm` | Inter | `400` (Regular) | `12px` (`0.75rem`) | `1.5x` | `18px` (`1.125rem`) | `0.01em` (`+0.12px`) | Inline input validation messages & timestamps |
| **Label Large** | `type-label-lg` | Inter | `600` (SemiBold) | `14px` (`0.875rem`) | `1.4x` | `20px` (`1.25rem`) | `0.01em` (`+0.14px`) | Primary & secondary button text (`rem`-padded) |
| **Label Medium** | `type-label-md` | Inter | `500` (Medium) | `12px` (`0.75rem`) | `1.4x` | `17px` (`1.0625rem`) | `0.02em` (`+0.24px`) | Form field labels above inputs |
| **Label Small** | `type-label-sm` | Inter | `500` (Medium) | `11px` (`0.6875rem`) | `1.4x` | `15px` (`0.9375rem`) | `0.03em` (`+0.33px`) | Status pill badges ("VERIFIED", "OVERDUE") |

## 4. Visual Judgement on Display Large Letter Spacing (`03-spacing-default.png` vs. `04-spacing-chosen.png`)
At `56px` with `0%` (`0px`) letter spacing (`evidence/03-spacing-default.png`), `Inter SemiBold` introduces wide white gaps between open-counter letter pairs (`C-o`, `T-u`, `1-8-0`), causing the eyes to fixate on individual glyphs rather than scanning the phrase and Naira figure as unified word shapes. Tightening letter spacing to **`-2%` (`-1.12px`)** (`evidence/04-spacing-chosen.png`) pulls the word shapes together into compact, high-authority blocks without allowing flat vertical stems (`l-i`, `n-m`) to touch.
