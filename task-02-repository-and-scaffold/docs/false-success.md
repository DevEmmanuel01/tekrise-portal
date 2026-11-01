# Task 2 Step 6: The "False Success" Vulnerability

Accompanies evidence file: `13-write-failed-logs.txt`.

## What We Tested
To prove that our UI could lie to users if error boundaries aren't properly enforced, we deliberately broke the database connection by changing the PostgreSQL port in `.env` from `5432` to an empty port (`9999`). 

## What Happened
When we submitted the form, Prisma failed immediately, throwing a `PrismaClientInitializationError (P1001)` in the server terminal because it could not reach the database.

However, because the `catch` block in our API route (`src/app/api/enquiries/route.ts`) was temporarily configured to return a `200 OK` fallback response instead of a `500 Internal Server Error` (or because the frontend updated state optimistically without validating the `201 Created` status), the browser successfully rendered the green "Enquiry Submitted Successfully!" banner.

## The Engineering Lesson
This demonstrates a dangerous "False Success" state. An AI agent or junior developer might see the green success banner on the frontend and assume the feature is fully complete, completely unaware that zero rows are actually being written to the database. Reliable engineering requires strict backend status code propagation (`500`) and verifying the physical database rows (via Prisma Studio) before signing off on a feature.
