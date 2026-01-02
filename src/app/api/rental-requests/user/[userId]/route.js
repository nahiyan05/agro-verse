import { NextResponse } from 'next/server';
import { getRentalRequestsByUser } from '@/backend/controllers/rentalRequestController';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    const result = await getRentalRequestsByUser(userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in rental requests GET route:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
