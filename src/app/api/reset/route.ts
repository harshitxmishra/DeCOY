import { NextResponse } from "next/server";
import { resetDemo } from "@/features/discover/matching-service";

export async function POST() {
  try {
    const result = resetDemo();
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset demo" },
      { status: 500 }
    );
  }
}
