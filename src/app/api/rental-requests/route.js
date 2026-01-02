import { NextResponse } from 'next/server';
import { createRentalRequest } from '@/backend/controllers/rentalRequestController';

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await createRentalRequest(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in rental request POST route:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
