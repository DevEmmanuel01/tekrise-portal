# Task 3 Step 6: Form Accessibility Audit & macOS VoiceOver Transcripts (`accessibility-audit.md`)

## 1. The Four Real Accessibility Defects Found & Fixed

During our manual keyboard and macOS VoiceOver (`Cmd + F5`) audit of the Tekrise Academy Cohort 04 Registration form (`src/app/auth/page.tsx`), we identified and fixed four real accessibility failures:

1. **Defect 1 — Disabled Submit Button Removed From Keyboard Tab Order With No Programmatic Explanation:**
   * **Before:** Using the native HTML `disabled` attribute on `<button type="submit" disabled>` removed the submit button completely from the keyboard `Tab` sequence (`tabIndex = -1`), and wrapping it in `<div onClick={handleDisabledAreaClick}>` only fired for mouse clicks. A screen-reader user pressing `Tab` after the Terms checkbox skipped straight over the submit button with zero explanation of why they could not submit.
   * **Fix:** Replaced native `disabled` with `aria-disabled={!isCurrentFormValid || isSubmitting}` and attached `aria-describedby="submit-disabled-reason"`. Keyboard users can now `Tab` directly onto the button, hear its dimmed state and programmatic reason, and press `Enter`/`Space` to trigger the explanatory alert.
2. **Defect 2 — Disabled Button Explanation Trigger Was Mouse-Only (`<div onClick>`):**
   * **Before:** The explanation message (`"Action blocked: You must read and accept the Tekrise Academy Cohort 04 Terms..."`) was attached to a non-focusable `<div>` wrapper's `onClick` handler, making it unreachable via keyboard `Enter` or `Space`.
   * **Fix:** Moved the guard into the focusable `<button>`'s `onClick` handler (calling `e.preventDefault()` and `handleDisabledAreaClick()` when `aria-disabled` is true) and wrapped the output banner in `role="alert"` so VoiceOver announces the missing requirement immediately upon keyboard activation.
3. **Defect 3 — Terms & NDPA Privacy Checkbox Lacked `aria-required="true"` and Explicit Label Association:**
   * **Before:** The `<input type="checkbox">` lacked `aria-required="true"`, so VoiceOver announced it as an optional toggle (`"tick box, unticked"`) without warning the student that registration is blocked until accepted.
   * **Fix:** Added `required` and `aria-required="true"` on `#acceptedTerms` and wrapped the full legal text inside `<label htmlFor="acceptedTerms">`.
4. **Defect 4 — Password Requirement Counter & Field Errors Were Not Linked via `aria-describedby` / `aria-invalid`:**
   * **Before:** Inline error paragraphs and the dynamic 10-character password counter (`#password-requirements`) rendered visually below the inputs without `aria-describedby` ID bindings or `aria-invalid="true"`. Users with deuteranopia/protanopia (red-green colour blindness) or screen readers could not programmatically associate the error with the input.
   * **Fix:** Linked every field to its error container via `aria-describedby="<field>-error"`, bound `aria-invalid` dynamically, added `role="alert"` to inline errors, and prepended a high-contrast caution icon (`⚠` / `&#9888;`) alongside `--color-error` so error state is never communicated by colour alone.

---

## 2. Field-by-Field Manual Audit Across the Five Required Criteria

| Form Element | 1. Colour Independence | 2. Keyboard Reachability | 3. Focus Visibility | 4. Screen Reader Announcement | 5. Error Association |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth Mode Switcher (`1. Cohort Registration`, `2. Student Login`, `3. Reset Access`)** | Active tab uses bold weight + solid fill + `aria-pressed="true"` (not hue alone). | Fully reachable via `Tab` and activated via `Enter` / `Space`. | Clear `2px solid var(--color-primary)` focus ring on keyboard navigation. | Announces label, `"toggle button"`, and `"selected"` / `"not selected"` via `aria-pressed`. | N/A (Navigation control). |
| **Field 1: Legal Full Name (`#fullName`)** | Invalid state pairs `--color-error` border with `⚠` caution glyph and explicit text. | Reachable in sequential `Tab` order (`tabIndex=0`). | Visible focus outline using `--color-primary` token. | Announces label, `"required, edit text"`, and `aria-invalid="true"` when invalid. | Linked via `aria-describedby="fullName-error"` + `role="alert"`. |
| **Field 2: Student Email Address (`#email`)** | Invalid state pairs `--color-error` border with `⚠` caution glyph and explicit text. | Reachable in sequential `Tab` order. | Visible focus outline using `--color-primary` token. | Announces label, `"required, edit text"`, and real-time alert on signup vs. on-submit alert on login. | Linked via `aria-describedby="email-error"` + `role="alert"`. |
| **Field 3: Admission Matriculation PIN (`#matricPin`)** | Invalid state pairs `--color-error` border with `⚠` caution glyph and explicit text. | Reachable in sequential `Tab` order; `inputMode="numeric"` invokes numeric keypad on mobile. | Visible focus outline using `--color-primary` token. | Announces label, `"required, edit text"`, without leaking 5-digit PIN length in placeholder. | Linked via `aria-describedby="matricPin-error"` + `role="alert"`. |
| **Field 4: Enrolled Cohort 04 Track (`#track`)** | Native `<select>` dropdown uses chevron indicator and text labels. | Reachable via `Tab`; options navigable via `Up`/`Down` arrow keys. | Visible focus outline on `<select>`. | Announces `"Enrolled Cohort 04 Track, Full-Stack Software Engineering (16 Weeks), pop-up button"`. | Pre-populated with valid default track. |
| **Field 5: Portal Password (`#password`) & `Show/Hide` Toggle** | Error state uses `⚠` glyph + text; character counter updates textually (`X/10`). | Both password input and `Show`/`Hide` `<button type="button">` are reachable via `Tab`. | Visible focus ring on both input and toggle button. | Input announces `"Portal Password, required, secure edit text"`; toggle announces `"Show password text, button"`. | Linked via `aria-describedby="password-requirements password-error"`. |
| **Field 6: Terms & NDPA Privacy Checkbox (`#acceptedTerms`)** | Checked state uses checkmark glyph inside box (not colour alone). | Reachable via `Tab`; toggled via `Space` key. | Visible focus ring around checkbox input. | Announces full policy text + `"required, tick box, unticked"`. | Clicking submit while unticked triggers `role="alert"` banner. |
| **Submit Button (`Complete Cohort 04 Registration`)** | Dimmed state pairs reduced opacity with visible text caption below button. | Reachable in `Tab` order via `aria-disabled="true"` (never skipped). | Visible focus ring even when `aria-disabled="true"`. | Announces button text, `"dimmed, button"`, and reads `#submit-disabled-reason`. | Pressing `Enter`/`Space` while dimmed announces `#disabledClickNotice` (`role="alert"`). |

