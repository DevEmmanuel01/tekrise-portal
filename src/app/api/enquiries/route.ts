import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, track } = body;

    if (!fullName || !email || !track) {
      return NextResponse.json(
        { error: 'Missing required fields: fullName, email, and track are required.' },
        { status: 400 }
      );
    }

    const enquiry = await prisma.admissionEnquiry.create({
      data: {
        fullName: String(fullName).trim(),
        email: String(email).trim().toLowerCase(),
        track: String(track).trim(),
      },
    });

    const timestamp = new Date().toISOString();
    console.log(`[POST /api/enquiries] 201 Created — Row ID: ${enquiry.id} at ${timestamp}`);

    return NextResponse.json(enquiry, { status: 201 });
  } catch (error) {
    console.error('[POST /api/enquiries] Error creating admission enquiry:', error);
    return NextResponse.json(
      { error: 'Failed to record admission enquiry. Please verify database connectivity.' },
      { status: 500 }
    );
  }
}

