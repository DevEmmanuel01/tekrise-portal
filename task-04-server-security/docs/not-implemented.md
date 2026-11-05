# Task 4 Step 12: Security Controls Deliberately Not Implemented Yet (not-implemented.md)

Security engineering requires proportionate resource allocation. Below are four security controls we actively evaluated for the Tekrise Academy Student & Admissions Portal during Task 4 and deliberately decided not to implement at this stage, the concrete risk we accept for each, and the exact operational trigger that will force us to implement it.

## 1. Hardware WebAuthn / TOTP Multi-Factor Authentication (MFA)
* **Why Skipped:** Adding mandatory TOTP authenticator-app setup during Cohort 04 onboarding at Ring Road Ibadan introduces onboarding friction and support tickets for students on entry-level mobile devices.
* **Risk Accepted:** If an attacker compromises both a student's portal password and their personal Gmail inbox, they can view class schedules and tuition receipts. The financial blast radius is bounded because the portal only views records and cannot initiate outbound bank transfers.
* **Trigger to Build:** Launching an Admin Registrar Console capable of issuing tuition refunds, editing payment ledgers, or exporting student PII under NDPA 2023.

## 2. Distributed Redis Rate-Limiting & Per-Account Lockout Counters
* **Why Skipped:** We used an in-memory sliding-window Map keyed by IP to keep the local development architecture self-contained without requiring a paid cloud database.
* **Risk Accepted:** Rotating IP proxies can bypass IP-only rate limiting, and multi-instance serverless deployments maintain separate counters.
* **Trigger to Build:** Public production traffic deployment across multiple serverless instances.

## 3. Persistent Queue Broker (BullMQ + Redis / AWS SQS)
* **Why Skipped:** We decoupled SMTP dispatch using setImmediate() in-process deferral, which is sufficient for a single-cohort MVP (~150 students).
* **Risk Accepted:** If the server crashes in the 400ms SMTP handshake window, the verification email is lost silently.
* **Trigger to Build:** Scaling admissions beyond 500 concurrent registrations or adding automated Paystack payment receipt emails.

## 4. Application-Layer PII Envelope Encryption (KMS)
* **Why Skipped:** We rely on PostgreSQL disk-level encryption at rest, avoiding the search/indexing limitations and key-management overhead of column-level encryption.
* **Risk Accepted:** Anyone with raw database backup access can read student names and email addresses.
* **Trigger to Build:** Storing high-risk government identity numbers (NIN, BVN) for student financing.