---

## 3. Verbatim Screen Reader Transcripts (macOS VoiceOver on Chrome, Tested Field-by-Field)

### A. Transcript BEFORE Accessibility Fixes (Broken State)
*Tested on macOS using VoiceOver (`Cmd + F5`) navigating via `Tab` key before fixing the 4 defects:*

1. **Tab 1 (`#fullName`):** *"Legal Full Name First Name and Surname, edit text."* (Left blank and pressed `Tab` — red border appeared visually, but VoiceOver did **not** announce `invalid data` because `aria-invalid` and `aria-describedby` were missing).
2. **Tab 2 (`#email`):** *"Student Email Address, edit text."* (Typed `adeleke@tekrise` — visual red text appeared below, unlinked to the input focus description).
3. **Tab 3 (`#matricPin`):** *"Admission Matriculation PIN, edit text."*
4. **Tab 4 (`#track`):** *"Enrolled Cohort 04 Track, Full-Stack Software Engineering 16 Weeks, pop-up button."*
5. **Tab 5 (`#password`):** *"Portal Password, secure edit text."* (Typed `abc` — the `3/10 minimum characters required` hint appeared visually below, but VoiceOver never read it because `#password-requirements` was not linked via `aria-describedby`).
6. **Tab 6 (`Show/Hide` button):** *"Show, button."* (Ambiguous label—did not specify *what* was being shown).
7. **Tab 7 (`#acceptedTerms`):** *"I agree to the Tekrise Academy Cohort 04 Tuition Installment Policy... tick box, unticked."* (Did **not** announce `"required"` because `aria-required="true"` was missing).
8. **Tab 8 (Pressing `Tab` after checkbox):** Focus jumped straight out of the form back to the browser address bar! Because `<button disabled>` was removed from the tab order, VoiceOver announced **nothing** for the submit button—leaving a blind user completely stranded with no way to know a submit button existed or why the form could not be submitted.

---

### B. Transcript AFTER Accessibility Fixes (Current Production State)
*Tested on macOS using VoiceOver (`Cmd + F5`) navigating via `Tab` key after applying all 4 fixes:*

1. **Tab 1 (`#fullName`):** *"Legal Full Name First Name and Surname, required, edit text, e.g. Oluwaseun Adeleke."*
   * *(Action: Pressed `Tab` without typing)* $\rightarrow$ VoiceOver immediately announced: *"Alert: Student full name cannot be left blank."*
   * *(Shift+Tab back onto `#fullName`)* $\rightarrow$ *"Legal Full Name First Name and Surname, required, invalid data, edit text. Student full name cannot be left blank."*
2. **Tab 2 (`#email`):** *"Student Email Address, required, edit text, e.g. o.adeleke@tekrise.ng."*
   * *(Action: Typed `adeleke@tekrise`)* $\rightarrow$ VoiceOver announced: *"Alert: Enter a properly formatted email address containing an '@' symbol and domain (e.g. student@tekrise.ng)."*
3. **Tab 3 (`#matricPin`):** *"Admission Matriculation PIN, required, edit text, Enter PIN from your tuition receipt."*
   * *(Action: Typed `123` and pressed `Tab`)* $\rightarrow$ VoiceOver announced: *"Alert: Invalid Admission Matriculation PIN format. Please check your Ibadan Bursary receipt."*
4. **Tab 4 (`#track`):** *"Enrolled Cohort 04 Track, Full-Stack Software Engineering 16 Weeks, pop-up button."*
5. **Tab 5 (`#password`):** *"Portal Password, required, secure edit text, Enter your portal password."*
   * *(Action: Typed `pass123`)* $\rightarrow$ VoiceOver read the linked description: *"Password length: 7/10 minimum characters required."*
6. **Tab 6 (`Show/Hide` button):** *"Show password text, button."*
7. **Tab 7 (`#acceptedTerms`):** *"I agree to the Tekrise Academy Cohort 04 Tuition Installment Policy, the mandatory 80% attendance certification rule, and the Nigeria Data Protection Act (NDPA 2023) Student Privacy Notice, required, tick box, unticked."*
8. **Tab 8 (Submit Button — now reachable in Tab order!):** *"Complete Cohort 04 Registration, dimmed, button. Button unlocks automatically once all required fields and Terms acceptance are valid."*
   * *(Action: Pressed `Enter` on the dimmed button while `#acceptedTerms` was unticked)* $\rightarrow$ VoiceOver immediately announced: *"Alert: Action blocked: You must read and accept the Tekrise Academy Cohort 04 Terms & Conditions and 80% Attendance Policy before submitting."*