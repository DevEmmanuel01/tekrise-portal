import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "tekrise_session";
export const SESSION_TTL_DAYS = 7;
export const SESSION_TTL_SECONDS = SESSION_TTL_DAYS * 24 * 60 * 60;

/**
 * Computes deterministic SHA-256 hex digest of a high-entropy (256-bit) session token.
 * Fast SHA-256 is appropriate here because the input is 32 cryptographically random bytes
 * (2^256 keyspace), never a human-chosen password.
 */
export function hashSessionToken(rawToken: string): string {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export async function createServerSession(params: {
    studentId: string;
    ipAddress: string | null;
    userAgent: string | null;
}) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashSessionToken(rawToken);
    const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

    const sessionRow = await prisma.session.create({
        data: {
            studentId: params.studentId,
            tokenHash,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
            expiresAt,
        },
    });

    return {
        rawToken,
        tokenHash,
        expiresAt,
        sessionId: sessionRow.id,
    };
}

export function buildSessionCookieHeader(rawToken: string): string {
    const isProd = process.env.NODE_ENV === "production";
    const parts = [
        `${SESSION_COOKIE_NAME}=${rawToken}`,
        "HttpOnly",
        "Path=/",
        "SameSite=Lax",
        `Max-Age=${SESSION_TTL_SECONDS}`,
    ];
    if (isProd) {
        parts.push("Secure");
    }
    return parts.join("; ");
}

export function buildExpiredSessionCookieHeader(): string {
    return `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}

export function extractRawTokenFromRequest(request: Request): string | null {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(
        new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`)
    );
    return match ? match[1].trim() : null;
}

export async function getAuthenticatedStudent(request: Request) {
    const rawToken = extractRawTokenFromRequest(request);
    if (!rawToken) return null;

    const tokenHash = hashSessionToken(rawToken);
    const session = await prisma.session.findUnique({
        where: { tokenHash },
        include: { student: true },
    });

    if (!session) return null;

    // Enforce server-side expiration check
    if (new Date() > session.expiresAt) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => { });
        return null;
    }

    return {
        session,
        student: session.student,
    };
}