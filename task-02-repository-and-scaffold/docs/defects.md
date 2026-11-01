# Known Defects: Task 2 (Repository & Application Scaffold)

## Defect 1: New `PrismaClient()` Instantiation Risk Across Hot-Reloads Without Global Singleton Guard
* **File & Location:** `src/app/api/enquiries/route.ts` (Top-level Prisma client initialisation).
* **Description:** If `new PrismaClient()` is instantiated directly inside a route module without attaching the instance to `globalThis` in development, every Next.js Fast Refresh / HMR recompilation spawns a fresh connection pool (`5` connections per instance) against local PostgreSQL.
* **Production / Dev Cost:** After ~20 file saves during active development, PostgreSQL hits `FATAL: sorry, too many clients already`, causing subsequent `POST /api/enquiries` requests to fail until the Node process is restarted.

## Defect 2: Absence of Server-Side Rate Limiting & Duplicate Email Constraint on `POST /api/enquiries`
* **File & Location:** `prisma/schema.prisma` (`model AdmissionEnquiry`, Line 14) and `src/app/api/enquiries/route.ts` (`POST` handler).
* **Description:** The `email` field in `AdmissionEnquiry` does not currently enforce a `@unique` composite constraint per cohort track (`@@unique([email, track])`), and `/api/enquiries` lacks IP rate limiting.
* **Production Cost:** If a student on an unstable 3G connection in Ibadan double-taps the submit button (or a bot floods the endpoint), duplicate admission enquiry rows with different CUIDs are inserted for the same email and track, polluting the admissions coordinator's call queue (to be hardened in Task 3 and Task 4).

## Defect 3: Synchronous Full-Table Count Absence on Client Confirmation Banner
* **File & Location:** `src/app/page.tsx` (Lines 28–46, `handleSubmit` state resolution).
* **Description:** While `POST /api/enquiries` returns `201 Created` with the newly persisted row (`id`, `fullName`, `email`, `track`, `createdAt`), the home page does not perform a server-side `GET` hydration on initial load to display existing submissions if the user refreshes the browser tab (`F5`).
* **Production Cost:** Refreshing `http://localhost:3000` resets React `useState(null)` back to the blank form, which can cause an applicant who refreshed their browser to re-submit their enquiry unnecessarily.
