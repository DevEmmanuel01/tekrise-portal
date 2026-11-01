# Tekrise Academy — Student & Admissions Portal

Production-grade web portal for **Tekrise Academy** (Ring Road Campus, Ibadan, Oyo State), built with **Next.js 15 (App Router)**, **TypeScript**, **PostgreSQL**, **Prisma ORM**, and a strict two-layer CSS custom property design token architecture (`tokens.css`).

---

## 1. Prerequisites
Ensure the following are installed on your machine before cloning:
* **Node.js:** `v18.18.0` or higher (`node -v`)
* **npm:** `v9+` (`npm -v`)
* **PostgreSQL:** `v15+` or `v18+` running locally on port `5432` (`pg_isready`)

---

## 2. Cold-Start Setup Instructions (From Zero to Running App)

### Step 1: Clone the Repository & Install Dependencies
```bash
git clone <your-repo-url> tekrise-portal
cd tekrise-portal
npm install

---
### Step 2: cp .env.example .env
Open .env and update DATABASE_URL with your local PostgreSQL username and password: DATABASE_URL="postgresql://<your-db-user>:<your-db-password>@localhost:5432/tekrise_portal?schema=public"

---
###Step 3: Create the Database & Push the Prisma Schema
Ensure your PostgreSQL service is started (brew services start postgresql@18 on macOS), create the database, and sync the Prisma schema:

Bash
createdb tekrise_portal
npx prisma db push
Step 4: Start the Development Server
Bash
npm run dev
Open http://localhost:3000 in your browser to view the Tekrise Academy Student & Admissions Portal and submit a Cohort 04 Admission Enquiry. To inspect stored database rows visually, run npx prisma studio in a second terminal tab (http://localhost:5555).
3. Repository Structure
task-01-design-system/ — Figma variables export, token converter (convert-tokens.mjs), tokens.css, static proof screen, and Task 1 documentation/evidence.

task-02-repository-and-scaffold/ — Task 2 architecture documentation (docs/) and machine-verifiable server/DB/Git evidence (evidence/01 through 20).

src/app/ — Next.js App Router pages, layout, global token styles, and /api/enquiries POST route handler.

prisma/schema.prisma — PostgreSQL schema defining AdmissionEnquiry.
