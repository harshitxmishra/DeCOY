import { NextRequest, NextResponse } from "next/server";
import { recordSwipe } from "@/features/discover/matching-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileId, action } = body;

    if (!profileId || !["like", "pass"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request. Required: { profileId: string, action: 'like' | 'pass' }" },
        { status: 400 }
      );
    }

    const result = recordSwipe(profileId, action);
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/swipe error:", error);
    return NextResponse.json(
      { error: "Failed to process swipe" },
      { status: 500 }
    );
  }
}
