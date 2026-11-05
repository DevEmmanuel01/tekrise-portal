import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { hashPassword } from "@/lib/hash";
import { checkPasswordBreached } from "@/lib/breach-check";

const ResetConfirmSchema = z.object({
    email: z.string().trim().toLowerCase().email("Valid student email is required."),
    code: z
        .string()
        .trim()
        .regex(/^\d{6}$/, "Recovery code must be an exact 6-digit number."),
    newPassword: z
        .string()
        .transform((val) => val.trim())
        .refine((val) => val.length >= 10, {
            message: "New password must be at least 10 non-space characters long.",
        }),
});

export async function POST(request: Request) {
    try {
        const rawBody = await request.json().catch(() => null);
        const parsed = ResetConfirmSchema.safeParse(rawBody);

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

        const { email, code, newPassword } = parsed.data;

        // Screen new password against HIBP k-anonymity breach API
        const breachStatus = await checkPasswordBreached(newPassword);
        if (breachStatus.breached) {
            return NextResponse.json(
                {
                    error: `Security Rejection: New password has appeared in ${breachStatus.occurrences.toLocaleString()} public data breaches. Choose a fresh passphrase.`,
                },
                { status: 422 }
            );
        }

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
                { error: "Invalid or expired recovery code." },
                { status: 400 }
            );
        }

        const matchingCode = student.verificationCodes.find((vc) => vc.code === code);

        if (
            !matchingCode ||
            matchingCode.usedAt !== null ||
            new Date() > matchingCode.expiresAt
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid, expired, or already-used 6-digit password recovery code.",
                },
                { status: 400 }
            );
        }

        const newPasswordHash = await hashPassword(newPassword);
        const now = new Date();

        // ATOMIC TRANSACTION:
        // 1. Mark recovery OTP as used
        // 2. Update Student.passwordHash with new Argon2id digest
        // 3. Delete ALL existing Session rows for this student across all devices
        const [, , deletedSessions] = await prisma.$transaction([
            prisma.verificationCode.update({
                where: { id: matchingCode.id },
                data: { usedAt: now },
            }),
            prisma.student.update({
                where: { id: student.id },
                data: { passwordHash: newPasswordHash },
            }),
            prisma.session.deleteMany({
                where: { studentId: student.id },
            }),
        ]);

        return NextResponse.json(
            {
                message:
                    "Password reset successful. All existing active sessions across all devices have been invalidated.",
                studentEmail: student.email,
                invalidatedSessionsCount: deletedSessions.count,
                resetCompletedAt: now.toISOString(),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Password reset confirm error:", error);
        return NextResponse.json(
            { error: "Internal server error during password reset confirmation." },
            { status: 500 }
        );
    }
}