# Known Defects: Task 4 (Server-Side Security, Schema & Verification)

## Defect 1: Plaintext 6-Digit Verification OTP Leaked in HTTP Response Body
* **File & Reference:** src/app/api/enquiries/route.ts, Line 147 (demoVerificationCode: code).
* **Production Cost:** Returning demoVerificationCode in the HTTP registration response defeats email verification security because an attacker registering with someone else's email can read the 6-digit code straight out of the Network response.

## Defect 2: Unbounded In-Memory Rate Limit Map Trusts Spoofable X-Forwarded-For Header
* **File & Reference:** src/lib/rate-limit.ts, Lines 15-29.
* **Production Cost:** Attackers can bypass rate limiting via IP rotation, and unpruned Map keys risk server memory exhaustion (OOM).

## Defect 3: Non-Constant-Time Login Path (Timing Oracle User Enumeration)
* **File & Reference:** src/app/api/auth/login/route.ts, Lines 43-59.
* **Production Cost:** Unknown emails return 401 instantly (~5ms), while existing emails trigger Argon2id hashing (~85ms), allowing 100% accurate email enumeration via response latency.
