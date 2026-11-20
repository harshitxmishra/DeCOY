import { NextResponse } from "next/server";
import { getFeed } from "@/features/discover/matching-service";

export async function GET() {
  try {
    const feed = getFeed();
    return NextResponse.json(feed);
  } catch (error) {
    console.error("GET /api/feed error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}
