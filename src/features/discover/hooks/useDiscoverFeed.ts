"use client";

import { useState, useEffect, useCallback } from "react";
import type { PublicProfile, MatchProfile } from "../types";

export function useDiscoverFeed() {
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [remaining, setRemaining] = useState(0);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/feed");
      const data = await res.json();
      setProfiles(data.profiles || []);
      setRemaining(data.remaining || 0);
    } catch (err) {
      console.error("Failed to fetch feed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const swipe = useCallback(
    async (
      profileId: string,
      action: "like" | "pass"
    ): Promise<{ matched: boolean; match?: MatchProfile }> => {
      try {
        const res = await fetch("/api/swipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId, action }),
        });
        const data = await res.json();
        setRemaining(data.remaining ?? remaining - 1);
        return { matched: data.matched, match: data.match };
      } catch (err) {
        console.error("Swipe failed:", err);
        return { matched: false };
      }
    },
    [remaining]
  );

  const reset = useCallback(async () => {
    try {
      await fetch("/api/reset", { method: "POST" });
      await fetchFeed();
    } catch (err) {
      console.error("Reset failed:", err);
    }
  }, [fetchFeed]);

  return { profiles, loading, remaining, swipe, reset };
}
