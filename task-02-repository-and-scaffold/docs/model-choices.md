# Task 2 Step 3: Deliberate Model & Agent Selection

## 1. Which Model/Tool We Used for Which Job
* **Project Scaffolding & Context Architecture (`Antigravity Agent`):** Used for Step 2 (Scaffolding the Next.js + Prisma foundation from Task 1 context files) and Step 10 (Information Design audit).
* **Targeted Feature Implementation & Boilerplate Generation (`OpenCode / DeepSeek V3`):** Used for rapid route handler creation in Step 6 (`/api/enquiries` POST endpoint and form markup) and quick CSS utility adjustments.

## 2. Observed Differences in Behaviour
* **Antigravity (Deliberative Planner):** Antigravity is noticeably slower before writing its first line of code (taking 25–40 seconds to read `business-brief.md`, `colour-roles.md`, `type-scale.md`, and `tokens.css`). However, because it builds a dependency graph of the workspace first, it respected our strict token rules on the first pass and waited at the approval gate before touching the filesystem.
* **OpenCode / DeepSeek (High-Speed Code Generator):** OpenCode optimises for immediate token streaming and low latency. When given a narrow, self-contained specification (such as writing a single Prisma create call or a form component), it outputs working TypeScript in 4–6 seconds. However, it does not naturally pause to cross-reference external markdown documentation unless those exact lines are pasted directly into the active prompt window.

## 3. Where We Chose Wrong and Had to Switch
When we started **Step 6 (adding the Student Admission Enquiry form and connecting it to Prisma)**, we initially stayed on the fast code-generation model (`OpenCode / DeepSeek`) and asked it to build the form UI and wire up the database schema in one go.
* **What went wrong:** Because it optimised for speed over workspace-wide context reading, it ignored `tokens.css` and injected hardcoded Tailwind/hex styles (`#10B981`, `font-size: 14px`) into the form component, and attempted to run `npx prisma db push` automatically despite our rule keeping agents out of database migrations.
* **How we fixed it:** We discarded the unapproved UI changes, switched back to **Antigravity** for the cross-file UI/token integration (where it needed to read `tokens.css` and `AGENTS.md` simultaneously), and restricted the fast model strictly to isolated backend helper functions where design system context was not required.
