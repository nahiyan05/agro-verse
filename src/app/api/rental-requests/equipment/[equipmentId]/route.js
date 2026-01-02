import { NextResponse } from 'next/server';
import { getRentalRequestsByEquipment } from '@/backend/controllers/rentalRequestController';

export async function GET(request, { params }) {
  try {
    const { equipmentId } = await params;
    const result = await getRentalRequestsByEquipment(equipmentId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in rental requests by equipment GET route:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
