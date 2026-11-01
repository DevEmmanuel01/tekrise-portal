# Task 2 Viva / Technical Interview Answers (All 15 Questions)

### 1. Why did we forbid the agent from building authentication, dashboards, or payment flows in Step 1?
Coding agents suffer from eager scope expansion: if given a business brief mentioning tuition installments and matriculation PINs without an explicit scope boundary, they generate 15+ half-wired routes full of mock data and unverified dependencies. Restricting Step 1 strictly to the Next.js + Prisma scaffold and a single home screen lets us verify the build pipeline, token imports, and database connectivity before layering feature complexity.

### 2. Why did we force the agent to summarise its plan and wait for approval before creating files?
Once an agent starts executing filesystem writes and `npm install` commands, reversing bad architectural choices (like choosing Pages Router instead of App Router, or installing Tailwind v4 over our CSS token pipeline) wastes time and leaves orphan config files. An approval gate catches misaligned assumptions while they are still cheap text.

### 3. In Step 2, the agent listed its assumptions. What assumption did it make without realising it?
Even when an agent claims it made "no assumptions," it implicitly assumes defaults whenever the prompt does not specify them—such as assuming `npm` over `pnpm`, assuming port `3000` is free, assuming PostgreSQL runs on default port `5432` with a `public` schema, and assuming Next.js App Router (`src/app/`) conventions.

### 4. Compare the two models/tools you used in Step 3. When is the slower deliberative agent worth the wait, and when is the faster model better?
A deliberative planner (Antigravity) is worth the 30-second context-reading latency whenever a task spans multiple files or must obey strict project-wide invariants (like reading `tokens.css`, `business-brief.md`, and `schema.prisma` simultaneously). A fast code generator (OpenCode / DeepSeek) is superior for narrow, self-contained functions (like writing a pure validation helper or a single API route block) where all inputs and outputs fit inside a 10-line prompt.

### 5. What happened in Step 5 when the project was nested inside a subfolder, and why do agents cause this mistake?
Agents frequently run `npx create-next-app@latest my-app` inside an already-created repository root (`tekrise-portal/`), creating `tekrise-portal/my-app/package.json`. When the developer runs `npm run dev` from the repository root, npm throws `ENOENT: no such file or directory, open '.../package.json'`. You fix it either by changing directory (`cd my-app`) or, properly for Git root cleanliness, moving all scaffolded files up into the repository root.

### 6. Walk through how you diagnosed and resolved the port 3000 conflict on your machine.
When starting the server threw `Error: listen EADDRINUSE: address already in use :::3000`, I ran `lsof -i :3000` in the terminal to inspect the active socket table on macOS. That revealed the exact Process ID (PID) holding TCP port `3000`. I terminated that orphaned process with `kill -9 <PID>`, verified `lsof -i :3000` returned empty, and restarted `npm run dev` cleanly on port `3000`.

### 7. When a route returned 404 in Step 5, what exact sequence of things did you check before prompting an agent?
First, I checked the URL path and port in the browser address bar against the terminal output. Second, I inspected `src/app/` in the filesystem to verify whether a folder matching the URL segment existed. Third, I checked whether the folder contained a lowercase `page.tsx` file (rather than `index.tsx`). Fourth, I verified that `page.tsx` exported a `default` React component.

### 8. What is the HTTP status code difference between `200 OK` and `201 Created`, and why did it matter in Step 6?
`200 OK` means a request succeeded in general (commonly a `GET` read or a no-content processing response), whereas `201 Created` specifically certifies that a `POST`/`PUT` request resulted in a new persistent resource being created on the server. In Step 6, watching for `201 Created` (alongside the new row CUID in Prisma Studio) proved our enquiry was physically written to PostgreSQL rather than swallowed by a dummy handler returning `200 OK`.

### 9. Explain the "False Success" failure mode you reproduced in Step 6. How does an AI-generated app trick both the user and the developer?
When we pointed `DATABASE_URL` to broken port `9999` (`evidence/13-write-failed-logs.txt`), Prisma threw `P1001: Can't reach database server`. However, because the catch block returned a fallback `200 OK` response (or the frontend updated state optimistically without checking for `201`), the browser rendered a green "Enquiry Submitted Successfully!" banner. Anyone watching only the UI believes the app works, while zero rows ever reach PostgreSQL.

### 10. Why must `.env` never be committed to Git, and what happens if you commit it and then delete it in a later commit?
`.env` contains live database credentials and API secrets. If you commit `.env` in Commit A and run `git rm .env` in Commit B, the secret is only removed from the current `HEAD` working tree—it remains permanently readable inside `.git/objects` history for anyone who clones the repo or runs `git log -p`. If a secret is ever committed, you must immediately rotate/revoke the credential and rewrite history (`git filter-repo`).

### 11. What did your cold README walkthrough (`docs/readme-test.md`) catch that you had overlooked when writing the README?
Writing instructions from memory caused us to skip the local PostgreSQL database creation and role permission step (`createdb tekrise_portal` and matching the Homebrew `postgresql@18` superuser in `.env`), which triggered `Error: P1010: User was denied access` during a cold test. We also caught the need to document clearing `.next` (`rm -rf .next`) if webpack chunks 404 after schema updates.

### 12. Explain the difference between the Working Directory, the Staging Area (Index), the Local Repository (`HEAD`), and the Remote Repository (`origin`).
The Working Directory is your live, untracked/modified files on disk. `git add` copies snapshots into the Staging Area (`.git/index`), which acts as a draft zone for your next commit. `git commit` permanently records the staged snapshot into your Local Repository (`.git/objects` pointed to by `HEAD`). Finally, `git push` uploads those local commits over the network to the Remote Repository (`origin` on GitHub).

### 13. Your first page load took `2033ms` and your reload took `72ms`. Where did the `2033ms` go? Separate what you measured from what you estimated.
From our terminal log (`Compiled / in 1751ms (551 modules), GET / 200 in 2033ms`), we **measured** two exact buckets: `1751ms` (86.1%) went to Next.js lazily compiling and bundling `551 modules` on the cold first hit, and `282ms` (13.9%) went to executing the Server/Client component tree and returning the HTTP response. Once those 551 modules were cached in memory, the second load dropped to `72ms`. What remains **estimated** (unless profiled with `--inspect`) is the sub-millisecond breakdown inside that `282ms` between React hydration serialization, CSS file parsing, and local socket I/O.

### 14. Why did we keep an unmerged branch in our Git history in Step 9?
In real engineering, not every experiment belongs in production. Creating `experiment/raw-sql-polling-abandoned`, committing the test on that isolated branch, and switching back to `main` without merging demonstrates how Git branches let engineers test risky ideas safely while keeping `main` deployable and clean.

### 15. Why did we use `clamp()` on headings and `rem` on buttons instead of fixed `px` values in Step 10?
Fixed `px` headings (like `56px`) overflow or leave awkward single-word orphans on `375px` mobile screens, whereas `clamp(1.75rem, 3.5vw + 0.75rem, 2.5rem)` scales smoothly between mobile and desktop viewports without media-query jumps. Similarly, `rem` padding on buttons scales proportionally if a user changes their browser's default font size for accessibility, whereas fixed pixel heights clip enlarged text.
