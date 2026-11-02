# Task 3: The Form, Attacked From Both Sides (`task-03-client-validation`)

## 1. What This Task Was & What We Built
In Task 3, we refactored the **Tekrise Academy Student & Admissions Portal** authentication flow into a single-page architecture (`/auth?mode=signup|login|reset`), designed a 6-field registration form grounded in information design and **Nigeria Data Protection Act (NDPA 2023)** compliance, implemented four categories of accessible client-side validation, audited the form with **macOS VoiceOver**, and then proved why client-side validation is not a security control by bypassing our own form entirely via `curl`.

---

## 2. Key Engineering & Design Decisions
* **Single-Page Auth Collapse (`src/app/auth/page.tsx`):** Collapsed `/signup`, `/login`, and `/reset-password` (5 total routes down to 3, `evidence/01` & `02`) into `/auth` controlled by `?mode=...` query parameters. Switching views takes `< 1ms` and triggers zero server round-trips (`evidence/04-form-switch-logs.txt`), while preserving typed email state across tabs.
* **Real-Time vs. On-Submit Email Validation:** Enforced real-time email format checks on Registration (`?mode=signup`, `evidence/07`) where initial onboarding friction prevents typos, but deferred email format checks to **on-submit only** on Login (`?mode=login`, `evidence/08`) so returning students are not nagged on their first keystroke.
* **Numeric Text Input (`inputMode="numeric"`) & Sensitive Shape Protection:** Replaced `<input type="number">` (`evidence/09-number-input-annoying`) with `<input type="text" inputMode="numeric">` converted via `Number()` (`evidence/10-text-input-working`) for our **5-digit Admission Matriculation PIN** (`matricPin`) to eliminate default `0` / `0400` cursor corruption, and removed the `"5-digit PIN"` placeholder hint (`docs/enumeration.md`) so attackers cannot deduce the 90,000-integer keyspace.
* **Colour-Independent Errors & Screen-Reader Accessibility (`docs/accessibility-audit.md`):** Paired every `--color-error` border with a `⚠` (`&#9888;`) caution icon, linked errors via `aria-describedby` and `role="alert"`, and replaced the native `disabled` submit attribute with `aria-disabled="true"` (`evidence/14-button-disabled-version.png`) so the submit button stays in the VoiceOver `Tab` order and explains why submission is blocked when activated.

---

## 3. What We Got Wrong & Fixed During This Task
1. **Native `disabled` Button Dropping Out of VoiceOver Tab Order:** In our initial build (`evidence/11-screenreader-before`), using `disabled={!isCurrentFormValid}` caused macOS VoiceOver to jump straight from the Terms checkbox to the browser address bar, leaving blind users stranded. Switching to `aria-disabled="true"` with a keyboard-accessible `onClick` guard fixed this (`docs/accessibility-audit.md`).
2. **Unprotected Server Endpoint (`docs/client-side-is-not-security.md`):** Sending `{"fullName":"a","email":"a@b","track":"Bypassed-Via-Curl-Attack"}` directly to `POST /api/enquiries` via `curl` bypassed all 8 client-side rules and returned `201 Created` (`evidence/16-direct-request-command-and-response.txt`), proving that every rule must be re-enforced on the server in Task 4.

---

## 4. Directory Map (`docs/` & `evidence/`)
* **Documentation (`docs/`):**
  * [`docs/spa-rationale.md`](./docs/spa-rationale.md) — SPA query-param trade-offs and when multi-page routes win.
  * [`docs/field-justification.md`](./docs/field-justification.md) — Three-question audit of every retained and removed field.
  * [`docs/validation-rules.md`](./docs/validation-rules.md) — Derived rules, what breaks without them, and which legitimate users they block.
  * [`docs/terms-note.md`](./docs/terms-note.md) — Provenance of our NDPA 2023 & Cohort 04 Tuition Installment consent text.
  * [`docs/enumeration.md`](./docs/enumeration.md) — Why `<input type="number">` fails for PINs and why we hide the 5-digit PIN shape.
  * [`docs/accessibility-audit.md`](./docs/accessibility-audit.md) — 5-criteria field audit, 4 fixed defects, and verbatim VoiceOver transcripts.
  * [`docs/client-side-is-not-security.md`](./docs/client-side-is-not-security.md) — Analysis of our direct `curl` endpoint bypass.
  * [`docs/rollback.md`](./docs/rollback.md) — Deterministic Git rollback by commit SHA vs. LLM hallucination.
  * [`docs/defects.md`](./docs/defects.md) — Three real defects in the current Task 3 build with file/line references.
  * [`docs/interview-answers.md`](./docs/interview-answers.md) — Answers to all 14 Task 3 defence questions + user enumeration.
* **Evidence (`evidence/`):** `01-page-count-before.txt` through `17-commit-list-and-rollback.txt`.