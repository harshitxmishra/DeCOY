import { seedProfiles } from "./seed";
import type {
  FeedResponse,
  SwipeResponse,
  MatchesResponse,
} from "./types";
import {
  getFeedWithSession,
  recordSwipeWithSession,
  getMatchesWithSession,
  resetWithSession,
  getMessagesWithSession,
  addMessageWithSession,
  toPublicProfile,
  getAllInternalProfiles,
  ChatMessage,
} from "@/lib/storage/adapter";
import { SessionData } from "@/lib/session";
import { getDb, isServerlessMode } from "@/lib/db";

/** Ensure DB is seeded before any query if not serverless */
function ensureSeeded(): void {
  if (!isServerlessMode() && getDb()) {
    seedProfiles();
  }
}

/** GET /api/feed — returns unswiped profiles, never leaking incoming_like */
export function getFeed(session?: SessionData): FeedResponse {
  ensureSeeded();
  return getFeedWithSession(session);
}

/** POST /api/swipe — record a swipe, check for mutual match */
export function recordSwipe(
  profileId: string,
  action: "like" | "pass",
  session?: SessionData
): SwipeResponse & { updatedSession?: SessionData } {
  ensureSeeded();
  const { result, updatedSession } = recordSwipeWithSession(profileId, action, session);
  return {
    ...result,
    updatedSession,
  };
}

/** GET /api/matches — returns all mutual matches, never leaking non-mutual likes */
export function getMatches(session?: SessionData): MatchesResponse {
  ensureSeeded();
  return getMatchesWithSession(session);
}

/** POST /api/reset — wipe all swipes and re-seed */
export function resetDemo(_session?: SessionData): { success: boolean; profileCount: number; updatedSession?: SessionData } {
  const result = resetWithSession();
  return {
    success: result.success,
    profileCount: result.profileCount,
    updatedSession: result.updatedSession,
  };
}

/** Get simulated chat messages for a match */
export function getMatchMessages(matchId: string, session?: SessionData): ChatMessage[] {
  return getMessagesWithSession(matchId, session);
}

/** Send message to a match */
export function sendMatchMessage(
  matchId: string,
  text: string,
  session?: SessionData
): { userMsg: ChatMessage; autoReply?: ChatMessage; updatedSession: SessionData } {
  return addMessageWithSession(matchId, text, session);
}

export { toPublicProfile, getAllInternalProfiles };
