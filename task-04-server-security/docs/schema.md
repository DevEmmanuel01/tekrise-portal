# Task 4 Step 1: Database Schema Design & Financial Audit Trail (`schema.md`)

Accompanies hand-drawn schema diagram: `evidence/01-schema-drawing.jpg` and initial database inspection: `evidence/02-database-state-before.png`.

---

## 1. Table-by-Table Column Specification, Nullability & Relationships

### Table 1: `Student` (The People Who Use the System)
* **Relationships:**
  * `1 : N` (One-to-Many) with `Session` (`Student.id` $\rightarrow$ `Session.studentId`, `onDelete: Cascade`).
  * `1 : N` (One-to-Many) with `TuitionPayment` (`Student.id` $\rightarrow$ `TuitionPayment.studentId`, `onDelete: Restrict`).
  * `1 : N` (One-to-Many) with `TuitionPaymentAttempt` (`Student.id` $\rightarrow$ `TuitionPaymentAttempt.studentId`, `onDelete: Restrict`).
  * `1 : N` (One-to-Many) with `VerificationCode` (`Student.id` $\rightarrow$ `VerificationCode.studentId`, `onDelete: Cascade`).

| Column | Type | Nullable? | Purpose |
| :--- | :--- | :--- | :--- |
| `id` | `String (CUID)` | No (`PK`) | Primary key identifier for the student record. |
| `fullName` | `String` | No | Verified legal first name and surname for graduation certificates. |
| `email` | `String` | No (`Unique`) | Lowercased, trimmed primary login and verification identifier. |
| `matricPin` | `Int` | No (`Unique`) | 5-digit Ibadan bursary tuition deposit PIN (`10000`–`99999`). |
| `passwordHash` | `String` | No | Adaptive Argon2id/bcrypt password digest (never plaintext or SHA-256). |
| `track` | `String` | No | Enrolled Cohort 04 academic track. |
| `role` | `String` | No | Authorization role (`"STUDENT"` or `"REGISTRAR_ADMIN"`). |
| `isVerified` | `Boolean` | No | True only after cryptographic 6-digit email verification completes. |
| `acceptedTermsAt` | `DateTime` | No | Timestamp of affirmative NDPA 2023 & 80% attendance policy consent. |
| `createdAt` / `updatedAt` | `DateTime` | No | Audit creation and modification timestamps. |

---

### Table 2: `Session` (Server-Side Active Sessions)
* **Relationships:** `N : 1` (Many-to-One) pointing to `Student.id`.

| Column | Type | Nullable? | Purpose |
| :--- | :--- | :--- | :--- |
| `id` | `String (CUID)` | No (`PK`) | Unique server-side session row ID. |
| `studentId` | `String` | No (`FK`) | References `Student.id`. |
| `tokenHash` | `String` | No (`Unique`) | Hashed session token matching the browser cookie. |
| `ipAddress` | `String?` | **Yes (Empty allowed)** | Client IP at sign-in; nullable if reverse-proxy header is absent. |
| `userAgent` | `String?` | **Yes (Empty allowed)** | Browser user-agent string; nullable for headless/CLI requests. |
| `expiresAt` | `DateTime` | No | Hard session expiration timestamp. |
| `createdAt` | `DateTime` | No | Session issuance timestamp. |

---

### Table 3: `TuitionPayment` (Confirmed Money Table)
* **Relationships:** `N : 1` (Many-to-One) pointing to `Student.id` (`onDelete: Restrict` so financial ledgers can never be wiped by accidental student deletion).

| Column | Type | Nullable? | Purpose |
| :--- | :--- | :--- | :--- |
| `id` | `String (CUID)` | No (`PK`) | Internal ledger entry ID. |
| `studentId` | `String` | No (`FK`) | References `Student.id`. |
| `studentEmail` | `String` | No | Point-in-time snapshot of student's email at payment time. |
| `cohortCode` | `String` | No | Cohort identifier (`"COHORT-04"`). |
| `amountKobo` | `Int` | No | Payment amount in Nigerian Kobo (`15000000` = `₦150,000.00`). |
| `installmentPhase` | `String` | No | `"FIRST_60_PERCENT"` or `"SECOND_40_PERCENT"`. |
| `paystackReference` | `String` | No (`Unique`) | Immutable gateway settlement reference. |
| `paidAt` | `DateTime` | No | Confirmed settlement timestamp. |

---

