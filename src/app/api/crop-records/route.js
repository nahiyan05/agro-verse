import { NextResponse } from "next/server";
import { cropRecordController } from "@/backend/controllers/cropRecordController";

export async function GET(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value;

    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const landId = searchParams.get("landId");

    if (!landId) {
      return NextResponse.json({ success: false, message: "Land ID is required" }, { status: 400 });
    }

    const result = await cropRecordController.getCropRecordsByLandId(authToken, landId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching crop records:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch crop records" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value;

    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const requestData = await request.json();
    const result = await cropRecordController.createCropRecord(authToken, requestData);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating crop record:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create crop record" },
      { status: 500 }
    );
  }
}
