# Task 4 Step 10: Cryptographic Email Verification, Expiry Derivation & Background Dispatch (`verification-design.md`)

Accompanies evidence files:
* `evidence/16-smtp-failure.txt` (SMTP rejection when authenticating with an ordinary password)
* `evidence/17-smtp-success.txt` (SMTP delivery success using an App/Transactional credential)
* `evidence/18-registration-timing-sync-vs-job.txt` (Blocking synchronous SMTP vs. background job latency)
* `evidence/19-verification-row.png` (Database row in `VerificationCode`)
* `evidence/20-expired-code-rejection.png`, `21-wrong-code-rejection.png`, `22-reused-code-rejection.png`

---

## 1. Why `crypto.randomInt(100000, 1000000)` Instead of `Math.random()`
We generate all 6-digit verification codes in `src/lib/verification.ts` using Node's `crypto.randomInt(100000, 1000000)` rather than `Math.random()`.
* **Why `Math.random()` Is Insecure:** In V8/Node.js, `Math.random()` is a deterministic pseudo-random number generator (`xorshift128+`) seeded from non-cryptographic state and optimized purely for speed. It is **not** cryptographically secure: if an attacker requests a few verification codes for their own account and observes the resulting 6-digit numbers, they can reconstruct the internal 128-bit state of `xorshift128+` using an SMT solver (like `z3`) and predict the exact 6-digit verification or password-reset code generated milliseconds later for another student or registrar administrator.
* **Why `crypto.randomInt()` Is Secure:** `crypto.randomInt` draws entropy directly from the operating system's Cryptographically Secure Pseudo-Random Number Generator (CSPRNG — `/dev/urandom` / `SecRandomCopyBytes` on macOS) and applies rejection sampling to eliminate modulo bias across the exact `[100000, 999999]` range ($900,000$ equiprobable outcomes).

---

## 2. Why Our Expiry Window Is 8 Minutes (Derived for Tekrise Academy Students — Not 2 Minutes)
Rather than copying a 2-minute expiry window from class, we derived an **8-minute (`480-second`) expiration window** (`VERIFICATION_EXPIRY_MINUTES = 8` in `src/lib/verification.ts`) based on the real physical and network environment of Tekrise Academy applicants in Ibadan:
1. **Why 2 Minutes Is Too Short for Our Users:** Many Cohort 04 applicants register on budget Android devices over congested 3G/4G mobile networks around Ring Road, Challenge, and UI (University of Ibadan), or register on a laptop while checking their email on a separate mobile handset. Additionally, Nigerian university and corporate mail relays occasionally grey-list or delay inbound transactional emails by 60–90 seconds. Under a rigid 2-minute timer, a student who experiences a 75-second mail delivery delay and switches apps to copy the code arrives back at `/auth?mode=verify` to find their code already expired (`410 Gone`).
2. **Why 8 Minutes Balances Usability and Security:** An 8-minute window comfortably absorbs 60–120 seconds of SMTP queuing plus mobile app switching without frustrating honest students. At the same time, combined with our endpoint rate limiter (`5 attempts per 10 minutes`), an attacker can test at most 5 guesses out of $900,000$ possible 6-digit codes ($\frac{5}{900,000} = 0.00055\%$ success probability) before the 8-minute code expires.

---

## 3. Why Ordinary Passwords Fail on SMTP (`16`) and Why App Passwords Succeed (`17`)
As captured in `evidence/16-smtp-failure.txt`, passing a standard Gmail/Google Workspace login password to `smtp.gmail.com:587` fails immediately with `535-5.7.8 Username and Password not accepted`. Email providers block ordinary account passwords on raw SMTP submission because:
1. **No Interactive MFA/2FA Support:** The SMTP protocol handshake (`AUTH PLAIN` / `AUTH LOGIN`) cannot render a browser prompt, push notification, or hardware key challenge for Two-Factor Authentication.
2. **Blast-Radius & Revocation Control:** If an application stores the user's master password in `.env` and that file leaks, an attacker gains full access to the entire Google account (Drive, Inbox, Admin console). A 16-character **App Password** or dedicated transactional SMTP API credential (`evidence/17-smtp-success.txt`) bypasses interactive 2FA strictly for SMTP dispatch, has high random entropy, and can be revoked in one click without changing the master account password.

---

## 4. Synchronous Blocking Send vs. Background Job Dispatch (`18-registration-timing-sync-vs-job.txt`)
When we benchmarked `POST /api/enquiries?dispatch=sync` against `POST /api/enquiries?dispatch=async-job` (`evidence/18-registration-timing-sync-vs-job.txt`):
* **Synchronous Dispatch (`dispatch=sync`):** The HTTP handler blocked for an extra **`420–450+ ms`** waiting for the email transport to complete before returning `HTTP 201`. In production over real international TLS handshakes (`STARTTLS` + `AUTH` + `DATA`), synchronous SMTP easily adds **`1,200 ms to 3,500 ms`** to registration—and if the external mail provider times out for 10 seconds, the user's HTTP request fails even though their `Student` row was already written to PostgreSQL!
* **Background Job Dispatch (`dispatch=async-job`):** By persisting the `Student` and `VerificationCode` rows in PostgreSQL first and handing the email dispatch off to an asynchronous background job (`setImmediate` / queue worker), the HTTP route returns `201 Created` in **`~95–210 ms`** (over 70% faster), decoupling portal registration availability from third-party mail server latency.