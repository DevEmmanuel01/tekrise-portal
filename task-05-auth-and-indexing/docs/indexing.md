# Task 5 Step 5: PostgreSQL Query Plans, B-Tree Indexing & Write-Cost Trade-Offs (indexing.md)

Accompanies machine-specific evidence files:
- evidence/08-explain-before-index.txt (Sequential Scan across 30,000 rows prior to indexing)
- evidence/09-explain-after-index.txt (B-Tree Index Scan across 30,000 rows after indexing)

---

## 1. Benchmark Setup & The Query Under Test

To evaluate realistic production query performance on the Tekrise Academy bursary checkout audit table, we seeded **30,000 rows** into `public."TuitionPaymentAttempt"` and ran `ANALYZE "TuitionPaymentAttempt"` so the PostgreSQL query planner had accurate histogram and cardinality statistics. We then measured the exact bursary support query used to look up a payer's checkout attempts by their point-in-time email snapshot:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, "studentId", "studentEmail", "amountKobo", "providerReference", status, "attemptedAt"
FROM "TuitionPaymentAttempt"
WHERE "studentEmail" = 'bursary.target.15000@tekrise.ng';
```

---

## 2. Before Indexing: Why PostgreSQL Performed a Sequential Scan (08-explain-before-index.txt)

```text
=== TASK 5 STEP 5A: POSTGRESQL EXPLAIN (ANALYZE, BUFFERS) BEFORE INDEXING ===
Timestamp  : 2026-11-05T22:58:36.730Z
Table      : public."TuitionPaymentAttempt" (30,000 rows)
Query      : SELECT id, "studentId", "studentEmail", "amountKobo", "providerReference", status, "attemptedAt"
             FROM "TuitionPaymentAttempt"
             WHERE "studentEmail" = 'bursary.target.15000@tekrise.ng';

--- POSTGRESQL QUERY PLAN (UNINDEXED -> SEQUENTIAL SCAN) ---
Seq Scan on "TuitionPaymentAttempt"  (cost=0.00..1172.00 rows=1 width=132) (actual time=1.218..2.534 rows=1.00 loops=1)
  Filter: ("studentEmail" = 'bursary.target.15000@tekrise.ng'::text)
  Rows Removed by Filter: 29999
  Buffers: shared hit=797
Planning:
  Buffers: shared hit=9
Planning Time: 0.060 ms
Execution Time: 2.545 ms
```

### What Happened Inside PostgreSQL (Before Indexing):
- **Selected Plan Node:** `Seq Scan on "TuitionPaymentAttempt"` ($O(N)$ linear table scan).
- **Rows Examined vs. Returned:** PostgreSQL read all **30,000 rows** from the table heap, evaluated the filter `("studentEmail" = 'bursary.target.15000@tekrise.ng')` on every row, discarded **29,999 non-matching rows** (`Rows Removed by Filter: 29999`), and returned **1 row**.
- **Measured Execution Time:** **`2.545 ms`**.
- **Why:** Without an index on `studentEmail`, PostgreSQL has no sorted lookup directory mapping email strings to physical 8 KB heap page offsets (TIDs). It has no choice but to read every heap page sequentially from disk/shared buffers.

---

## 3. After Indexing: How the B-Tree Index Changed the Plan (09-explain-after-index.txt)

After executing `CREATE INDEX "TuitionPaymentAttempt_studentEmail_idx" ON "TuitionPaymentAttempt"("studentEmail");` and updating `prisma/schema.prisma` with `@@index([studentEmail])`:

```text
=== TASK 5 STEP 5B: POSTGRESQL EXPLAIN (ANALYZE, BUFFERS) AFTER INDEXING ===
Timestamp  : 2026-11-05T22:58:37.593Z
Table      : public."TuitionPaymentAttempt" (30,000 rows)
Index Added: CREATE INDEX "TuitionPaymentAttempt_studentEmail_idx" ON "TuitionPaymentAttempt"("studentEmail");
Query      : SELECT id, "studentId", "studentEmail", "amountKobo", "providerReference", status, "attemptedAt"
             FROM "TuitionPaymentAttempt"
             WHERE "studentEmail" = 'bursary.target.15000@tekrise.ng';

--- POSTGRESQL QUERY PLAN (INDEXED -> B-TREE INDEX SCAN) ---
Index Scan using "TuitionPaymentAttempt_studentEmail_idx" on "TuitionPaymentAttempt"  (cost=0.41..8.43 rows=1 width=132) (actual time=0.031..0.031 rows=1.00 loops=1)
  Index Cond: ("studentEmail" = 'bursary.target.15000@tekrise.ng'::text)
  Index Searches: 1
  Buffers: shared hit=1 read=3
Planning:
  Buffers: shared hit=33 read=1
Planning Time: 0.164 ms
Execution Time: 0.043 ms
```

### What Happened Inside PostgreSQL (After Indexing):
- **Selected Plan Node:** `Index Scan using "TuitionPaymentAttempt_studentEmail_idx" on "TuitionPaymentAttempt"` ($O(\log N)$ tree traversal).
- **Execution Time Drop:** Dropped from **`2.545 ms`** down to **`0.043 ms`** — a **`59.2x` speedup**!
- **Buffer Efficiency:** Instead of reading hundreds of 8 KB heap blocks across the entire 30,000-row table, PostgreSQL traversed only 3 B-Tree index pages (root $\rightarrow$ internal branch $\rightarrow$ leaf node) to locate the exact Tuple ID (`ctid`) and fetched **1 single heap page** (`Buffers: shared hit=4`).

---

## 4. Why We Do Not Index Every Column on Every Table (The Cost of Indexes)

If a B-Tree index makes `SELECT` queries `59.2x` faster, why not add `@@index` to every single column in `prisma/schema.prisma`?
1. **Write Amplification on Every INSERT, UPDATE, and DELETE:** Every time a student initiates a checkout (`INSERT INTO "TuitionPaymentAttempt"`), PostgreSQL must not only append the row to the heap table, but also traverse and insert a new entry into **every single B-Tree index** defined on that table, occasionally splitting full 8 KB B-Tree leaf pages and generating extra Write-Ahead Log (WAL) disk I/O.
2. **RAM & Shared Buffer Cache Pollution:** Indexes consume physical disk space and compete for PostgreSQL's `shared_buffers` RAM cache. Unused indexes evict hot table pages and active indexes from memory.
3. **Low-Cardinality Columns Never Use B-Tree Indexes Anyway:** Indexing a boolean column like `Student.isVerified` (where 95% of rows are `true`) or a 3-value column where a query matches 40% of the table is useless because the PostgreSQL planner will rightly ignore the B-Tree index and run a `Seq Scan` anyway (random page I/O across 40% of a table is slower than a sequential sweep).
