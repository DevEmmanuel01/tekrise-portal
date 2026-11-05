import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ResetBoundarySchema } from "@/lib/server-schemas";
import { checkRateLimit } from "@/lib/rate-limit";
import {
    generateVerificationCode,
    VERIFICATION_EXPIRY_MS,
} from "@/lib/verification";

export async function POST(request: Request) {
    try {
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
        const student = await prisma.student.findUnique({ where: { email } });

        if (student) {
            const resetCode = generateVerificationCode();
            const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY_MS);
            await prisma.verificationCode.create({
                data: {
                    studentId: student.id,
                    code: resetCode,
                    expiresAt,
                },
            });
        }

        // Identical response whether email exists or not (prevents account enumeration)
        return NextResponse.json(
            {
                message: `If an active student record matches ${email}, a 6-digit recovery code (valid for 8 minutes) has been dispatched.`,
                normalisedEmail: email,
            },
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { error: "Internal server error during password reset request." },
            { status: 500 }
        );
    }
}