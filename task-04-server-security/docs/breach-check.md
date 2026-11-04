# Task 4 Step 9: Breached Password Screening via k-Anonymity (`breach-check.md`)

Accompanies evidence file: `evidence/15-breach-check-rejection.png` (Rejecting `"password123456"` with exact public breach count on registration).

---

## 1. How the k-Anonymity Prefix Check Keeps the Student's Password Private (`src/lib/breach-check.ts`)

Checking whether a student's password has appeared in real-world data breaches requires querying Troy Hunt's **Have I Been Pwned (HIBP) Pwned Passwords database** (which indexes over 900 million exposed passwords). However, transmitting a student's plaintext password—or even its full cryptographic hash—over the network to an external API would violate user privacy and turn the third-party service into a high-value interception target.

Our implementation (`src/lib/breach-check.ts`) preserves mathematical privacy using the **k-anonymity range model**:
1. **Local SHA-1 Hashing:** When a student submits a password on registration (e.g., `"password123456"`), our server computes its 40-character uppercase hexadecimal SHA-1 digest locally in Node.js memory:
   $$\text{SHA-1}(\text{"password123456"}) = \texttt{5CEC175B165E3D5E62C9E13CE848EF6FEAC81B58}$$
2. **5-Character Prefix Slicing:** We split the 40-character hex string into two parts:
   * **5-character Prefix:** `5CEC1` ($16^5 = 1,048,576$ possible prefixes across the entire universe of passwords).
   * **35-character Suffix:** `75B165E3D5E62C9E13CE848EF6FEAC81B58` (kept strictly inside our server's RAM).
3. **Range Query + Response Padding:** Our server sends `GET https://api.pwnedpasswords.com/range/5CEC1` with `Add-Padding: true`. HIBP returns a list of ~500 to 1,000 35-character suffixes that all begin with `5CEC1`, along with how many times each appeared in public breaches (e.g., `75B165E3D5E62C9E13CE848EF6FEAC81B58:182941`).
4. **Local Suffix Matching:** Our server scans those ~500 returned lines locally in memory. Because roughly 500+ completely different passwords share the exact same 5-character SHA-1 prefix (`5CEC1`), neither HIBP nor any network eavesdropper can determine which specific password the student typed ($k \ge 500$ anonymity set).

---

## 2. Why We Check on Registration and Password Change, But Not on Login

We enforce `checkPasswordBreached(password)` during **Cohort Registration (`POST /api/enquiries`)** and **Password Change/Reset**, where we want to prevent a student from binding their account to a known compromised credential (`evidence/15-breach-check-rejection.png`). We deliberately **do not** run the HIBP check on **Login (`POST /api/auth/login`)** for four engineering reasons:
1. **Login Latency & Availability Dependency:** Every login would incur an external HTTPS round-trip (`150–600 ms`) to `api.pwnedpasswords.com`, slowing down routine sign-ins and creating an external point of failure on the most frequent route.
2. **Locking Out Existing Users Without a Recovery Path:** If a student's previously safe password appears in a new third-party breach six months after they registered, blocking them at the Login endpoint simply locks them out of their portal without letting them sign in to change it (unless an entire forced-reset flow is triggered).
3. **Side-Channel Information Leak to Attackers:** If an attacker testing stolen credentials against `/api/auth/login` receives a `"This password was found in a breach"` response (or observes the extra 300ms HIBP network latency only when a password passes validation), it leaks metadata about our validation pipeline.
4. **Redundancy:** For any wrong password typed on login, checking if the wrong guess is in a breach is meaningless; Argon2id verification against `Student.passwordHash` is the only check that matters.

---

## 3. What Our Application Should Do If the External Breach Service Is Unreachable (`Fail-Open` vs. `Fail-Closed`)

In `src/lib/breach-check.ts` (Lines 31–60 and 82–92), we enforce a **3,500 ms `AbortController` timeout** and a **Fail-Open (Graceful Degradation)** policy if `api.pwnedpasswords.com` returns an HTTP `5xx` error or is unreachable due to upstream ISP/DNS outages in Ibadan:
* **Immediate Registration Behaviour (`Fail-Open`):** Rather than crashing the registration route (`500`) or blocking paying Tekrise Academy students from enrolling because a third-party API is down (`Fail-Closed`), our server still enforces our local 10-character minimum length rule and Argon2id hashing, allows registration to proceed (`apiReachable: false`), and logs a warning.
* **Production Follow-Up Mitigation:** When `apiReachable === false`, a production system can flag the student row (`breachCheckPending = true`) or check the password asynchronously on a background worker once connectivity is restored, prompting the student to rotate their password on next login only if a match is later confirmed.