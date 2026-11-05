import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const VerifySchema = z.object({
    email: z.string().trim().toLowerCase().email("Valid student email is required."),
    code: z
        .string()
        .trim()
        .regex(/^\d{6}$/, "Verification code must be an exact 6-digit number."),
});

export async function POST(request: Request) {
    try {
        const rawBody = await request.json().catch(() => null);
        const parsed = VerifySchema.safeParse(rawBody);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    error:
                        parsed.error.issues[0]?.message ||
                        "Invalid verification payload.",
                },
                { status: 400 }
            );
        }

        const { email, code } = parsed.data;

        const student = await prisma.student.findUnique({
            where: { email },
            include: {
                verificationCodes: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!student) {
            return NextResponse.json(
                { error: "Invalid verification code or email address." },
                { status: 400 }
            );
        }

        const matchingCodeRow = student.verificationCodes.find(
            (vc) => vc.code === code
        );

        // 1. Wrong code rejection (21-wrong-code-rejection.png)
        if (!matchingCodeRow) {
            return NextResponse.json(
                {
                    error: `Verification failed: Code "${code}" does not match any active verification code issued to ${email}.`,
                    reason: "WRONG_CODE",
                },
                { status: 400 }
            );
        }

        // 2. Reused code rejection (22-reused-code-rejection.png)
        if (matchingCodeRow.usedAt !== null) {
            return NextResponse.json(
                {
                    error: `Verification failed: Code "${code}" has already been used on ${matchingCodeRow.usedAt.toISOString()} and cannot be reused.`,
                    reason: "CODE_ALREADY_USED",
                    usedAt: matchingCodeRow.usedAt,
                },
                { status: 409 }
            );
        }

        // 3. Expired code rejection (20-expired-code-rejection.png)
        if (new Date() > matchingCodeRow.expiresAt) {
            return NextResponse.json(
                {
                    error: `Verification failed: Code "${code}" expired at ${matchingCodeRow.expiresAt.toISOString()} (exceeded the 8-minute security window). Please request a new code.`,
                    reason: "CODE_EXPIRED",
                    expiredAt: matchingCodeRow.expiresAt,
                },
                { status: 410 }
            );
        }

        // Mark code as used and activate student account atomically
        const now = new Date();
        await prisma.$transaction([
            prisma.verificationCode.update({
                where: { id: matchingCodeRow.id },
                data: { usedAt: now },
            }),
            prisma.student.update({
                where: { id: student.id },
                data: { isVerified: true },
            }),
        ]);

        return NextResponse.json(
            {
                message: `Email verified! ${student.fullName} (${student.email}) is now an active, verified Cohort 04 student.`,
                verifiedAt: now.toISOString(),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Verification error:", error);
        return NextResponse.json(
            { error: "Internal server error during email verification." },
            { status: 500 }
        );
    }
}