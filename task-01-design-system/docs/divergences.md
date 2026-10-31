# Deliberate Divergences from Material Design 3 Defaults

We diverged from the documented Material Design 3 baseline in **three specific places** to serve Tekrise Academy's student and financial ledger context. For each divergence, we document the Material default, our chosen value, why we made the change, and the exact scenario where our choice would fail.

---

## Divergence 1: Display & Headline Font Weight (`600 SemiBold` instead of `400 Regular`)

* **Material 3 Baseline Default:** Display Large/Medium/Small and Headline Large/Medium/Small all default to **`400` (Regular)** weight.
* **What We Chose:** **`600` (SemiBold)** across all six Display and Headline styles.
* **Why We Diverged:** Material 3's `400 Regular` display scale assumes large, airy consumer screens where thin strokes look refined. In Tekrise Academy's portal, headings anchor critical financial and academic states (e.g., *"₦180,000 Balance Due"*, *"Create Student Account"*). On mid-range Android screens viewed in bright Ibadan daylight or under glare, `400 Regular` headings in `Inter` lack visual mass and blend into `400 Regular` body text. Stepping up to `600 SemiBold` creates unmistakable scannable landmarks between page title, card header, and body copy without relying on colour alone.
* **Where Our Choice Would Be the Wrong One (Failure Scenario):**
  Our choice of `600 SemiBold` across all Display and Headline tiers would fail in a **multi-story news publication, academic journal repository, or dense analytics dashboard** where five or more Headline/Display elements sit on the viewport simultaneously with long 12-to-18-word titles. In that environment, rendering every headline at `600 SemiBold` creates severe visual fatigue ("everything is shouting, so nothing is emphasised") and increases line-wrap vertical bloat because SemiBold glyphs are 6–8% wider than Regular glyphs.

---

## Divergence 2: Negative Letter-Spacing on Display & Headline Roles (`-0.02em` to `-0.01em` instead of `0px` / `-0.25px`)

* **Material 3 Baseline Default:** Display Large uses `-0.25px` (`-0.004em`), while Display Medium, Display Small, and all three Headline sizes use **`0px` (`0em`)** tracking.
* **What We Chose:** **`-0.02em` (`-1.12px` at `56px`)** on Display Large/Medium, **`-0.015em`** on Display Small/Headline Large, and **`-0.01em`** on Headline Medium/Small.
* **Why We Diverged:** `Inter` was engineered primarily for `11px–16px` UI legibility, meaning its built-in side-bearings are generous. When scaled up to `28px–56px` at `0px` tracking, words drift apart horizontally and consume excessive horizontal width on `360px`-wide mobile viewports—forcing short 4-word titles onto three lines. Tightening tracking to `-0.01em` through `-0.02em` restores optical density and prevents awkward single-word orphans on mobile headers.
* **Where Our Choice Would Be the Wrong One (Failure Scenario):**
  This negative tracking would be the wrong choice in an **accessibility-first medical portal for older adults (65+), a dyslexia-accommodating literacy platform, or an interface rendered in reverse-contrast (bright white text on pure `#000000` black) on low-DPI OLED screens**. Under halation (where bright white pixels bleed into dark backgrounds) or for readers with crowding-sensitive dyslexia, `-0.02em` tracking causes adjacent vertical strokes (`rn` looking like `m`, or `il` merging) to fuse together, directly increasing reading error rates.

---

## Divergence 3: Enforcing a `1.4x` Line-Height Multiplier on Display Roles (instead of Material's `1.12x–1.22x` tight ratio) and `1.6x` on Body Roles (instead of `1.43x–1.5x`)

* **Material 3 Baseline Default:** Display Large (`57px` / `64px` line-height = **`1.12x`**) and Body Medium (`14px` / `20px` line-height = **`1.43x`**).
* **What We Chose:** A strict **`1.4x`** multiplier on Display/Headline (`56px` / `78px` line-height) and **`1.6x`** on Body Large/Medium (`16px` / `26px` and `14px` / `22px`).
* **Why We Diverged:** First, our curriculum rules enforce a disciplined `1.4x`, `1.5x`, or `1.6x` multiplier system. Second, in Nigerian educational portals where mixed English/Yoruba names with diacritics (e.g., *Ọláwálé*, *Adéyẹmí*) or currency symbols (`₦`) wrap across lines on narrow screens, a tight `1.12x` display line-height clips diacritical marks above capital letters and under-dots below baseline letters. Using `1.4x` on Display guarantees zero glyph collision, while `1.6x` on Body text gives comfortable vertical rhythm for reading multi-paragraph tuition terms.
* **Where Our Choice Would Be the Wrong One (Failure Scenario):**
  Using a `1.4x` line-height on Display Large (`78px` per line) fails in **compact above-the-fold mobile hero banners or dense financial ticker cards** where a 3-line display headline consumes `234px` of vertical screen height (nearly 40% of a small mobile viewport), pushing the primary call-to-action button below the fold. Similarly, `1.6x` on Body Medium fails inside **high-density enterprise data tables or IDE log viewers**, where it cuts the number of visible rows per screen by ~15% and forces excessive vertical scrolling.
