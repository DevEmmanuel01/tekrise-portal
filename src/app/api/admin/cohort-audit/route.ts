import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedStudent } from "@/lib/session";

export async function GET(request: Request) {
    // 1. Authentication Check (401 Unauthorized)
    const authContext = await getAuthenticatedStudent(request);
    if (!authContext) {
        return NextResponse.json(
            {
                error:
                    "401 Unauthorized: You must be signed in to access the Ibadan Bursary Cohort Audit endpoint.",
            },
            { status: 401 }
        );
    }

    // 2. Role-Based Authorisation Check (403 Forbidden if role !== REGISTRAR_ADMIN)
    if (authContext.student.role !== "REGISTRAR_ADMIN") {
        return NextResponse.json(
            {
                error: `403 Forbidden (Insufficient Role): Account ${authContext.student.email} holds role "${authContext.student.role}", but "REGISTRAR_ADMIN" privilege is required to access /api/admin/cohort-audit.`,
                currentRole: authContext.student.role,
                requiredRole: "REGISTRAR_ADMIN",
            },
            { status: 403 }
        );
    }

    const totalStudents = await prisma.student.count();
    const totalPayments = await prisma.tuitionPayment.count();

    return NextResponse.json(
        {
            message: "Registrar Admin Audit Access Granted.",
            totalStudents,
            totalPayments,
        },
        { status: 200 }
    );
}