### Table 4: `TuitionPaymentAttempt` (Money-Attempts Table)
* **Relationships:** `N : 1` (Many-to-One) pointing to `Student.id` (`onDelete: Restrict`).

| Column | Type | Nullable? | Purpose |
| :--- | :--- | :--- | :--- |
| `id` | `String (CUID)` | No (`PK`) | Unique attempt log ID. |
| `studentId` | `String` | No (`FK`) | References `Student.id`. |
| `studentEmail` | `String` | No | Point-in-time snapshot of student email during checkout attempt. |
| `amountKobo` | `Int` | No | Attempted payment amount in Kobo. |
| `providerReference` | `String` | No (`Unique`) | Gateway attempt reference generated before redirect. |
| `channel` | `String` | No | Payment rail (`"USSD"`, `"BANK_TRANSFER"`, `"CARD"`). |
| `status` | `String` | No | `"INITIATED"`, `"FAILED"`, `"ABANDONED"`, `"NETWORK_DROP"`, `"SUCCEEDED"`. |
| `failureReason` | `String?` | **Yes (Empty allowed)** | Gateway error message; empty when status is `"INITIATED"` or `"SUCCEEDED"`. |
| `ipAddress` | `String?` | **Yes (Empty allowed)** | Originating IP address for fraud/dispute investigation. |
| `attemptedAt` | `DateTime` | No | Timestamp when the payment attempt began. |

---

### Table 5: `SyllabusChunk` (Retrieval / RAG Knowledge Chunks)
* **Relationships:** Standalone knowledge base table queried by `track` and `documentTitle`.

| Column | Type | Nullable? | Purpose |
| :--- | :--- | :--- | :--- |
| `id` | `String (CUID)` | No (`PK`) | Unique chunk ID. |
| `track` | `String` | No | Academic track this syllabus policy applies to. |
| `documentTitle` | `String` | No | Source handbook or syllabus document name. |
| `chunkIndex` | `Int` | No | Sequential ordering index (`0, 1, 2...`) within the source document. |
| `content` | `String` | No | Raw text passage used for RAG context injection. |
| `tokenCount` | `Int` | No | Token length of the chunk for context-window budgeting. |
| `embeddingJson` | `String?` | **Yes (Empty allowed)** | Vector float array; nullable prior to embedding worker execution. |
| `updatedAt` | `DateTime` | No | Last chunk re-indexing timestamp. |

---

### Table 6: `VerificationCode` (Cryptographic 6-Digit Email OTPs)
* **Relationships:** `N : 1` (Many-to-One) pointing to `Student.id` (`onDelete: Cascade`).

| Column | Type | Nullable? | Purpose |
| :--- | :--- | :--- | :--- |
| `id` | `String (CUID)` | No (`PK`) | Unique OTP row ID. |
| `studentId` | `String` | No (`FK`) | References `Student.id`. |
| `code` | `String` | No | 6-digit `crypto.randomInt` verification code. |
| `expiresAt` | `DateTime` | No | Expiration timestamp (8 minutes after creation). |
| `usedAt` | `DateTime?` | **Yes (Empty allowed)** | Null while unused; populated with timestamp upon first valid use. |
| `createdAt` | `DateTime` | No | Code generation timestamp. |

---

## 2. Every Index, Why That Column, and What It Costs on Writes

1. **`Student(email)` (`@unique` B-Tree Index) & `Student(matricPin)` (`@unique` B-Tree Index):**
   * *Why:* Every login, registration duplicate check, and password reset queries `WHERE email = $1` or `WHERE matricPin = $1`. Without an index, PostgreSQL performs a sequential table scan ($O(N)$).
   * *Write Cost:* On every `INSERT` or `UPDATE` to `Student`, PostgreSQL must traverse and rebalance two additional B-Tree indexes and verify uniqueness constraints, adding ~0.3–0.8ms of write overhead and extra WAL (Write-Ahead Log) disk I/O.
2. **`Student(track)` (`@@index([track])`):**
   * *Why:* Accelerates cohort roster filtering by track (`Full-Stack`, `Product Design`, `Data Analytics`).
   * *Write Cost:* Adds a B-Tree pointer insertion on every new student registration.
3. **`Session(tokenHash)` (`@unique`), `Session(studentId)`, and `Session(expiresAt)`:**
   * *Why:* `tokenHash` is queried on every authenticated request; `studentId` is queried on password reset to revoke all sessions for a user; `expiresAt` is queried by cleanup jobs purging expired sessions.
   * *Write Cost:* Session creation (`login`) and deletion (`logout`) must update three indexes per session row, slightly increasing write amplification on the most frequently mutated table.
