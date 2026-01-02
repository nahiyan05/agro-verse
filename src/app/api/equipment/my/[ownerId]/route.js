import { NextResponse } from 'next/server';
import { getEquipmentByOwner } from '@/backend/controllers/equipmentController';

export async function GET(request, { params }) {
  try {
    const { ownerId } = await params;
    const result = await getEquipmentByOwner(ownerId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in equipment by owner GET route:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
