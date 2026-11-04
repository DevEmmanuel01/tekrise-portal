import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LoginBoundarySchema } from "@/lib/server-schemas";
import { verifyPassword } from "@/lib/hash";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
    try {
        // STEP 8: Login Rate Limiting (5 attempts per 10 minutes per IP)
        const rateLimit = checkRateLimit(request, "login", 5, 10 * 60 * 1000);
        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: `Rate limit exceeded: Too many login attempts from ${rateLimit.clientIp}. Account login temporarily locked for ${rateLimit.retryAfterSeconds} seconds.`,
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
        const parsed = LoginBoundarySchema.safeParse(rawBody);

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

        const { email, password } = parsed.data;

        const student = await prisma.student.findUnique({
            where: { email },
        });

        if (!student) {
            return NextResponse.json(
                { error: "Incorrect email or password." },
                { status: 401 }
            );
        }

        const isPasswordValid = await verifyPassword(student.passwordHash, password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Incorrect email or password." },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                message: "Authentication successful.",
                student: {
                    id: student.id,
                    fullName: student.fullName,
                    email: student.email,
                    matricPin: student.matricPin,
                    track: student.track,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error during login." },
            { status: 500 }
        );
    }
}