4. **`TuitionPayment(studentId)`, `TuitionPayment(paidAt)`, and `TuitionPayment(paystackReference)` (`@unique`):**
   * *Why:* Supports instant student receipt lookup (`studentId`), quarterly FIRS tax reporting by date range (`paidAt`), and idempotent webhook deduplication (`paystackReference`).
   * *Write Cost:* Every confirmed tuition payment updates three B-Tree structures, which is an acceptable cost because tuition payments are low-frequency, high-value writes (2 installments per student per cohort).
5. **`TuitionPaymentAttempt(studentId, attemptedAt)` (Composite Index) and `TuitionPaymentAttempt(status)`:**
   * *Why:* The composite index orders a student's checkout history chronologically without an in-memory sort, while `status` allows bursary staff to filter `"NETWORK_DROP"` or `"FAILED"` USSD attempts across Ibadan networks.
   * *Write Cost:* Every checkout attempt write updates two indexes.
6. **`VerificationCode(studentId, code)` (Composite Index):**
   * *Why:* Allows instant lookup when a student submits their 6-digit verification code (`WHERE studentId = $1 AND code = $2`).
   * *Write Cost:* Minimal write overhead on OTP generation (`INSERT`) and verification (`UPDATE usedAt`).

---

## 3. Intentional Data Duplication (`studentEmail` on Payment Tables) & Why We Accepted It
We deliberately store the student's email address twice: once on `Student.email` (the mutable current profile email) and again as `studentEmail` on both `TuitionPayment` and `TuitionPaymentAttempt`.

**Why we accepted this denormalisation:**
1. **Point-in-Time Financial Audit Immutability:** If a student registers with `tunde.old@gmail.com`, pays their `₦210,000` first installment, and three months later updates their profile email to `tunde.new@tekrise.ng` (or exercises their NDPA right to erasure after graduating, which anonymises `Student.email`), the financial ledger (`TuitionPayment.studentEmail`) must still preserve the exact email address printed on the original Paystack receipt at the moment money moved.
2. **Zero-Join Tax & Reconciliation Queries:** Bursary reconciliation exports can query `TuitionPayment` directly without joining `Student`.

---

## 4. Why `TuitionPaymentAttempt` Is Separate From `TuitionPayment` (And the 14-Month Tax Audit Scenario)

### Two Reasons We Built `TuitionPaymentAttempt` Separately:
1. **Conversion Drop-Off Diagnostics:** In Ibadan, students frequently experience USSD timeouts or bank transfer delays on mobile networks. Recording every `"INITIATED"`, `"ABANDONED"`, and `"NETWORK_DROP"` attempt in `TuitionPaymentAttempt` tells Tekrise Academy exactly which payment channel (`USSD` vs. `CARD` vs. `BANK_TRANSFER`) is losing students, without polluting the clean accounting ledger in `TuitionPayment`.
2. **Litigation, Regulatory Disputes & Tax Compliance:** Financial audit trails must prove not only what succeeded, but also every declined, reversed, or timed-out transaction attempt.

### Accounting for a Specific Transaction to the Tax Authority (FIRS / Oyo State IRS) 14 Months Later:
If the Federal Inland Revenue Service (FIRS) or Oyo State Internal Revenue Service audits Tekrise Academy and asks us to account for a specific disputed `₦180,000` (`18000000` Kobo) transaction from fourteen months ago—for example, a bank transfer where a student or bank claims funds were debited, or an auditor questions why an initiated invoice was never remitted as taxable revenue—we query **both** `TuitionPaymentAttempt` and `TuitionPayment` using the `providerReference` / `paystackReference` and timestamp window (`attemptedAt`). If the transaction settled, `TuitionPayment` provides the immutable `paystackReference`, exact `amountKobo`, `installmentPhase`, and `paidAt` timestamp matching our corporate bank statement, while `TuitionPaymentAttempt` shows the `"SUCCEEDED"` lifecycle. Conversely, if the student's bank transfer failed or timed out on the inter-bank switch (NIBSS) without ever settling into Tekrise Academy's account, `TuitionPaymentAttempt` provides the contemporaneous, timestamped record (`status: "FAILED"` or `"NETWORK_DROP"`, along with the gateway `failureReason` and `providerReference`) proving to the tax auditor that the `₦180,000` was a failed checkout attempt that never became realized revenue, rather than concealed income.