# Task 5: Sessions, Authorisation, Password Reset & Query Performance (task-05-auth-and-indexing)

## 1. What We Built & Proved in Task 5
In the final stage of the **Tekrise Academy Student & Admissions Portal** assessment, we engineered stateful post-authentication security, role and ownership access controls, and B-Tree query optimization:
1. **Stateful Server Sessions & Cookie Hardening (src/lib/session.ts & docs/sessions.md):** Issued 32-byte CSPRNG session tokens via HttpOnly; SameSite=Lax; Path=/ cookies (01-session-cookie-devtools.png) while storing only their SHA-256 digests (tokenHash) in PostgreSQL (02-session-row-db.png), plus constant-time dummy Argon2id verification on unknown login emails.
2. **Server-Side Logout & Replay Rejection (/api/auth/logout):** Deleted the backing Session row in PostgreSQL on logout and proved that replaying the captured cookie via curl immediately fails with HTTP 401 Unauthorized (03-logout-replayed-cookie-rejected.txt).
3. **Full Password Reset & Atomic Session Purge (/api/auth/reset/confirm & docs/password-reset.md):** Implemented anti-enumeration reset initiation and an atomic prisma.$transaction that updates Student.passwordHash and deletes all active Session rows for that student across all devices (04-sessions-before-reset.txt & 05-sessions-after-reset.txt).
4. **Authentication (401) vs. Authorisation (403) (/api/student/receipts, /api/admin/cohort-audit & docs/authorisation.md):** Enforced resource ownership checks blocking cross-student IDOR attacks (403 Forbidden) and role checks blocking STUDENT accounts from REGISTRAR_ADMIN endpoints (06-unauthenticated-401.txt & 07-wrong-user-or-role-403.txt).
5. **PostgreSQL EXPLAIN ANALYZE on 30,000 Rows (docs/indexing.md):** Seeded 30,000 rows into TuitionPaymentAttempt, measured an unindexed Seq Scan at **2.545 ms** (08-explain-before-index.txt), added B-Tree index TuitionPaymentAttempt_studentEmail_idx, and measured an Index Scan at **0.043 ms** (09-explain-after-index.txt)—a **59.2x speedup**.

---

## 2. Directory Map (docs/ & evidence/)
- **Documentation (docs/):**
  - [docs/sessions.md](./docs/sessions.md) — Stateful sessions vs. JWTs, SHA-256 token hashing, and cookie security flags.
  - [docs/password-reset.md](./docs/password-reset.md) — Two-phase recovery flow and why password reset must purge all active sessions.
  - [docs/authorisation.md](./docs/authorisation.md) — 401 vs. 403 semantics, IDOR ownership guards, and server-side RBAC.
  - [docs/indexing.md](./docs/indexing.md) — 30,000-row EXPLAIN (ANALYZE, BUFFERS) walkthrough (2.545 ms Seq Scan vs. 0.043 ms Index Scan) and index write-cost trade-offs.
  - [docs/defects.md](./docs/defects.md) — Three verified defects in the current Task 5 codebase with file and line numbers.
  - [docs/interview-answers.md](./docs/interview-answers.md) — Complete answers to all 20 Task 5 & cross-task synthesis questions.
- **Evidence (evidence/):** 01-session-cookie-devtools.png through 09-explain-after-index.txt.
