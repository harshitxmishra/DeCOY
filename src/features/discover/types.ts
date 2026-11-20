// ─── Public types (safe for client consumption) ───

export interface PublicProfile {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  location: string;
  interests: string[];
}

export interface MatchProfile extends PublicProfile {
  matchedAt: string; // ISO timestamp
}

export interface FeedResponse {
  profiles: PublicProfile[];
  remaining: number;
}

export interface SwipeRequest {
  profileId: string;
  action: "like" | "pass";
}

export interface SwipeResponse {
  success: boolean;
  matched: boolean;
  match?: MatchProfile;
  remaining: number;
}

export interface MatchesResponse {
  matches: MatchProfile[];
  count: number;
}

// ─── Internal server-only types (NEVER sent to client) ───

export interface InternalProfile {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  location: string;
  interests: string; // JSON-serialized array in DB
  incoming_like: number; // 0 or 1 — NEVER expose to client
}

export interface SwipeRecord {
  id: number;
  user_id: string;
  profile_id: string;
  action: "like" | "pass";
  is_match: number; // 0 or 1
  created_at: string;
}
