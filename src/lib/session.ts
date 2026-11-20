import { createHash } from "crypto";

export interface SessionSwipe {
  profileId: string;
  action: "like" | "pass";
  isMatch: boolean;
  createdAt: string;
}

export interface SessionMessage {
  id: string;
  matchId: string;
  sender: "user" | "match";
  text: string;
  timestamp: string;
}

export interface SessionData {
  swipes: SessionSwipe[];
  messages: SessionMessage[];
}

const COOKIE_NAME = "coy_session";
const SECRET = process.env.SESSION_SECRET || "coy-discover-secret-2026";

function sign(payload: string): string {
  return createHash("sha256").update(payload + SECRET).digest("hex").slice(0, 16);
}

export function serializeSession(data: SessionData): string {
  const json = JSON.stringify(data);
  const base64 = Buffer.from(json, "utf-8").toString("base64url");
  const sig = sign(base64);
  return `${base64}.${sig}`;
}

export function parseSession(cookieValue: string | undefined | null): SessionData {
  if (!cookieValue) {
    return { swipes: [], messages: [] };
  }

  try {
    const parts = cookieValue.split(".");
    if (parts.length !== 2) return { swipes: [], messages: [] };
    const [base64, sig] = parts;
    if (sign(base64) !== sig) {
      // Signature mismatch, fallback to empty
      return { swipes: [], messages: [] };
    }
    const json = Buffer.from(base64, "base64url").toString("utf-8");
    const parsed = JSON.parse(json);
    return {
      swipes: Array.isArray(parsed.swipes) ? parsed.swipes : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
    };
  } catch {
    return { swipes: [], messages: [] };
  }
}

export { COOKIE_NAME };
