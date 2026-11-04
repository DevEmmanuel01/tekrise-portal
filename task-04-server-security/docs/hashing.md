# Task 4 Step 4: Adaptive Password Hashing, Hardware Timing & Salting Analysis (`hashing.md`)

Accompanies machine-specific evidence files:
* `evidence/07-hash-twice-different.txt` (Hashing the same password twice with Argon2id)
* `evidence/08-timing-argon-vs-sha.txt` (Hardware benchmark comparing Argon2id against SHA-256)

---

## 1. Why Our Chosen Algorithm Is Argon2id (`src/lib/hash.ts`)
For the Tekrise Academy Student Portal, we selected **Argon2id** (winner of the 2015 Password Hashing Competition and OWASP first-choice recommendation) configured with:
* **Memory Cost (`m = 65536` KiB / `64 MiB`):** Forces every single password verification attempt to allocate and populate a 64 MB block of RAM, neutralizing cheap parallel GPU and ASIC cracking rigs which have thousands of arithmetic cores but severe per-core memory-bandwidth bottlenecks.
* **Time Cost (`t = 3` iterations) & Parallelism (`p = 1` thread):** Tunes single-hash latency to ~`101.696 ms` on our local development hardware.
* **Hybrid Mode (`argon2id`):** Combines `Argon2i` (data-independent memory access in the first pass to resist side-channel timing attacks) with `Argon2d` (data-dependent memory access in subsequent passes to maximize resistance against GPU time-memory trade-off attacks).

---

## 2. Hashing the Same Password Twice (`07-hash-twice-different.txt`)

```text
=== TASK 4 STEP 4.1: HASHING THE SAME PASSWORD TWICE (ARGON2ID) ===
Plaintext Input : TekriseIbadanCohort04!
Argon2id Hash 1 : $argon2id$v=19$m=65536,t=3,p=1$IN0WSXt/RPWleiVaA27gOQ$eFXxorChkl2iisZu3wnzdulcKarZRqHrBYcHwHHT8Ik
Argon2id Hash 2 : $argon2id$v=19$m=65536,t=3,p=1$H3w5u9EE9bMlFto3NTQ4lQ$MbxX887+2tHZRYtucjFibiWOeeViHGPcA1KeVxQ6V7s
Are outputs identical? : false

One-Line Explanation: Both outputs differ completely because Argon2id automatically generates a unique, cryptographically random 16-byte salt for every invocation and mixes it with the password before hashing, ensuring identical passwords never produce identical hashes.
```

**Why the two outputs differ in one line:**
Both outputs differ completely because Argon2id generates a fresh, cryptographically random 16-byte (128-bit) salt for each invocation and mixes it into the memory blocks before hashing, ensuring two identical passwords never produce the same stored digest.

---

## 3. Hardware Benchmark & Attacker Arithmetic (`08-timing-argon-vs-sha.txt`)

```text
=== TASK 4 STEP 4.2 & 4.3: HARDWARE BENCHMARK & ARITHMETIC (MACBOOK PRO) ===
Timestamp                              : 2026-11-04T15:45:46.283Z
Platform / Architecture                : darwin arm64 Node v24.18.0
----------------------------------------------------------------------------
1. Argon2id (m=64MB, t=3, p=1) Time    : 101.696 ms ( 101696375 ns )
2. SHA-256 Single Call Time            : 0.04483 ms ( 44833 ns )
3. SHA-256 Average Time (10k runs)     : 0.001140 ms ( 1140 ns )
----------------------------------------------------------------------------
ARITHMETIC (Guesses Per Second on Single CPU Core):
- Argon2id Guesses/sec = 1000 ms / 101.696 ms = 9.83 guesses/sec
- SHA-256 Guesses/sec  = 1000 ms / 0.001140 ms = 877,129 guesses/sec
- Cost Ratio (Slowdown Factor)         : 89,201x slower per attempt (plus 64 MB RAM lock)
```

### Step-by-Step Arithmetic From Our Machine Measurements:
1. **Argon2id Throughput (Guesses per Second):**
   $$\text{Time per Argon2id hash} = 101.696\text{ ms} = \frac{101.696}{1000}\text{ seconds}$$
   $$\text{Guesses per second} = \frac{1000\text{ ms}}{101.696\text{ ms}} \approx \mathbf{9.83\text{ guesses/second}}$$

2. **SHA-256 Throughput (Guesses per Second):**
   $$\text{Time per SHA-256 hash} = 0.001140\text{ ms} = \frac{0.001140}{1000}\text{ seconds}$$
   $$\text{Guesses per second} = \frac{1000\text{ ms}}{0.001140\text{ ms}} \approx \mathbf{877,129\text{ guesses/second}}$$

3. **Slowdown Multiplier:**
   On the exact same CPU core, replacing `SHA-256` with `Argon2id (m=64MB, t=3)` reduces an attacker's offline guessing speed by a factor of **`89,201x`** (and on a multi-core GPU, the 64 MB RAM requirement per hash widens that gap by orders of magnitude).

---

## 4. The Asymmetry Inversion: Why Slow Is Correct
In almost every part of software engineering, we optimise functions to execute as fast as possible. Password hashing is the exact inverse because of the **asymmetry between legitimate authentication and offline brute-force cracking**:
* **The Legitimate Server (Hashes Once per Login):** When a Tekrise Academy student signs in at the Ibadan campus, our server hashes their password **exactly once**. Waiting **`101.696 ms`** instead of **`0.001140 ms`** is completely imperceptible to a human being—it takes less than a twentieth of the blink of an eye.
* **The Offline Attacker (Hashes Billions of Times):** If an attacker steals our `Student` table and attempts a 10-billion-candidate dictionary and mask attack against a student password, `SHA-256` (`877,129` guesses/sec on one CPU thread, or billions/sec on a GPU) cracks the table in minutes. At **`9.83` guesses/second** with **64 MB of RAM locked per guess**, testing 10 billion guesses on our CPU core would take over **32 years**. Slowing down the hash costs us nothing measurable on login and costs the attacker everything.

---

## 5. What Salting Does, How Argon2id Handles It, and What Happens If You Skip It
* **What a Salt Is and What It Does:** A salt is a unique, cryptographically random byte sequence generated per password and stored alongside the hash output. It ensures that even if two students choose the exact same password (or if a student reuses a common password), their resulting password hashes are completely distinct.
* **Does Argon2id Handle It Automatically?** Yes. The `argon2.hash()` function automatically generates a 16-byte random salt via the operating system CSPRNG and encodes the algorithm version, cost parameters (`m=65536,t=3,p=1`), base64-encoded salt, and base64-encoded digest into a single self-contained PHC string (`$argon2id$v=19$m=65536,t=3,p=1$<salt>$<digest>`). During login, `argon2.verify(storedHash, password)` parses the embedded salt from `storedHash` automatically.
* **What an Attacker Could Do If You Skipped Salting:**
  1. **Precomputed Rainbow Table Attacks:** Without a salt, a given password always hashes to the exact same deterministic string. An attacker does not even need to run hashes after stealing your database—they simply look up your unsalted hashes in precomputed multi-terabyte rainbow tables and recover passwords in $O(1)$ time.
  2. **Instant Mass-Cracking & Duplicate Detection:** By inspecting an unsalted `Student` table, an attacker immediately sees which students share identical hashes. Cracking that single hash cracks every matching student account simultaneously.
