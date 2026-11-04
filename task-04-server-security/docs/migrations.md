# Task 4 Step 3: Deliberate Database Migrations & Schema Drift Analysis (`migrations.md`)

Accompanies evidence files:
* `evidence/03-initial-migration.txt` (Initial Task 4 multi-table migration)
* `evidence/04-required-column-failure.txt` (Failure when adding a required `NOT NULL` column to a populated `Student` table)
* `evidence/05-required-column-three-steps.txt` (Three-step zero-downtime resolution: add optional $\rightarrow$ backfill $\rightarrow$ make required)
* `evidence/06-drift-error.txt` (Client-vs-database drift error `P2022` and recovery)

---

## 1. What Went Out of Step in the Drift Error (`06-drift-error.txt`)
When we added `bursaryAuditNote String?` to `prisma/schema.prisma` and ran `npx prisma generate` without running `npx prisma migrate dev`, two distinct artifacts went out of step: the **generated TypeScript/Node.js Prisma Client inside `node_modules/.prisma/client`** and the **actual physical PostgreSQL table structure (`public."Student"`) on disk**. Running `npx prisma generate` only reads `schema.prisma` and rewrites the application's local query builder and TypeScript definitions, causing Prisma Client to include `SELECT "Student"."bursaryAuditNote"` in every `student.findFirst()` query. Because no SQL `ALTER TABLE "Student" ADD COLUMN "bursaryAuditNote" TEXT` migration had ever been executed against PostgreSQL, the database rejected the query at runtime with `PrismaClientKnownRequestError P2022: The column Student.bursaryAuditNote does not exist in the current database` until we ran `npx prisma migrate dev` to reconcile the physical database with the generated client.

---

## 2. Why Migrations Are Forward-Only and Why You Never Edit a Migration That Has Already Run
A database migration history (`prisma/migrations/`) is an immutable, append-only ledger of structural state transitions tracked in PostgreSQL's `_prisma_migrations` table alongside a cryptographic SHA-256 checksum of each `.sql` file.
1. **Why Forward-Only:** In production, rolling back a schema change by running a destructive "down" script risks permanently dropping columns or rows written since deployment. Forward-only migrations treat every correction or reversal as a brand-new, sequentially numbered forward migration (`2026..._revert_column`), ensuring that every environment moves deterministically along the exact same linear timeline.
2. **Why You Never Edit a Migration That Has Already Run:** Once a migration has been applied to a shared database or committed to `main`, PostgreSQL stores its checksum in `_prisma_migrations` and never executes that file again on existing environments. If a developer edits an old `.sql` file after it has run, existing databases ignore the edit (triggering a checksum mismatch / drift error), while fresh environments run the modified SQL—resulting in two production or staging databases with silently incompatible schemas.

---

## 3. Why We Keep the AI Agent Out of Running Migrations (And the Honest Cost of Manual Execution)

### Why We Run Migrations by Hand (`Propose-and-Stop` Rule):
Unlike stateless application code (which can be reverted in 2 seconds with `git revert`), database migrations mutate stateful storage where a single wrong command carries irreversible consequences. Left unsupervised, an AI coding agent encountering a migration conflict (such as our `04-required-column-failure.txt` error) frequently reaches for `npx prisma migrate reset --force` or `npx prisma db push --accept-data-loss`, wiping the entire database to make its command succeed. By prohibiting the agent from executing migrations and requiring it to propose changes to `prisma/schema.prisma` and stop, a human engineer inspects the generated SQL and executes the 3-step backfill pattern (`05-required-column-three-steps.txt`) safely.

### The Honest Cost of Running Migrations by Hand:
Enforcing manual migration execution is not free:
1. **Slower Iteration Velocity:** Every schema tweak requires context-switching out of the agent workflow to manually review SQL, run `npx prisma migrate dev`, and verify backfills.
2. **Human Forgetfulness (The Exact Cause of Drift):** As demonstrated in `06-drift-error.txt`, developers or teammates pulling a branch frequently edit `schema.prisma` (or pull updated code) and forget to run the manual migration step before starting the server, leading to runtime `P2022` crashes in local development or staging if CI/CD deployment checklists are not strictly automated.