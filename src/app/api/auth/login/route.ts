import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LoginBoundarySchema } from "@/lib/server-schemas";
import { verifyPassword } from "@/lib/hash";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
    createServerSession,
    buildSessionCookieHeader,
} from "@/lib/session";

// Precomputed Argon2id dummy hash to prevent timing-oracle user enumeration when email is not found
const DUMMY_ARGON2ID_HASH =
    "$argon2id$v=19$m=65536,t=3,p=1$IN0WSXt/RPWleiVaA27gOQ$eFXxorChkl2iisZu3wnzdulcKarZRqHrBYcHwHHT8Ik";

export async function POST(request: Request) {
    try {
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
            // Constant-time mitigation: still execute Argon2id verify against dummy hash
            await verifyPassword(DUMMY_ARGON2ID_HASH, password);
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

        // TASK 5 STEP 1: Create stateful server session in PostgreSQL and issue HttpOnly cookie
        const clientIp = getClientIp(request);
        const userAgent = request.headers.get("user-agent") || "Unknown-Client";

        const sessionData = await createServerSession({
            studentId: student.id,
            ipAddress: clientIp,
            userAgent,
        });

        const response = NextResponse.json(
            {
                message: "Authentication successful. Server session established.",
                sessionId: sessionData.sessionId,
                sessionExpiresAt: sessionData.expiresAt.toISOString(),
                student: {
                    id: student.id,
                    fullName: student.fullName,
                    email: student.email,
                    matricPin: student.matricPin,
                    track: student.track,
                    role: student.role,
                },
            },
            { status: 200 }
        );

        response.headers.set(
            "Set-Cookie",
            buildSessionCookieHeader(sessionData.rawToken)
        );

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error during login." },
            { status: 500 }
        );
    }
}