import { describe, it, expect, beforeEach, afterAll } from "vitest";

// We test the matching service directly (server-side logic)
// This avoids needing HTTP test infrastructure while verifying all core invariants

import { getFeed, recordSwipe, getMatches, resetDemo } from "@/features/discover/matching-service";
import { matchesCategory, FilterCategory } from "@/features/discover/components/InterestFilterBar";
import { getSharedInterests, generateIcebreakers } from "@/features/discover/icebreakers";
import { parseSession, serializeSession, SessionData } from "@/lib/session";
import {
  getFeedWithSession,
  recordSwipeWithSession,
  getMatchesWithSession,
} from "@/lib/storage/adapter";
import { resetDb, closeDb } from "@/lib/db";
import { seedProfiles } from "@/features/discover/seed";

function resetTestState() {
  resetDb();
  seedProfiles();
}

describe("Coy Discover — Matching & Privacy", () => {
  beforeEach(() => {
    resetTestState();
  });

  afterAll(() => {
    closeDb();
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
    recordSwipe("p03", "like");
    recordSwipe("p04", "like");
    recordSwipe("p05", "pass");
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
    recordSwipe("p01", "like");
    recordSwipe("p10", "pass");

    const resetResult = resetDemo();
    expect(resetResult.success).toBe(true);
    expect(resetResult.profileCount).toBe(32);

    const feed = getFeed();
    expect(feed.remaining).toBe(32);

    const matches = getMatches();
    expect(matches.count).toBe(0);
  });

  it("should persist swipes across DB re-initialization", () => {
    recordSwipe("p01", "like");
    recordSwipe("p10", "pass");

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

describe("Coy Discover — Standout Features & Serverless Adapter", () => {
  beforeEach(() => {
    resetTestState();
  });
  it("should filter profiles correctly by interest category", () => {
    const feed = getFeed();

    // Category: Tech
    const techProfiles = feed.profiles.filter((p) => matchesCategory(p, "Tech"));
    expect(techProfiles.length).toBeGreaterThan(0);
    for (const p of techProfiles) {
      expect(
        p.interests.some((i) =>
          ["tech", "coding", "web dev", "open source", "cloud computing", "machine learning", "physics", "astronomy", "space", "biotechnology"].some((k) =>
            i.toLowerCase().includes(k)
          )
        )
      ).toBe(true);
    }

    // Category: Coffee
    const coffeeProfiles = feed.profiles.filter((p) => matchesCategory(p, "Coffee"));
    expect(coffeeProfiles.length).toBeGreaterThan(0);
    for (const p of coffeeProfiles) {
      expect(
        p.interests.some((i) =>
          ["coffee", "chai", "tea"].some((k) => i.toLowerCase().includes(k))
        )
      ).toBe(true);
    }

    // Category: All
    const allProfiles = feed.profiles.filter((p) => matchesCategory(p, "All" as FilterCategory));
    expect(allProfiles.length).toBe(feed.profiles.length);
  });

  it("should compute shared interests and generate tailored mutual icebreakers", () => {
    const sampleProfile = {
      name: "Ananya Sharma",
      location: "Delhi University",
      interests: ["coffee", "indie music", "reading", "creative writing"],
    };

    const shared = getSharedInterests(sampleProfile.interests);
    expect(shared).toContain("coffee");
    expect(shared).toContain("indie music");

    const icebreakers = generateIcebreakers(sampleProfile);
    expect(icebreakers.length).toBe(2);
    expect(icebreakers[0]).toContain("coffee");
  });

  it("should serialize and deserialize session state with signature verification", () => {
    const session: SessionData = {
      swipes: [
        { profileId: "p01", action: "like", isMatch: true, createdAt: new Date().toISOString() },
        { profileId: "p10", action: "pass", isMatch: false, createdAt: new Date().toISOString() },
      ],
      messages: [
        { id: "m1", matchId: "p01", sender: "user", text: "Hey Ananya!", timestamp: new Date().toISOString() },
      ],
    };

    const encoded = serializeSession(session);
    expect(typeof encoded).toBe("string");
    expect(encoded).toContain(".");

    const decoded = parseSession(encoded);
    expect(decoded.swipes.length).toBe(2);
    expect(decoded.messages.length).toBe(1);
    expect(decoded.swipes[0].profileId).toBe("p01");
    expect(decoded.messages[0].text).toBe("Hey Ananya!");

    // Tampered payload fails verification
    const tampered = "tampered_payload." + encoded.split(".")[1];
    const invalid = parseSession(tampered);
    expect(invalid.swipes).toEqual([]);
  });

  it("should operate in stateless serverless mode without database writes", () => {
    let session: SessionData = { swipes: [], messages: [] };

    // Record swipe in session
    const swipe1 = recordSwipeWithSession("p01", "like", session);
    expect(swipe1.result.matched).toBe(true);
    session = swipe1.updatedSession;
    expect(session.swipes.length).toBe(1);

    // Feed with session excludes swiped profile
    const feed = getFeedWithSession(session);
    expect(feed.profiles.some((p) => p.id === "p01")).toBe(false);

    // Matches with session extracts mutual match
    const matches = getMatchesWithSession(session);
    expect(matches.count).toBe(1);
    expect(matches.matches[0].id).toBe("p01");

    // Zero leakage verification on session models
    for (const match of matches.matches) {
      expect(match).not.toHaveProperty("incoming_like");
    }
  });
});
