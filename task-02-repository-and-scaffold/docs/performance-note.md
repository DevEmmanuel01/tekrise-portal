# Task 2 Step 4: Development Server Performance Note

## 1. Recorded Load Times (From Local Machine Logs)
* **First Page Load (`GET / 200`):** **`2033ms`** (`2.033 seconds`), of which **`1751ms`** was spent compiling **`551 modules`** on demand, and **`282ms`** was spent executing the React Server Component tree and streaming the initial HTML response.
* **Subsequent Reload (`GET / 200`):** **`72ms`** (once the 551 modules were cached in memory by the Next.js development server).

## 2. Distance From a Reasonable Target
As discussed in class, a well-optimised production response for a static or cached server-rendered route should sit near **`10ms–50ms`** (and under `100ms` for dynamic reads).
* Our cold first load (`2033ms`) is roughly **`200x` slower** than a `10ms` edge/production target.
* Our warm reload (`72ms`) drops by **96.5%**, sitting within `62ms` of the `10ms` benchmark.

## 3. What Accounts for the Gap (Measured vs. Estimated)
1. **On-Demand Development Bundling (Measured — `1751ms` / 86.1% of total time):** Unlike `next build && next start` (which pre-compilesroutes ahead of time), `npm run dev` compiles routes lazily on first request. Parsing TypeScript, resolving 551 Node/React modules, and injecting Hot Module Replacement (HMR) wrappers consumed `1751ms`.
2. **Server Component Execution & CSS Token Injection (Measured Residual — `282ms` / 13.9%):** After compilation finished at `1751ms`, the remaining `282ms` went to Node.js executing the root layout (`layout.tsx`), loading `tokens.css` and `Inter` font metadata, and serialising the HTML payload.
3. **Unmeasured Sub-Components (Estimated):** Within that `282ms` window, the standard Next.js dev log does not separate React Server Component rendering time from local loopback socket overhead or source-map attachment—measuring those individually requires Node's `--inspect` profiler or `Server-Timing` headers.
