import { getDb, transaction } from "@/lib/db";
import { seedProfiles } from "./seed";
import type {
  PublicProfile,
  MatchProfile,
  FeedResponse,
  SwipeResponse,
  MatchesResponse,
  InternalProfile,
} from "./types";

const DEMO_USER = "demo-user";

/** Ensure DB is seeded before any query */
function ensureSeeded(): void {
  seedProfiles();
}

/**
 * Sanitize an internal profile to a public one.
 * CRITICAL: strips incoming_like and any server-only fields.
 */
function toPublicProfile(p: InternalProfile): PublicProfile {
  return {
    id: p.id,
    name: p.name,
    age: p.age,
    photo: p.photo,
    bio: p.bio,
    location: p.location,
    interests: JSON.parse(p.interests),
  };
}

/** GET /api/feed — returns unswiped profiles, never leaking incoming_like */
export function getFeed(): FeedResponse {
  ensureSeeded();
  const db = getDb();

  const rows = db
    .prepare(
      `SELECT p.id, p.name, p.age, p.photo, p.bio, p.location, p.interests
       FROM profiles p
       WHERE p.id NOT IN (
         SELECT profile_id FROM swipes WHERE user_id = ?
       )
       ORDER BY p.name`
    )
    .all(DEMO_USER) as InternalProfile[];

  // Note: the SQL already excludes incoming_like from SELECT
  const profiles: PublicProfile[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    age: r.age,
    photo: r.photo,
    bio: r.bio,
    location: r.location,
    interests: JSON.parse(r.interests),
  }));

  return { profiles, remaining: profiles.length };
}

/** POST /api/swipe — record a swipe, check for mutual match */
export function recordSwipe(
  profileId: string,
  action: "like" | "pass"
): SwipeResponse {
  ensureSeeded();

  return transaction(() => {
    const db = getDb();

    // Verify profile exists
    const profile = db
      .prepare("SELECT * FROM profiles WHERE id = ?")
      .get(profileId) as InternalProfile | undefined;

    if (!profile) {
      return { success: false, matched: false, remaining: 0 };
    }

    // Check if already swiped
    const existing = db
      .prepare(
        "SELECT id FROM swipes WHERE user_id = ? AND profile_id = ?"
      )
      .get(DEMO_USER, profileId);

    if (existing) {
      // Count remaining
      const remaining = db
        .prepare(
          `SELECT COUNT(*) as cnt FROM profiles
           WHERE id NOT IN (SELECT profile_id FROM swipes WHERE user_id = ?)`
        )
        .get(DEMO_USER) as { cnt: number };
      return { success: false, matched: false, remaining: remaining.cnt };
    }

    // Determine if mutual match: action is "like" AND profile has incoming_like
    const isMatch = action === "like" && profile.incoming_like === 1 ? 1 : 0;

    db.prepare(
      `INSERT INTO swipes (user_id, profile_id, action, is_match)
       VALUES (?, ?, ?, ?)`
    ).run(DEMO_USER, profileId, action, isMatch);

    // Count remaining
    const remaining = db
      .prepare(
        `SELECT COUNT(*) as cnt FROM profiles
         WHERE id NOT IN (SELECT profile_id FROM swipes WHERE user_id = ?)`
      )
      .get(DEMO_USER) as { cnt: number };

    if (isMatch) {
      const matchProfile: MatchProfile = {
        ...toPublicProfile(profile),
        matchedAt: new Date().toISOString(),
      };
      return {
        success: true,
        matched: true,
        match: matchProfile,
        remaining: remaining.cnt,
      };
    }

    return { success: true, matched: false, remaining: remaining.cnt };
  });
}

/** GET /api/matches — returns all mutual matches, never leaking non-mutual likes */
export function getMatches(): MatchesResponse {
  ensureSeeded();
  const db = getDb();

  const rows = db
    .prepare(
      `SELECT p.id, p.name, p.age, p.photo, p.bio, p.location, p.interests, s.created_at
       FROM swipes s
       JOIN profiles p ON p.id = s.profile_id
       WHERE s.user_id = ? AND s.is_match = 1
       ORDER BY s.created_at DESC`
    )
    .all(DEMO_USER) as (InternalProfile & { created_at: string })[];

  const matches: MatchProfile[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    age: r.age,
    photo: r.photo,
    bio: r.bio,
    location: r.location,
    interests: JSON.parse(r.interests),
    matchedAt: r.created_at,
  }));

  return { matches, count: matches.length };
}

/** POST /api/reset — wipe all swipes and re-seed */
export function resetDemo(): { success: boolean; profileCount: number } {
  const db = getDb();
  db.prepare("DELETE FROM swipes").run();
  db.prepare("DELETE FROM profiles").run();
  seedProfiles();

  const count = db.prepare("SELECT COUNT(*) as cnt FROM profiles").get() as {
    cnt: number;
  };
  return { success: true, profileCount: count.cnt };
}
