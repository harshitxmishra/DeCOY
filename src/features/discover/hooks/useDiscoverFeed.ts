"use client";

import { useState, useEffect, useCallback } from "react";
import type { PublicProfile, MatchProfile } from "../types";
import type { PrivacyTelemetry } from "../components/PrivacyAuditDrawer";

export function useDiscoverFeed() {
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [remaining, setRemaining] = useState(0);
  const [telemetry, setTelemetry] = useState<PrivacyTelemetry | null>(null);

  const inspectPayload = (endpoint: string, sample: unknown) => {
    if (!sample || typeof sample !== "object") return;
    const forbidden = ["incoming_like", "incomingLike", "likedByUser", "liked_by_user", "isMatch"];
    const keys = Object.keys(sample as Record<string, unknown>);
    const leaked = forbidden.filter((f) => f in (sample as Record<string, unknown>));

    setTelemetry({
      endpoint,
      timestamp: new Date().toLocaleTimeString(),
      receivedFields: keys,
      leakedFieldsFound: leaked,
      safeFieldsCount: keys.length,
      rawSample: sample,
    });
  };

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/feed");
      const data = await res.json();
      setProfiles(data.profiles || []);
      setRemaining(data.remaining || 0);

      if (data.profiles && data.profiles.length > 0) {
        inspectPayload("GET /api/feed", data.profiles[0]);
      }
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

        inspectPayload("POST /api/swipe", data);

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

  return { profiles, loading, remaining, telemetry, swipe, reset };
}
