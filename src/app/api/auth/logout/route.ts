import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    extractRawTokenFromRequest,
    hashSessionToken,
    buildExpiredSessionCookieHeader,
} from "@/lib/session";

export async function POST(request: Request) {
    try {
        const rawToken = extractRawTokenFromRequest(request);

        if (rawToken) {
            const tokenHash = hashSessionToken(rawToken);
            // Delete the active session from PostgreSQL so replayed cookies fail immediately
            await prisma.session.deleteMany({
                where: { tokenHash },
            });
        }

        const response = NextResponse.json(
            {
                message:
                    "Logged out. Server-side session destroyed and browser cookie cleared.",
            },
            { status: 200 }
        );

        response.headers.set("Set-Cookie", buildExpiredSessionCookieHeader());
        return response;
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { error: "Internal server error during logout." },
            { status: 500 }
        );
    }
}