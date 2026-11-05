# Task 5 Step 4: Authentication (401) vs. Authorisation (403) — Ownership & Role Enforcement (`authorisation.md`)

Accompanies evidence files:
- `evidence/06-unauthenticated-401.txt` (Missing or tampered `tekrise_session` cookie rejected with `HTTP 401 Unauthorized`)
- `evidence/07-wrong-user-or-role-403.txt` (Cross-student IDOR ownership violation and `STUDENT` -> `REGISTRAR_ADMIN` role violation rejected with `HTTP 403 Forbidden`)

---

## 1. The Architectural Difference Between Authentication (`401`) and Authorisation (`403`)

- **Authentication (`HTTP 401 Unauthorized` — really "Unauthenticated"):** Answers the question *"Who are you?"* In `src/lib/session.ts` (`getAuthenticatedStudent`), the server extracts `tekrise_session` from the incoming `Cookie` header, hashes it with `SHA-256`, and looks up `Session.tokenHash` in PostgreSQL. If the cookie is missing, tampered with, revoked via logout/reset, or past `expiresAt`, the server does not know who the caller is and halts with `401` (`evidence/06-unauthenticated-401.txt`).
- **Authorisation (`HTTP 403 Forbidden`):** Answers the question *"Now that we know who you are, are you permitted to touch this specific resource or action?"* When a request returns `403`, authentication succeeded—the server knows the caller is `adeleke.o@tekrise.ng`—but the caller failed either an **ownership check** or a **role check** (`evidence/07-wrong-user-or-role-403.txt`). Re-logging in with the same account will not fix a `403`.

---

## 2. Horizontal Authorisation: Stopping Insecure Direct Object Reference (IDOR) on Tuition Receipts

In `src/app/api/student/receipts/route.ts`, a student queries their tuition payment ledger via `GET /api/student/receipts?studentId=<id>`.

- **The Vulnerability If Only Authentication Were Checked:** If the route handler only checked `if (!authContext) return 401` and then ran `prisma.tuitionPayment.findMany({ where: { studentId: req.query.studentId } })`, any logged-in student could pass another student's CUID (`?studentId=cm...`) and read their private financial records (Horizontal Privilege Escalation / IDOR).
- **Our Server Enforcement:** Before querying `TuitionPayment`, the server verifies resource ownership (`requestedStudentId !== authContext.student.id && authContext.student.role !== "REGISTRAR_ADMIN"`). As proven in `evidence/07-wrong-user-or-role-403.txt` (Test 1), when `adeleke.o@tekrise.ng` attempted to query `funmilayo.bakare@tekrise.ng`'s `studentId`, the server blocked the query with `HTTP 403 Forbidden`.

---

## 3. Vertical Authorisation: Role-Based Access Control (`STUDENT` vs. `REGISTRAR_ADMIN`)

In `src/app/api/admin/cohort-audit/route.ts`, bursary staff audit cohort-wide headcount and tuition totals.

- **Why Client-Side UI Hiding Is Not Authorisation:** Hiding an "Admin Audit" link in the React navigation bar for students provides zero protection because an attacker calls `GET /api/admin/cohort-audit` directly via `curl`.
- **Our Server Enforcement:** The server reads `authContext.student.role` directly from the authoritative PostgreSQL `Student` row joined via the session (never from a client-supplied header or request body parameter) and enforces `authContext.student.role === "REGISTRAR_ADMIN"`, rejecting ordinary student accounts with `HTTP 403 Forbidden` (`evidence/07-wrong-user-or-role-403.txt`, Test 2).