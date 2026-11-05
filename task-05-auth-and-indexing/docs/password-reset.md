# Task 5 Step 3: Password Reset Flow, Anti-Enumeration & Atomic Session Invalidation (`password-reset.md`)

Accompanies evidence files:
* `evidence/03-logout-replayed-cookie-rejected.txt` (Server-side session destruction on logout)
* `evidence/04-sessions-before-reset.txt` (Active multi-device sessions in `public."Session"` prior to password reset)
* `evidence/05-sessions-after-reset.txt` (Zero remaining sessions and `401 Unauthorized` on old cookies after password reset)

---

## 1. End-to-End Password Reset Architecture (`/api/auth/reset` & `/api/auth/reset/confirm`)
Our password recovery architecture is split into two hardened phases:
1. **Phase 1 — Initiation (`POST /api/auth/reset`):**
   * Enforces a strict sliding-window rate limit (`3 attempts per 15 minutes per IP`) and parses the email via `ResetBoundarySchema` (`.trim().toLowerCase()`).
   * **Anti-Enumeration Response:** Whether the email exists in `public."Student"` or not, the endpoint returns the exact same `HTTP 200 OK` payload (`"If an active student record matches <email>, a 6-digit recovery code (valid for 8 minutes) has been dispatched."`) so an attacker cannot probe which email addresses are enrolled at Tekrise Academy.
   * When the student exists, the server generates a 6-digit CSPRNG recovery code via `crypto.randomInt(100000, 1000000)` with an 8-minute `expiresAt` window in `VerificationCode`.
2. **Phase 2 — Confirmation & Atomic Session Purge (`POST /api/auth/reset/confirm`):**
   * Validates the 6-digit recovery code (rejecting wrong, expired, or already-used codes), checks the new candidate password against the **Have I Been Pwned k-anonymity API**, and hashes the new password with **Argon2id (`m=64MB, t=3`)**.
   * Executes an atomic PostgreSQL transaction (`prisma.$transaction`) that simultaneously marks `VerificationCode.usedAt = now()`, updates `Student.passwordHash`, and deletes every active `Session` row belonging to that student (`prisma.session.deleteMany({ where: { studentId: student.id } })`).

---

## 2. Why Password Reset Must Invalidate All Existing Sessions (`04` & `05`)
Why do users reset their password? Either they forgot it, or **they suspect their account or password has been compromised**.
If a student resets their password after noticing suspicious activity—or after logging in on an untrusted cybercafé desktop in Ibadan—and the server only updates `Student.passwordHash` without purging `public."Session"`, any attacker who already holds an active `tekrise_session` cookie stays logged in for the remainder of the 7-day session TTL (`getAuthenticatedStudent` checks `Session.tokenHash`, not `Student.passwordHash`!).
As demonstrated in `evidence/04-sessions-before-reset.txt` and `evidence/05-sessions-after-reset.txt`, our atomic `prisma.session.deleteMany({ where: { studentId: student.id } })` call reduced the student's active sessions from `2` (`MacBook-Pro-Ibadan-Lab` and `Android-Mobile-Chrome`) to `0`, causing an immediate `HTTP 401 Unauthorized` when the prior session cookie was replayed.
