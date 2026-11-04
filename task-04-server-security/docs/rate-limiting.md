# Task 4 Step 8: Rate Limiting Strategy, Endpoint Thresholds & Bypass Analysis (`rate-limiting.md`)

Accompanies evidence files:
* `evidence/13-rate-limit-triggered.png` (Browser lockout banner on 6th attempt)
* `evidence/14-rate-limit-defeated.txt` (Triggering HTTP 429 from a single IP vs. defeating the limiter via IP rotation)

---

## 1. Our Per-Route Rate Limit Numbers & Business Justification (`src/lib/rate-limit.ts`)

We implemented sliding-window rate limiting across all three public authentication routes with distinct thresholds tailored to each route's risk profile:

1. **Student Login (`POST /api/auth/login`) — `5 attempts per 10 minutes` per IP:**
   * *Why this number:* A legitimate Tekrise Academy student who mistypes their password on a mobile keyboard typically succeeds within 2 to 3 attempts. Allowing 5 attempts inside a 10-minute sliding window accommodates honest typos while capping online credential-stuffing and brute-force attacks at 0.5 guesses per minute—and critically prevents attackers from flooding our server with concurrent `Argon2id` (`64 MB RAM`) verification calls.
2. **Cohort Registration (`POST /api/enquiries`) — `5 attempts per 10 minutes` per IP:**
   * *Why this number:*Normally, a student registers only once per device, or occasionally 2–3 times if two roommates at a student hostel in Ibadan share a single Wi-Fi router (NAT IP) or if a student corrects a duplicate email error. Capping registration at 5 attempts per 10 minutes prevents automated bots from enumerating our 5-digit Ibadan Bursary Matriculation PIN space (`10000`–`99999`) or flooding our database and outbound SMTP queue.
3. **Password Reset (`POST /api/auth/reset`) — `3 attempts per 15 minutes` per IP:**
   * *Why this number:* Password recovery triggers an outbound email and database lookup. A legitimate student never needs to request more than 1 or 2 reset codes in a 15-minute window. Setting a stricter limit of 3 attempts per 15 minutes prevents attackers from abusing our reset endpoint to mail-bomb a student's inbox or exhaust our transactional email quota.

---

## 2. How We Defeated Our Own Rate Limit (`14-rate-limit-defeated.txt`)

After proving that 6 consecutive requests from fixed IP `41.203.72.10` triggered `HTTP/1.1 429 Too Many Requests` (`Part A` of `evidence/14-rate-limit-defeated.txt`), we attacked our own endpoint in `Part B` by rotating the `X-Forwarded-For` header across 8 distinct Nigerian IP addresses (`197.210.70.101` through `197.210.70.108`) while targeting the **exact same student email (`adeleke.o@tekrise.ng`)**:

```bash
curl -s -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 197.210.70.$((100 + i))" \
  -d '{"email":"adeleke.o@tekrise.ng","password":"rotated_ip_guess_'$i'"}'