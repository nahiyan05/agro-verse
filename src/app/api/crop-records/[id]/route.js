import { NextResponse } from "next/server";
import { cropRecordController } from "@/backend/controllers/cropRecordController";

export async function PUT(request, { params }) {
  try {
    const authToken = request.cookies.get("auth-token")?.value;

    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const updateData = await request.json();
    
    const result = await cropRecordController.updateCropRecord(authToken, id, updateData);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating crop record:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update crop record" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const authToken = request.cookies.get("auth-token")?.value;

    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const result = await cropRecordController.deleteCropRecord(authToken, id);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting crop record:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete crop record" },
      { status: 500 }
    );
  }
}
