import { NextRequest, NextResponse } from "next/server";
import { recordSwipe } from "@/features/discover/matching-service";
import { parseSession, serializeSession, COOKIE_NAME } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const cookie = request.cookies.get(COOKIE_NAME)?.value;
    const session = parseSession(cookie);

    const body = await request.json();
    const { profileId, action } = body;

    if (!profileId || !["like", "pass"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request. Required: { profileId: string, action: 'like' | 'pass' }" },
        { status: 400 }
      );
    }

    const { updatedSession, ...result } = recordSwipe(profileId, action, session);
    const response = NextResponse.json(result);

    if (updatedSession) {
      response.cookies.set(COOKIE_NAME, serializeSession(updatedSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error("POST /api/swipe error:", error);
    return NextResponse.json(
      { error: "Failed to process swipe" },
      { status: 500 }
    );
  }
}
