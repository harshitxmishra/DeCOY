import { NextResponse } from "next/server";
import { getMatches } from "@/features/discover/matching-service";

export async function GET() {
  try {
    const matches = getMatches();
    return NextResponse.json(matches);
  } catch (error) {
    console.error("GET /api/matches error:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}
