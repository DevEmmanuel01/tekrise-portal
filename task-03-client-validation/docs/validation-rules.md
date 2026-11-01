# Task 3 Step 3: Derived Client-Side Validation Rules & False-Positive Trade-Offs (`validation-rules.md`)

Every validation rule below was derived specifically for **Tekrise Academy (Ring Road Campus, Ibadan)** and audited for the legitimate applicants it inadvertently blocks.

---

## Rule 1: Legal Full Name (`fullName`) — Minimum 4 to 70 Characters, Letters/Hyphens/Apostrophes Only, Minimum Two Words (2+ Chars Each)
* **What the rule is:** After trimming leading/trailing spaces and collapsing multiple internal spaces, `fullName` must be 4–70 characters, match `/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/`, and contain at least two space-separated words where each word is at least 2 characters long (`src/app/auth/page.tsx`, Lines 58–68).
* **What goes wrong without it:** Automated bots, LLM form-fillers, and impatient applicants enter single-character placeholders (`"a"`, `"test"`), digits (`"Student123"`), or a single first name (`"Tunde"`). Because Tekrise Academy issues verifiable graduation certificates tied to bank transfer receipts, single-token or numeric names cause bursary reconciliation failures and unprintable graduation certificates.
* **What legitimate user it wrongly blocks (The Trade-Off):**
  1. **Mononymous applicants:** Legitimate students who legally bear only a single name (mononym) on their government ID or passport cannot pass the two-word check.
  2. **Applicants with single-letter initials or short cultural surnames:** A legitimate student whose legal name on their bank account is `"J. Adeyemi"` or `"Olu A"` (where one token is 1 character) or who has a numeric generational suffix (`"Adedapo III"`) is blocked by this rule. We accept this trade-off on the self-serve form to stop single-letter bot spam, providing manual registrar override at the Ibadan campus desk for mononymous students.

---

## Rule 2: Student Email Address (`email`) — Real-Time Format Check on Signup, On-Submit Check on Login (`/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/`)
* **What the rule is:** Must contain a non-whitespace local part, an `@` symbol, a domain name, and an alphabetic top-level domain (TLD) of at least 2 characters (`src/app/auth/page.tsx`, Lines 56, 71–83). Enforced in **real time** during Cohort Registration (`?mode=signup`, `evidence/07-email-realtime-signup.png`), and enforced **only on submit** during Student Login (`?mode=login`, `evidence/08-email-on-submit-login.png`).
* **What goes wrong without it:** Applicants mistype addresses without a domain extension (e.g., `student@gmail` or `student@tekrise`) during registration, causing the cryptographic verification code email in Task 4 to bounce permanently and locking the student out of cohort onboarding.
* **What legitimate user it wrongly blocks (The Trade-Off):**
  1. **Internationalised Domain Names (IDN / Punycode TLDs):** A legitimate user whose corporate or university email ends in an IDN TLD containing digits/dashes in its ASCII Punycode representation (`xn--...`) or a quoted local part containing spaces (`"ojo adeleke"@domain.com`, which is technically valid under RFC 5321) is blocked by our simplified regex.
* **Why Real-Time Belongs on Signup vs. On-Submit on Login:** On registration, we are onboarding a student record for the first time, so early real-time feedback prevents them from completing a six-field form with a broken primary identifier. On login, the student already owns an account; flashing a red format error on their first keystroke before they finish typing their email creates hostile, unnecessary friction.
* **Why Checking Email "Existence" on the Form Is Pointless (Two Sentences):** Checking whether an email address actually exists on a remote mail server during form entry is pointless because proving a mailbox exists does not prove the person currently typing into the browser is the rightful owner of that mailbox. Ownership can only ever be established asynchronously by sending a secret verification code to that address and requiring the user to return it, and any synchronous "existence" check against our own database would immediately expose a user-enumeration vulnerability to attackers.

---

## Rule 3: Admission Matriculation PIN (`matricPin`) — Exact 5-Digit Numeric String (`10000`–`99999`)
* **What the rule is:** Must consist strictly of 5 ASCII digits (`/^\d{5}$/`) with a numeric value $\ge 10000$, collected via `<input type="text" inputMode="numeric">` and converted with `Number(matricPin.trim())` (`src/app/auth/page.tsx`, Lines 86–93, 140).
* **What goes wrong without it:** Unpaid visitors or automated scripts submit empty or random strings to claim Cohort 04 physical classroom seats in Ibadan without having paid the mandatory 60% first tuition installment (`₦150,000`–`₦210,000`) to the bursary.
* **What legitimate user it wrongly blocks (The Trade-Off):**
  1. **Scholarship & Corporate-Sponsored Fellows:** Legitimate students admitted under the Oyo State Tech Scholarship or corporate sponsorship receive an alphanumeric waiver reference (e.g., `OYO-042`) from their sponsor rather than a 5-digit bursary cash receipt PIN, and are blocked by the digits-only check until the bursary issues them a numeric shadow PIN.

---

## Rule 4: Portal Password (`password`) — Minimum 10 Non-Whitespace Characters (Length Over Complexity)
* **What the rule is:** On registration, the trimmed password must be at least 10 characters long (`password.trim().length >= 10`), with no mandatory symbol/uppercase composition rules (`src/app/auth/page.tsx`, Lines 96–103).
* **What goes wrong without it:** Students choose weak, easily brute-forced 4-to-6 character passwords (such as `123456` or `ibadan`), exposing their tuition payment receipts and personal records to credential-stuffing and dictionary attacks.
* **What legitimate user it wrongly blocks (The Trade-Off):**
  1. **Users with 8-character hardware-token or legacy enterprise passwords:** A student whose personal password manager or organisation policy defaults to generating random 8-character high-entropy strings (e.g., `K9#mP2$q`) is blocked from using it despite high character variety, and users who intentionally use leading/trailing spaces as part of a multi-word passphrase have those boundary spaces stripped by `.trim()`.

---

## Rule 5: Enrolled Cohort 04 Track (`track`) & Mandatory Terms Acceptance (`acceptedTerms`)
* **What the rule is:** `track` must match one of the three active Cohort 04 tracks (`Full-Stack Software Engineering`, `Product Design (UI/UX)`, `Data Analytics & Insights`), and `acceptedTerms` must be `true`.
* **What goes wrong without it:** Students could register without an assigned curriculum track or without legally binding NDPA 2023 privacy and 80% attendance policy consent.
* **What legitimate user it wrongly blocks (The Trade-Off):**
  1. **Dual-Track / Custom Corporate Trainees:** A student who paid to audit two tracks simultaneously or a corporate trainee seeking a custom 4-week module cannot express that selection and is forced into a single standard cohort track.