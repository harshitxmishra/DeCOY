import { NextResponse } from "next/server";
import { resetDemo } from "@/features/discover/matching-service";
import { serializeSession, COOKIE_NAME } from "@/lib/session";

export async function POST() {
  try {
    const { updatedSession, ...result } = resetDemo();
    const response = NextResponse.json(result);

    if (updatedSession) {
      response.cookies.set(COOKIE_NAME, serializeSession(updatedSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error) {
    console.error("POST /api/reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset demo" },
      { status: 500 }
    );
  }
}
