import { PROFILES, seedProfiles } from "@/features/discover/seed";
import type {
  InternalProfile,
  PublicProfile,
  MatchProfile,
  SwipeResponse,
  MatchesResponse,
} from "@/features/discover/types";
import { getDb, isServerlessMode } from "@/lib/db";
import { SessionData, SessionSwipe } from "@/lib/session";

const DEMO_USER = "demo-user";

export interface ChatMessage {
  id: string;
  matchId: string;
  sender: "user" | "match";
  text: string;
  timestamp: string;
}

export function toPublicProfile(p: {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  location: string;
  interests: string[] | string;
}): PublicProfile {
  const interests = typeof p.interests === "string" ? JSON.parse(p.interests) : p.interests;
  return {
    id: p.id,
    name: p.name,
    age: p.age,
    photo: p.photo,
    bio: p.bio,
    location: p.location,
    interests,
  };
}

type ProfileWithInterests = InternalProfile & { interests: string[] };

export function getAllInternalProfiles(): InternalProfile[] {
  const profileList = PROFILES as unknown as ProfileWithInterests[];
  if (isServerlessMode()) {
    return profileList.map((p) => ({
      id: p.id,
      name: p.name,
      age: p.age,
      photo: p.photo,
      bio: p.bio,
      location: p.location,
      interests: JSON.stringify(p.interests),
      incoming_like: p.incoming_like,
    }));
  }

  const db = getDb();
  if (!db) {
    return profileList.map((p) => ({
      id: p.id,
      name: p.name,
      age: p.age,
      photo: p.photo,
      bio: p.bio,
      location: p.location,
      interests: JSON.stringify(p.interests),
      incoming_like: p.incoming_like,
    }));
  }

  return db.prepare("SELECT * FROM profiles ORDER BY name").all() as InternalProfile[];
}

export function getFeedWithSession(session?: SessionData): { profiles: PublicProfile[]; remaining: number } {
  const allProfiles = getAllInternalProfiles();

  let swipedIds = new Set<string>();

  if (isServerlessMode() || session?.swipes?.length) {
    if (session?.swipes) {
      swipedIds = new Set(session.swipes.map((s) => s.profileId));
    }
  } else {
    const db = getDb();
    if (db) {
      const swipedRows = db.prepare("SELECT profile_id FROM swipes WHERE user_id = ?").all(DEMO_USER) as { profile_id: string }[];
      swipedIds = new Set(swipedRows.map((r) => r.profile_id));
    }
  }

  const available = allProfiles.filter((p) => !swipedIds.has(p.id));
  const publicProfiles: PublicProfile[] = available.map(toPublicProfile);

  return { profiles: publicProfiles, remaining: publicProfiles.length };
}

export function recordSwipeWithSession(
  profileId: string,
  action: "like" | "pass",
  session?: SessionData
): { result: SwipeResponse; updatedSession: SessionData } {
  const allProfiles = getAllInternalProfiles();
  const profile = allProfiles.find((p) => p.id === profileId);

  const currentSession: SessionData = {
    swipes: session?.swipes ? [...session.swipes] : [],
    messages: session?.messages ? [...session.messages] : [],
  };

  if (!profile) {
    return {
      result: { success: false, matched: false, remaining: 0 },
      updatedSession: currentSession,
    };
  }

  let alreadySwiped = currentSession.swipes.some((s) => s.profileId === profileId);
  if (!alreadySwiped && !isServerlessMode()) {
    const db = getDb();
    if (db) {
      const existing = db
        .prepare("SELECT id FROM swipes WHERE user_id = ? AND profile_id = ?")
        .get(DEMO_USER, profileId);
      if (existing) alreadySwiped = true;
    }
  }

  if (alreadySwiped) {
    const feed = getFeedWithSession(currentSession);
    return {
      result: { success: false, matched: false, remaining: feed.remaining },
      updatedSession: currentSession,
    };
  }

  const isMatch = action === "like" && profile.incoming_like === 1;
  const now = new Date().toISOString();

  // Save to session
  const newSwipe: SessionSwipe = {
    profileId,
    action,
    isMatch,
    createdAt: now,
  };
  currentSession.swipes.push(newSwipe);

  // If local DB exists, also persist to SQLite
  if (!isServerlessMode()) {
    const db = getDb();
    if (db) {
      try {
        db.prepare(
          `INSERT OR IGNORE INTO swipes (user_id, profile_id, action, is_match, created_at)
           VALUES (?, ?, ?, ?, ?)`
        ).run(DEMO_USER, profileId, action, isMatch ? 1 : 0, now);
      } catch {
        // Fallback to session if write fails
      }
    }
  }

  const feed = getFeedWithSession(currentSession);

  if (isMatch) {
    const matchProfile: MatchProfile = {
      ...toPublicProfile(profile),
      matchedAt: now,
    };
    return {
      result: {
        success: true,
        matched: true,
        match: matchProfile,
        remaining: feed.remaining,
      },
      updatedSession: currentSession,
    };
  }

  return {
    result: { success: true, matched: false, remaining: feed.remaining },
    updatedSession: currentSession,
  };
}

