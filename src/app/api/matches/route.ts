import { NextRequest, NextResponse } from "next/server";
import { getMatches } from "@/features/discover/matching-service";
import { parseSession, COOKIE_NAME } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get(COOKIE_NAME)?.value;
    const session = parseSession(cookie);
    const matches = getMatches(session);
    return NextResponse.json(matches);
  } catch (error) {
    console.error("GET /api/matches error:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}
