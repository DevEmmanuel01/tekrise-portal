# Task 2 Step 1: Scaffolding Prompt Iteration

## 1. First Draft (Written Before Refinement)
```text
Read the business brief and design tokens in task-01-design-system. Scaffold a Next.js App Router project with TypeScript and Prisma for the Tekrise Academy Student Portal. Import our tokens.css file so all colours, Inter typography styles, and shadows come from the design system with no hardcoded hex values. Build the basic project setup and a simple home page, and tell me your plan before writing code.
You are a disciplined full-stack engineer scaffolding the foundation of the Tekrise Academy Student & Admissions Portal. Follow these 8 rules strictly:

1. READ FIRST: Read all context and design system files before writing any code: `task-01-design-system/docs/business-brief.md`, `task-01-design-system/docs/colour-roles.md`, `task-01-design-system/docs/type-scale.md`, `task-01-design-system/docs/shadows.md`, and `task-01-design-system/tokens.css`.
2. SUMMARISE & WAIT: Before creating any files or running any terminal commands, summarise your understanding of the business, stack, and constraints, present your step-by-step scaffolding plan, and wait for my explicit approval.
3. SINGLE SOURCE OF TRUTH: Treat those files as the only source of truth for the project.
4. ESCAPE HATCH (ASK, DO NOT ASSUME): If any two files disagree or a requirement is ambiguous, stop and ask me rather than guessing.
5. STRICT DESIGN TOKENS: Import `tokens.css` into the global stylesheet. Use ONLY our semantic colour role variables (`--color-primary`, `--color-on-primary`, `--color-surface`, `--color-on-surface`, etc.), `.type-*` classes, and `--shadow-*` variables. Zero hardcoded hex values, rgb(), or ad-hoc font sizes are permitted.
6. FOUNDATION ONLY (NO SCOPE CREEP): Build ONLY the Next.js (App Router + TypeScript) and Prisma/PostgreSQL project setup and a minimal home screen (`src/app/page.tsx`) introducing Tekrise Academy Ibadan. Do NOT build authentication pages, dashboards, payment flows, or admin portals yet.
7. INVENTORY & ASSUMPTIONS: After I approve and you scaffold, list every file you created and explicitly list every assumption you made.
8. SELF-AUDIT: Conclude your output by auditing your own work line-by-line against instructions 1 through 7.
