import { NextResponse } from 'next/server';
import { acceptRentalRequest } from '@/backend/controllers/rentalRequestController';

export async function PUT(request, { params }) {
  try {
    const { requestId } = await params;
    const body = await request.json();
    const result = await acceptRentalRequest(requestId, body.equipment_id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in accept rental request PUT route:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
