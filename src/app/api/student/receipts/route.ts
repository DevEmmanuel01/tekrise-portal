import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedStudent } from "@/lib/session";

export async function GET(request: Request) {
    // 1. Authentication Check (401 Unauthorized if no valid session cookie)
    const authContext = await getAuthenticatedStudent(request);
    if (!authContext) {
        return NextResponse.json(
            {
                error:
                    "401 Unauthorized: Valid tekrise_session cookie required to access student tuition receipts.",
            },
            { status: 401 }
        );
    }

    const url = new URL(request.url);
    const requestedStudentId =
        url.searchParams.get("studentId") || authContext.student.id;

    // 2. Resource Ownership Authorisation Check (403 Forbidden if Student A requests Student B's receipts)
    if (
        requestedStudentId !== authContext.student.id &&
        authContext.student.role !== "REGISTRAR_ADMIN"
    ) {
        return NextResponse.json(
            {
                error: `403 Forbidden (IDOR Blocked): Authenticated student ${authContext.student.email} (${authContext.student.id}) is not authorised to access tuition records belonging to studentId ${requestedStudentId}.`,
                authenticatedStudentId: authContext.student.id,
                requestedResourceOwnerId: requestedStudentId,
            },
            { status: 403 }
        );
    }

    const payments = await prisma.tuitionPayment.findMany({
        where: { studentId: requestedStudentId },
        orderBy: { paidAt: "desc" },
    });

    return NextResponse.json(
        {
            studentId: authContext.student.id,
            email: authContext.student.email,
            matricPin: authContext.student.matricPin,
            tuitionPayments: payments,
        },
        { status: 200 }
    );
}