# Task 4: The Server Is the Source of Truth (task-04-server-security)

## Overview
Rebuilt the backend of the Tekrise Academy Student & Admissions Portal into a hardened server architecture:
* **6-Table PostgreSQL Schema:** Student, Session, TuitionPayment, TuitionPaymentAttempt, SyllabusChunk, VerificationCode (docs/schema.md).
* **Deliberate Migrations:** Captured initial migration, required column failure, 3-step backfill, and P2022 drift recovery (docs/migrations.md).
* **Argon2id Hashing:** Configured m=64MB, t=3, benchmarked against SHA-256 (docs/hashing.md).
* **Zod Boundary Validation & Normalisation:** Enforced all 8 rules on the server, blocking direct curl attacks (docs/validation-placement.md).
* **Rate Limiting & HIBP Breach Checks:** Tested IP rotation bypass and k-anonymity SHA-1 prefix screening (docs/rate-limiting.md, docs/breach-check.md).
* **CSPRNG Email Verification:** 8-minute expiry, background job timing, rejections for expired/wrong/reused codes, and branded HTML email (docs/verification-design.md, docs/email-copy.md).
