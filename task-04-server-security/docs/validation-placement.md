# Task 4 Steps 5, 6 & 7: Input Normalisation, Boundary Schema Validation & Request Lifecycle Placement (`validation-placement.md`)

Accompanies evidence files:
* `evidence/09-email-case-normalised.png` (Email lowercasing across registration, login, and reset)
* `evidence/10-password-trim-working.png` (Password whitespace trimming without lowercasing)
* `evidence/11-validation-timing.txt` (Request latency before and after boundary validation)
* `evidence/12-direct-request-before-and-after.txt` (Side-by-side Task 3 `201 Created` vs. Task 4 `400 Bad Request` on direct `curl` attack)

---

## 1. Step 5: Why We Trim Passwords Both Ends, But Never Lowercase Them (Two Sentences)
We trim leading and trailing whitespace from passwords (`.trim()`) because users copying a password from an email, notes app, or password manager frequently highlight an invisible trailing space by accident, and since `<input type="password">` masks every character as a dot (`•`), the user cannot see or diagnose why their login keeps failing. Conversely, we **never** lowercase passwords (unlike emails, which are case-insensitive routing identifiers under RFC 5321) because uppercase and lowercase letters inside a password are deliberate user choices that preserve passphrase memorability and double the alphabetic character-set entropy against brute-force attacks.

---

## 2. Step 6: Why We Chose Zod & Analysis of Our Request Timing Numbers (`11-validation-timing.txt`)

### Why We Selected `zod` (`src/lib/server-schemas.ts`):
We chose **Zod** as our server boundary validation library because it provides first-class TypeScript type inference (`z.infer<typeof RegistrationBoundarySchema>`), composable transformation pipelines (`.trim()`, `.toLowerCase()`, `.transform()`, `.refine()`), and declarative parse-don't-validate semantics that strip unrecognized prototype/JSON keys before returning a strongly typed output object.

### Analysis of Request Timing Before and After (`evidence/11-validation-timing.txt`):
* **Invalid Payload Rejection (`HTTP 400`):** When an attacker sends the invalid Task 3 `curl` payload, Zod rejects it in memory in **under `5–15 ms`** because execution halts immediately before touching Argon2id or PostgreSQL.
* **Valid Registration Request (`HTTP 201`):** A valid registration request increases by roughly **`80–250 ms`** compared to the unvalidated Task 3 endpoint. Why? Because:
  1. Pure in-memory Zod schema parsing takes **`< 1 ms`**.
  2. The additional latency on valid signups comes from **Argon2id memory-hard hashing (`m=64MB, t=3`)** and the uniqueness check (`SELECT ... WHERE email = $1 OR matricPin = $2`) added alongside boundary validation (and when synchronous SMTP / HIBP network calls are added in Steps 9–10, network I/O adds 500–2,000 ms unless offloaded).

---

## 3. Where Validation Sits in the Request Lifecycle (What Runs Before vs. What Must Never Run Before)

### Exact Request Lifecycle Order:
1. **What Runs BEFORE Schema Validation:**
   * **Edge / IP Rate Limiting & DDoS Protection:** Rejecting volumetric floods (`429 Too Many Requests`) before parsing bodies.
   * **HTTP Method, Content-Type & Body Size Limit Checks:** Rejecting oversized payloads (`413 Payload Too Large`) or malformed JSON (`request.json()`) before allocating object memory.
2. **THE BOUNDARY: Zod Schema Validation & Normalisation (`RegistrationBoundarySchema.safeParse`):**
   * Parses, trims, normalises, and validates every field. Replaces the raw incoming request body with `parsed.data`.
3. **What Must NEVER Run Before Schema Validation:**
   * **Database Queries (`prisma.*`):** Passing unvalidated types, null bytes, or 10MB strings into ORM/SQL queries risks injection, type coercion bugs, or database connection pool exhaustion.
   * **Password Hashing (`argon2.hash`) or Cryptographic Operations:** If Argon2id (`64 MB RAM per call`) runs *before* checking that the email, PIN, and password meet boundary rules, an attacker can send malformed requests or 1MB password strings to exhaust server RAM (Denial of Service).
   * **External Third-Party API Calls or Email Dispatch (HIBP / SMTP / Paystack):** Never burn external API quotas or send emails for malformed payloads.

---

## 4. Why Validating by Hand in the Route Handler (`if / else`) Is Worse Than a Schema
Writing imperative `if (!body.email || typeof body.email !== "string")` checks inside each route handler looks simpler at first, but fails in four critical ways:
1. **Fail-First vs. Aggregate Error Reporting:** Hand-written `if` statements usually return on the first error, forcing callers to submit multiple times, whereas `RegistrationBoundarySchema.safeParse()` evaluates all 8 rules in a single pass and returns a structured array of every violated field (`evidence/12-direct-request-before-and-after.txt`).
2. **Unstripped Extra Fields (Mass Assignment Risk):** Manual `if` checks leave the original `req.body` intact—so if a developer later passes `req.body` into an ORM `create({ data: req.body })`, an attacker who injected `"role": "REGISTRAR_ADMIN"` or `"isVerified": true` into the JSON body escalates privileges. A Zod schema constructs a brand-new object containing *only* declared fields.
3. **Inconsistent Normalisation Drift:** With manual `if` checks spread across `/enquiries`, `/login`, and `/reset`, a developer inevitably remembers `.toLowerCase()` on registration and forgets it on password reset. Centralising `emailBoundarySchema` inside `src/lib/server-schemas.ts` guarantees identical normalisation everywhere.
4. **Type Safety Gap:** Manual `if` checks do not narrow TypeScript types across complex regex/range refinements, whereas `parsed.data` is guaranteed by the compiler to match the validated contract.