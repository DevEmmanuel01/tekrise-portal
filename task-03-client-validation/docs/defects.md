# Known Defects: Task 3 (Client-Side Validation & Form Safeguards)

In accordance with the assessment engineering standards, below are three real, verified defects in our current Task 3 codebase (`src/app/auth/page.tsx` and `src/app/api/enquiries/route.ts`), referenced by file and line number alongside their production cost.

---

## Defect 1: Unauthenticated, Unvalidated Backend Endpoint (`POST /api/enquiries`) Accepts Invalid & Omitted Fields
* **File & Line Reference:** `src/app/api/enquiries/route.ts`, Lines 6–18 (and demonstrated via `src/app/auth/page.tsx`, Lines 132–145).
* **Technical Description:** While `src/app/auth/page.tsx` enforces 8 strict client-side rules (two-word full name, 4–70 char length, character whitelist, email regex, 5-digit `matricPin` >= 10000, 10-char password, allowed track enum, and `acceptedTerms`), `src/app/api/enquiries/route.ts` only checks `if (!fullName || !email || !track)` before calling `prisma.studentEnquiry.create()`. Furthermore, `matricPin`, `password`, and `acceptedTerms` are not yet persisted or validated in the Prisma schema.
* **Production Cost:** As proven in `evidence/16-direct-request-command-and-response.txt`, any bot or attacker using `curl` can bypass the browser entirely and flood our PostgreSQL database with 1-character names (`"a"`), malformed emails (`"a@b"`), and unpaid registrations without a valid Ibadan bursary PIN—corrupting cohort admissions rosters and exhausting database storage. (To be closed in Task 4).

---

## Defect 2: Shallow History State Updates (`window.history.pushState`) Bypass Next.js Router State on Browser Back/Forward Navigation
* **File & Line Reference:** `src/app/auth/page.tsx`, Lines 22–28 (`switchMode` function using `window.history.pushState(null, "", "/auth?mode=" + newMode)`).
* **Technical Description:** To achieve zero server requests during tab switching (`evidence/04-form-switch-logs.txt`), `switchMode` updates local React state (`setMode(newMode)`) and mutates the browser URL bar directly via `window.history.pushState` without registering a `popstate` event listener on `window`.
* **Production Cost:** If a student clicks from `?mode=signup` to `?mode=login` and then clicks the browser's native **Back** button, the URL address bar reverts to `/auth?mode=signup`, but the React component stays stuck rendering the **Login** form because `useSearchParams()` does not always re-trigger on raw `pushState` back-navigation without a `popstate` listener.

---

## Defect 3: Simplified Email Regex & Synchronous Password Trimming Edge Cases
* **File & Line Reference:** `src/app/auth/page.tsx`, Line 56 (`const emailRegex = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/`) and Line 99 (`password.trim().length < 10`).
* **Technical Description:** First, `emailRegex` validates every keystroke on signup (`Lines 78–80`) without debouncing, and rejects valid RFC 5321 quoted local parts or numeric Punycode TLDs (`xn--...`). Second, while `password.trim().length < 10` checks the trimmed length on signup (`Line 99`), `handleSubmit` (`Lines 117–128`) does not yet pass the trimmed password string to a backend hashing endpoint.
* **Production Cost:** Legitimate corporate or international applicants using Punycode domains are blocked from registering, and until Task 4 normalises and hashes passwords server-side, a student who copies and pastes a password with a trailing space on Login will experience authentication mismatches.