# Task 2 Step 10: Information Design, Fluid Typography & Document Metadata

## 1. Visual Hierarchy & Scannability Without Colour
If all colour is stripped from the Tekrise Academy Admissions Portal (greyscale view), the hierarchy still communicates three unmistakable tiers through scale, weight, and spatial grouping:
1. **Primary Focal Anchor (`.hero-title`):** Set in `Inter Bold (700)` with fluid sizing `clamp(1.75rem, 3.5vw + 0.75rem, 2.5rem)`, tight `-0.02em` tracking, and `text-wrap: balance` constrained to `28ch`. This prevents single-word orphans (`evidence/18-heading-wrap-bad.png` vs. `19-heading-wrap-good.png`).
2. **Secondary Structural Grouping (`.hero-card`, `.feature-card`, `.enquiry-card`):** Separated by `2.5rem` vertical rhythm, `1px` structural borders, and `1.75rem–2.5rem` internal card padding so the eye groups related controls (such as the Cohort 04 Enquiry inputs) before reading individual labels.
3. **Tertiary Metadata & Tabular Figures (`.stat-caption`, `.feature-card-meta`, `.tabular-nums`):** Set in `0.75rem–0.875rem` muted variant text with `font-variant-numeric: tabular-nums` on reference IDs and numeric counters (`80% Threshold`, `12–16 Weeks`).

## 2. Why Buttons & Inputs Use `rem` Padding Instead of Fixed `px` Heights
Every interactive element (`.form-btn-submit`, `.form-input`, `.form-select`) uses `rem`-based padding (`0.875rem 1.75rem` and `0.75rem 1rem`) rather than a hardcoded `height: 44px`. When a visually impaired student increases their browser root font size from `16px` to `24px`, a fixed `height: 44px` button clips or overflows two-line button labels, whereas `rem` padding expands proportionally around the text while preserving touch-target ergonomics across `375px`, `768px`, and `1280px` viewports (`evidence/20-responsive-three-widths.png`).

## 3. Route-Specific `<head>` Metadata Audit (`/` and `/tracks`)
* **Route 1 (`/` — `evidence/16-head-route-one.png`):** Defines `<title>Tekrise Academy Ibadan | Student & Cohort 04 Admissions Portal</title>`, a targeted meta description, and `og:title` / `og:description` / `og:locale` (`en_NG`) tags so links shared in Nigerian WhatsApp cohort groups preview accurately.
* **Route 2 (`/tracks` — `evidence/17-head-route-two.png`):** Overrides route metadata via Next.js `Metadata` export with `<title>Cohort 04 Curriculum & Tracks | Tekrise Academy Ibadan</title>` and curriculum-specific OpenGraph tags so deep links to the syllabus page never display generic root titles.
