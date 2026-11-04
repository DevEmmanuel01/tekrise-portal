import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RegistrationBoundarySchema } from "@/lib/server-schemas";
import { hashPassword } from "@/lib/hash";

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    // STEP 6 & 7: Strict Server Boundary Schema Validation (Zod)
    // Replaces raw untrusted request body with parsed, trimmed, normalised data
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

    // Use ONLY the parsed, normalised, and trimmed output from Zod
    const { fullName, email, matricPin, track, password } = parsed.data;

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

    // STEP 4: Adaptive Argon2id Password Hashing (already trimmed by Zod)
    const passwordHash = await hashPassword(password);

    const student = await prisma.student.create({
      data: {
        fullName,
        email, // Guaranteed lowercased & trimmed
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