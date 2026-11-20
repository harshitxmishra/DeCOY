import { NextRequest, NextResponse } from "next/server";
import { getMatchMessages, sendMatchMessage } from "@/features/discover/matching-service";
import { parseSession, serializeSession, COOKIE_NAME } from "@/lib/session";

export async function GET(request: NextRequest) {
  const matchId = request.nextUrl.searchParams.get("matchId");
  if (!matchId) {
    return NextResponse.json({ error: "matchId required" }, { status: 400 });
  }

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  const session = parseSession(cookie);
  const messages = getMatchMessages(matchId, session);
  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, text } = body;
    if (!matchId || !text?.trim()) {
      return NextResponse.json({ error: "matchId and text required" }, { status: 400 });
    }

    const cookie = request.cookies.get(COOKIE_NAME)?.value;
    const session = parseSession(cookie);
    const { userMsg, autoReply, updatedSession } = sendMatchMessage(matchId, text.trim(), session);

    const response = NextResponse.json({ userMsg, autoReply });
    response.cookies.set(COOKIE_NAME, serializeSession(updatedSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (err) {
    console.error("POST /api/messages error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