export function getMatchesWithSession(session?: SessionData): MatchesResponse {
  const allProfiles = getAllInternalProfiles();

  let matchedSwipes: { profileId: string; createdAt: string }[] = [];

  if (isServerlessMode() || session?.swipes?.length) {
    if (session?.swipes) {
      matchedSwipes = session.swipes
        .filter((s) => s.isMatch)
        .map((s) => ({ profileId: s.profileId, createdAt: s.createdAt }));
    }
  } else {
    const db = getDb();
    if (db) {
      const rows = db
        .prepare("SELECT profile_id, created_at FROM swipes WHERE user_id = ? AND is_match = 1 ORDER BY created_at DESC")
        .all(DEMO_USER) as { profile_id: string; created_at: string }[];
      matchedSwipes = rows.map((r) => ({ profileId: r.profile_id, createdAt: r.created_at }));
    }
  }

  const matches: MatchProfile[] = [];
  for (const item of matchedSwipes) {
    const profile = allProfiles.find((p) => p.id === item.profileId);
    if (profile) {
      matches.push({
        ...toPublicProfile(profile),
        matchedAt: item.createdAt,
      });
    }
  }

  return { matches, count: matches.length };
}

export function resetWithSession(): { success: boolean; profileCount: number; updatedSession: SessionData } {
  if (!isServerlessMode()) {
    const db = getDb();
    if (db) {
      db.prepare("DELETE FROM swipes").run();
      db.prepare("DELETE FROM profiles").run();
      seedProfiles();
    }
  }

  return {
    success: true,
    profileCount: PROFILES.length,
    updatedSession: { swipes: [], messages: [] },
  };
}

export function getMessagesWithSession(matchId: string, session?: SessionData): ChatMessage[] {
  if (!session?.messages) return [];
  return session.messages.filter((m) => m.matchId === matchId);
}

export function addMessageWithSession(
  matchId: string,
  text: string,
  session?: SessionData
): { userMsg: ChatMessage; autoReply?: ChatMessage; updatedSession: SessionData } {
  const currentSession: SessionData = {
    swipes: session?.swipes ? [...session.swipes] : [],
    messages: session?.messages ? [...session.messages] : [],
  };

  const userMsg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    matchId,
    sender: "user",
    text,
    timestamp: new Date().toISOString(),
  };
  currentSession.messages.push(userMsg);

  // Generate friendly simulated match reply
  const profile = getAllInternalProfiles().find((p) => p.id === matchId);
  const firstName = profile?.name ? profile.name.split(" ")[0] : "Hey";
  const autoReplies = [
    `Hey! So great connecting with you 😊 Loved your profile! - ${firstName}`,
    `Hi! Finally someone who gets it haha. How's your week going?`,
    `Hey there! I saw we have shared interests, what are you working on lately?`,
  ];
  const replyText = autoReplies[Math.floor(Math.random() * autoReplies.length)];

  const autoReply: ChatMessage = {
    id: `msg-${Date.now() + 1}-${Math.random().toString(36).slice(2, 7)}`,
    matchId,
    sender: "match",
    text: replyText,
    timestamp: new Date(Date.now() + 1000).toISOString(),
  };
  currentSession.messages.push(autoReply);

  return { userMsg, autoReply, updatedSession: currentSession };
}
