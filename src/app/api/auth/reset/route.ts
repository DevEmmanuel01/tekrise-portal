import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ResetBoundarySchema } from "@/lib/server-schemas";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
    try {
        // STEP 8: Password Reset Rate Limiting (3 attempts per 15 minutes per IP)
        const rateLimit = checkRateLimit(request, "reset", 3, 15 * 60 * 1000);
        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: `Rate limit exceeded: Too many password recovery requests from ${rateLimit.clientIp}. Please wait ${rateLimit.retryAfterSeconds} seconds.`,
                    retryAfterSeconds: rateLimit.retryAfterSeconds,
                },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(rateLimit.retryAfterSeconds),
                        "X-RateLimit-Limit": String(rateLimit.limit),
                        "X-RateLimit-Remaining": "0",
                    },
                }
            );
        }

        const rawBody = await request.json().catch(() => null);
        const parsed = ResetBoundarySchema.safeParse(rawBody);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: "Server boundary validation failed.",
                    details: parsed.error.issues.map((i) => ({
                        field: i.path.join("."),
                        message: i.message,
                    })),
                },
                { status: 400 }
            );
        }

        const { email } = parsed.data;
        await prisma.student.findUnique({ where: { email } });

        return NextResponse.json(
            {
                message: `If an active student record matches ${email}, a recovery code has been queued.`,
                normalisedEmail: email,
            },
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { error: "Internal server error during password reset." },
            { status: 500 }
        );
    }
}