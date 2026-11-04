import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ResetBoundarySchema } from "@/lib/server-schemas";

export async function POST(request: Request) {
    try {
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

        const { email } = parsed.data; // lowercased & trimmed
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