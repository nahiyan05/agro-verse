import { NextResponse } from 'next/server';
import { getEquipment, createEquipment } from '@/backend/controllers/equipmentController';

export async function GET() {
  try {
    const result = await getEquipment();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in equipment GET route:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await createEquipment(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in equipment POST route:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
