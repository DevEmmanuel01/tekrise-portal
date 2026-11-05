import { NextResponse } from "next/server";
import { buildBrandedVerificationEmailHtml } from "@/lib/verification";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const fullName = url.searchParams.get("name") || "Oluwaseun Adeleke";
    const email = url.searchParams.get("email") || "adeleke.o@tekrise.ng";
    const code = url.searchParams.get("code") || "849204";
    const track =
        url.searchParams.get("track") || "Full-Stack Software Engineering";
    const matricPin = Number(url.searchParams.get("pin") || 48291);

    const html = buildBrandedVerificationEmailHtml({
        fullName,
        email,
        code,
        track,
        matricPin,
    });

    return new NextResponse(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });
}