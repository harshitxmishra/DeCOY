import { describe, it, expect, beforeEach, afterAll } from "vitest";

// We test the matching service directly (server-side logic)
// This avoids needing HTTP test infrastructure while verifying all core invariants

import { getFeed, recordSwipe, getMatches, resetDemo } from "@/features/discover/matching-service";
import { closeDb } from "@/lib/db";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "coy-discover.db");

function cleanDb() {
  closeDb();
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }
  // Also clean WAL/SHM files
  for (const ext of ["-journal", "-wal", "-shm"]) {
    const p = DB_PATH + ext;
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

describe("Coy Discover — Matching & Privacy", () => {
  beforeEach(() => {
    cleanDb();
  });

  // After all tests, clean up
  afterAll(() => {
    cleanDb();
  });

  it("should seed at least 30 profiles in the feed", () => {
    const feed = getFeed();
    expect(feed.profiles.length).toBeGreaterThanOrEqual(30);
    expect(feed.remaining).toBeGreaterThanOrEqual(30);
  });

  it("should never expose incoming_like in feed responses", () => {
    const feed = getFeed();
    for (const profile of feed.profiles) {
      expect(profile).not.toHaveProperty("incoming_like");
      expect(profile).not.toHaveProperty("likedByUser");
      // Verify only public fields exist
      expect(Object.keys(profile).sort()).toEqual(
        ["age", "bio", "id", "interests", "location", "name", "photo"]
      );
    }
  });

  it("should exclude swiped profiles (like) from subsequent feeds", () => {
    const feed1 = getFeed();
    const profileToLike = feed1.profiles[0];

    recordSwipe(profileToLike.id, "like");

    const feed2 = getFeed();
    const ids = feed2.profiles.map((p) => p.id);
    expect(ids).not.toContain(profileToLike.id);
    expect(feed2.remaining).toBe(feed1.remaining - 1);
  });

  it("should exclude swiped profiles (pass) from subsequent feeds", () => {
    const feed1 = getFeed();
    const profileToPass = feed1.profiles[1];

    recordSwipe(profileToPass.id, "pass");

    const feed2 = getFeed();
    const ids = feed2.profiles.map((p) => p.id);
    expect(ids).not.toContain(profileToPass.id);
  });

  it("should return matched: false for a non-mutual like", () => {
    const feed = getFeed();
    // Find a profile that is NOT a pre-seeded liker (p10 onwards)
    const nonLiker = feed.profiles.find((p) => p.id === "p10");
    expect(nonLiker).toBeDefined();

    const result = recordSwipe(nonLiker!.id, "like");
    expect(result.matched).toBe(false);
    expect(result.match).toBeUndefined();
  });

  it("should return matched: true for a mutual like (pre-seeded liker)", () => {
    // p01 through p09 have incoming_like = 1
    const result = recordSwipe("p01", "like");
    expect(result.success).toBe(true);
    expect(result.matched).toBe(true);
    expect(result.match).toBeDefined();
    expect(result.match!.id).toBe("p01");
    expect(result.match!.name).toBe("Ananya Sharma");
    // Match should NOT contain incoming_like
    expect(result.match).not.toHaveProperty("incoming_like");
  });

  it("should NOT create a match when passing on a pre-seeded liker", () => {
    const result = recordSwipe("p02", "pass");
    expect(result.matched).toBe(false);
    expect(result.match).toBeUndefined();
  });

  it("should list mutual matches via getMatches()", () => {
    // Like two pre-seeded likers
    recordSwipe("p03", "like");
    recordSwipe("p04", "like");

    // Pass on another pre-seeded liker
    recordSwipe("p05", "pass");

    // Like a non-liker
    recordSwipe("p10", "like");

    const matches = getMatches();
    expect(matches.count).toBe(2);

    const matchIds = matches.matches.map((m) => m.id);
    expect(matchIds).toContain("p03");
    expect(matchIds).toContain("p04");
    expect(matchIds).not.toContain("p05"); // passed
    expect(matchIds).not.toContain("p10"); // non-mutual
  });

  it("should never expose incoming_like in match responses", () => {
    recordSwipe("p01", "like");
    const matches = getMatches();
    for (const match of matches.matches) {
      expect(match).not.toHaveProperty("incoming_like");
      expect(match).not.toHaveProperty("likedByUser");
    }
  });

  it("should handle duplicate swipe gracefully", () => {
    recordSwipe("p01", "like");
    const result = recordSwipe("p01", "like");
    expect(result.success).toBe(false);
  });

  it("should reset demo state cleanly", () => {
    // Make some swipes
    recordSwipe("p01", "like");
    recordSwipe("p10", "pass");

    // Reset
    const resetResult = resetDemo();
    expect(resetResult.success).toBe(true);
    expect(resetResult.profileCount).toBe(32);

    // Feed should be full again
    const feed = getFeed();
    expect(feed.remaining).toBe(32);

    // Matches should be empty
    const matches = getMatches();
    expect(matches.count).toBe(0);
  });

  it("should persist swipes across DB re-initialization", () => {
    recordSwipe("p01", "like");
    recordSwipe("p10", "pass");

    // Close and re-open DB (simulates server restart)
    closeDb();

    const feed = getFeed();
    const feedIds = feed.profiles.map((p) => p.id);
    expect(feedIds).not.toContain("p01");
    expect(feedIds).not.toContain("p10");

    const matches = getMatches();
    expect(matches.count).toBe(1);
    expect(matches.matches[0].id).toBe("p01");
  });
});
