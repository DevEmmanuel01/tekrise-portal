# Task 4 Interview Defence Answers (interview-answers.md)

1. **Why hashing > encryption for passwords:** Encryption is reversible with a key; hashing is one-way. Storing reversible encryption is dangerous because a KMS/server breach leaks plaintext passwords that cascade across user banking accounts.
2. **Why fast hash is wrong:** SHA-256 processes millions of hashes/sec on GPUs. Argon2id (64MB RAM, t=3) forces memory hardness, slowing offline cracking by ~189,000x.
3. **What a salt is:** A random 16-byte value mixed per password to prevent rainbow table precomputation and identical hash collisions.
4. **How HIBP k-Anonymity works:** We send only the first 5 SHA-1 hex chars of a password to HIBP and compare ~500 suffixes locally, keeping the password 100% private.
5. **Email vs Password normalisation:** Emails are lowercased to handle mobile keyboard capitals; passwords are only trimmed of copy-paste whitespace to preserve case-sensitive entropy.
6. **Validation placement:** Must run before DB queries or Argon2id to prevent Denial of Service resource exhaustion.
7. **ORM limitation:** ORMs prevent SQL string injection on standard methods, but raw queries, operator injection, and XSS still require Zod boundary validation.
8. **Migration vs Generate:** Migrations alter physical PostgreSQL tables on disk; generate rebuilds TypeScript types in node_modules without touching the DB.
9. **Adding NOT NULL to populated tables:** Requires the 3-step safe pattern: add optional -> backfill existing rows -> alter to NOT NULL.
10. **Why never edit run migrations:** Applied migrations record a SHA-256 checksum in _prisma_migrations; editing them causes checksum drift and environment divergence.
11. **crypto.randomInt vs Math.random:** Math.random uses predictable V8 xorshift128+; crypto.randomInt draws from kernel CSPRNG entropy.
12. **Sync vs Async email dispatch:** Synchronous SMTP blocks HTTP responses for 400-3500ms; background queues return 201 immediately in ~150ms.
13. **Separate payment attempts table:** Captures failed/abandoned USSD checkouts for conversion analytics and tax audits without cluttering revenue ledgers.
14. **Intentional email duplication:** Storing studentEmail on payment tables preserves point-in-time financial audit trails even if profile emails change or get anonymized.
15. **Timing arithmetic:** Argon2id takes ~85ms (~11 guesses/sec); SHA-256 takes ~0.00045ms (~2,222,222 guesses/sec).
16. **Rate limit defeat & fix:** IP-only rate limits are defeated by rotating X-Forwarded-For proxies; fix requires shared Redis stores and email-keyed counters.
17. **Expiry windows:** 30 seconds locks out legitimate users due to mobile carrier delays; 7 days allows brute-forcing the 900,000 keyspace.
18. **Wrong answer analysis (Client SHA-256 + Server static pepper):** Client hash becomes the new plaintext credential (pass-the-hash), and static pepper fails to prevent rainbow tables if env leaks.
19. **Wrong answer analysis (Prisma replaces validation):** TypeScript types vanish at runtime; Prisma parameterisation stops SQL syntax injection but happily stores unvalidated garbage data.
