import crypto from "crypto";

export interface BreachCheckResult {
    breached: boolean;
    occurrences: number;
    sha1Prefix: string;
    lookupMs: number;
    apiReachable: boolean;
}

/**
 * Task 4 Step 9: Have I Been Pwned Pwned Passwords Range API (k-Anonymity)
 * 1. Computes uppercase SHA-1 hash of the trimmed candidate password locally.
 * 2. Splits into 5-character prefix and 35-character suffix.
 * 3. Sends ONLY the 5-character prefix to https://api.pwnedpasswords.com/range/{prefix}
 * 4. Compares the returned suffixes locally so the full password/hash never leaves our server.
 */
export async function checkPasswordBreached(
    plainPassword: string
): Promise<BreachCheckResult> {
    const start = performance.now();
    const fullSha1 = crypto
        .createHash("sha1")
        .update(plainPassword.trim())
        .digest("hex")
        .toUpperCase();

    const sha1Prefix = fullSha1.slice(0, 5);
    const sha1Suffix = fullSha1.slice(5);

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const response = await fetch(
            `https://api.pwnedpasswords.com/range/${sha1Prefix}`,
            {
                headers: {
                    "User-Agent": "Tekrise-Academy-Student-Portal-Security-Check",
                    "Add-Padding": "true",
                },
                signal: controller.signal,
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            // Fail-open availability fallback if external HIBP service returns 5xx
            return {
                breached: false,
                occurrences: 0,
                sha1Prefix,
                lookupMs: Math.round(performance.now() - start),
                apiReachable: false,
            };
        }

        const bodyText = await response.text();
        const lines = bodyText.split(/\r?\n/);

        for (const line of lines) {
            const [candidateSuffix, countStr] = line.split(":");
            if (candidateSuffix && candidateSuffix.trim() === sha1Suffix) {
                const occurrences = parseInt(countStr.trim(), 10) || 0;
                if (occurrences > 0) {
                    return {
                        breached: true,
                        occurrences,
                        sha1Prefix,
                        lookupMs: Math.round(performance.now() - start),
                        apiReachable: true,
                    };
                }
            }
        }

        return {
            breached: false,
            occurrences: 0,
            sha1Prefix,
            lookupMs: Math.round(performance.now() - start),
            apiReachable: true,
        };
    } catch {
        // Graceful degradation if Ibadan campus ISP drops connection to HIBP
        return {
            breached: false,
            occurrences: 0,
            sha1Prefix,
            lookupMs: Math.round(performance.now() - start),
            apiReachable: false,
        };
    }
}