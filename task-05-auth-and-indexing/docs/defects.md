# Known Defects: Task 5 (Sessions, Authorisation & Query Indexing)

Below are three real, verified defects in our current Task 5 implementation, identified by exact file and line number alongside their concrete production cost.

---

## Defect 1: No Background Cleanup or Cap on Concurrent Active Sessions Per Student in public."Session"
- **File & Line Reference:** src/lib/session.ts, Lines 20-35 (createServerSession) and Lines 74-77 (lazy single-row deletion on expired access).
- **Technical Description:** createServerSession() inserts a new row into public."Session" on every successful login without capping the maximum number of concurrent sessions per studentId (e.g., max 5 active devices) and without any scheduled cron job purging rows whose expiresAt timestamp has passed. Expired sessions are only deleted lazily if a client explicitly sends that expired cookie again (Line 75).
- **Production Cost:** Over a 16-week cohort, thousands of abandoned sessions from cleared browser cookies, private-browsing tabs, or automated scripts accumulate permanently in public."Session", bloating the Session_tokenHash_key and Session_studentId_idx B-Tree indexes and degrading authentication lookup performance on every protected API request.

---

## Defect 2: Password Reset Confirmation Endpoint (/api/auth/reset/confirm) Lacks Rate Limiting and Brute-Force Lockout on the 6-Digit Recovery Code
- **File & Line Reference:** src/app/api/auth/reset/confirm/route.ts, Lines 21-75 (POST handler).
- **Technical Description:** While Phase 1 (POST /api/auth/reset) enforces a rate limit of 3 requests per 15 minutes, Phase 2 (POST /api/auth/reset/confirm)—where the 6-digit recovery code is actually verified—does not call checkRateLimit() and does not increment a failed-attempt counter on the VerificationCode row to burn the code after 5 wrong guesses.
- **Production Cost:** Once an attacker triggers a password reset for a target student (e.g., adeleke.o@tekrise.ng), they have an 8-minute window to fire thousands of concurrent requests at POST /api/auth/reset/confirm testing all 900,000 possible 6-digit codes (100000-999999), allowing full account takeover and password replacement without access to the victim's email inbox.

---

## Defect 3: Missing Composite Index on TuitionPayment(studentId, paidAt DESC) Forces In-Memory Sort on Receipt History Queries
- **File & Line Reference:** src/app/api/student/receipts/route.ts, Lines 39-42 (prisma.tuitionPayment.findMany({ where: { studentId }, orderBy: { paidAt: "desc" } })) and prisma/schema.prisma, Lines 68-69 (@@index([studentId]) and @@index([paidAt])).
- **Technical Description:** In prisma/schema.prisma, TuitionPayment defines two separate single-column indexes (@@index([studentId]) and @@index([paidAt])), rather than a composite index @@index([studentId, paidAt(sort: Desc)]).
- **Production Cost:** When /api/student/receipts filters by studentId and orders by paidAt DESC, PostgreSQL can use TuitionPayment_studentId_idx to locate the student's rows, but must perform an additional in-memory Sort node operation rather than reading the rows in pre-sorted reverse chronological order directly from a single B-Tree index scan.
