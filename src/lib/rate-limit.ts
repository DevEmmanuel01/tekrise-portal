export interface RateLimitResult {
    allowed: boolean;
    limit: number;
    remaining: number;
    retryAfterSeconds: number;
    clientIp: string;
}

interface BucketEntry {
    timestamps: number[];
}

// Persistent across Next.js hot reloads in development
const globalForRateLimit = globalThis as unknown as {
    rateLimitStore?: Map<string, BucketEntry>;
};

const store =
    globalForRateLimit.rateLimitStore ?? new Map<string, BucketEntry>();
globalForRateLimit.rateLimitStore = store;

/**
 * Extracts client IP from standard reverse-proxy headers.
 * Note: Used in Step 8 to demonstrate both IP rate limiting and how rotating
 * X-Forwarded-For / proxy IPs defeats naive IP-only rate limiters.
 */
export function getClientIp(request: Request): string {
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim();
    }
    const realIp = request.headers.get("x-real-ip");
    if (realIp) {
        return realIp.trim();
    }
    return "127.0.0.1";
}

export function checkRateLimit(
    request: Request,
    scope: "register" | "login" | "reset",
    maxRequests: number,
    windowMs: number
): RateLimitResult {
    const clientIp = getClientIp(request);
    const key = `${scope}:${clientIp}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    const entry = store.get(key) ?? { timestamps: [] };
    // Prune timestamps outside the current sliding window
    const activeTimestamps = entry.timestamps.filter((ts) => ts > windowStart);

    if (activeTimestamps.length >= maxRequests) {
        const oldestInWindow = activeTimestamps[0];
        const retryAfterSeconds = Math.max(
            1,
            Math.ceil((oldestInWindow + windowMs - now) / 1000)
        );
        store.set(key, { timestamps: activeTimestamps });
        return {
            allowed: false,
            limit: maxRequests,
            remaining: 0,
            retryAfterSeconds,
            clientIp,
        };
    }

    activeTimestamps.push(now);
    store.set(key, { timestamps: activeTimestamps });

    return {
        allowed: true,
        limit: maxRequests,
        remaining: Math.max(0, maxRequests - activeTimestamps.length),
        retryAfterSeconds: 0,
        clientIp,
    };
}