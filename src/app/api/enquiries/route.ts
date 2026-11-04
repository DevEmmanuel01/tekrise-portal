import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RegistrationBoundarySchema } from "@/lib/server-schemas";
import { hashPassword } from "@/lib/hash";
import { checkRateLimit } from "@/lib/rate-limit";
import { checkPasswordBreached } from "@/lib/breach-check";

export async function POST(request: Request) {
  try {
    // STEP 8: Endpoint Rate Limiting (5 registration attempts per 10 minutes per IP)
    const rateLimit = checkRateLimit(request, "register", 5, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Rate limit exceeded: Too many registration attempts from ${rateLimit.clientIp}. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
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
    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    // STEP 6 & 7: Strict Server Boundary Schema Validation (Zod)
    const parsed = RegistrationBoundarySchema.safeParse(rawBody);
    if (!parsed.success) {
      const fieldErrors = parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        {
          error: "Server boundary validation failed.",
          violatedRulesCount: fieldErrors.length,
          details: fieldErrors,
        },
        { status: 400 }
      );
    }

    const { fullName, email, matricPin, track, password } = parsed.data;

    // STEP 9: Breached Password Check via Have I Been Pwned k-Anonymity API
    const breachStatus = await checkPasswordBreached(password);
    if (breachStatus.breached) {
      return NextResponse.json(
        {
          error: `Security Rejection: This password has appeared in ${breachStatus.occurrences.toLocaleString()} known public data breaches (SHA-1 prefix ${breachStatus.sha1Prefix}...). Please choose a unique passphrase that has never been exposed.`,
          breachOccurrences: breachStatus.occurrences,
          sha1PrefixQueried: breachStatus.sha1Prefix,
        },
        { status: 422 }
      );
    }

    // Check for duplicate email or matricPin
    const existing = await prisma.student.findFirst({
      where: {
        OR: [{ email }, { matricPin }],
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "A student record with this email or Admission Matriculation PIN already exists.",
        },
        { status: 409 }
      );
    }

    // STEP 4: Adaptive Argon2id Password Hashing
    const passwordHash = await hashPassword(password);

    const student = await prisma.student.create({
      data: {
        fullName,
        email,
        matricPin,
        passwordHash,
        track,
        campusCohortBatch: "IBADAN-RING-ROAD-C04",
      },
    });

    return NextResponse.json(
      {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        matricPin: student.matricPin,
        track: student.track,
        createdAt: student.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to register student:", error);
    return NextResponse.json(
      { error: "Internal server error while processing registration." },
      { status: 500 }
    );
  }
}