import { NextRequest, NextResponse } from "next/server";
import { getFeed } from "@/features/discover/matching-service";
import { parseSession, COOKIE_NAME } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get(COOKIE_NAME)?.value;
    const session = parseSession(cookie);
    const feed = getFeed(session);
    return NextResponse.json(feed);
  } catch (error) {
    console.error("GET /api/feed error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}
