"use client";

import { TabShell } from "@/features/discover/components/TabShell";
import { SwipeDeck } from "@/features/discover/components/SwipeDeck";
import { MatchesList } from "@/features/discover/components/MatchesList";
import { MatchCelebrationModal } from "@/features/discover/components/MatchCelebrationModal";
import { PrivacyAuditDrawer } from "@/features/discover/components/PrivacyAuditDrawer";
import { useDiscoverFeed } from "@/features/discover/hooks/useDiscoverFeed";
import { useState } from "react";
import type { MatchProfile } from "@/features/discover/types";

export default function DiscoverPage() {
  const [view, setView] = useState<"swipe" | "matches">("swipe");
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [newMatch, setNewMatch] = useState<MatchProfile | null>(null);
  const feed = useDiscoverFeed();

  const handleMatch = (match: MatchProfile) => {
    setNewMatch(match);
    setShowMatchModal(true);
  };

  return (
    <TabShell
      activeTab="discover"
      headerRight={<PrivacyAuditDrawer telemetry={feed.telemetry} />}
    >
      {/* Sub-navigation: Swipe / Matches toggle */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setView("swipe")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            view === "swipe"
              ? "border-b-2 border-pink-500 text-pink-600"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Discover
        </button>
        <button
          onClick={() => setView("matches")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
            view === "matches"
              ? "border-b-2 border-pink-500 text-pink-600"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Matches
        </button>
      </div>

      {view === "swipe" ? (
        <SwipeDeck
          profiles={feed.profiles}
          loading={feed.loading}
          onSwipe={feed.swipe}
          onMatch={handleMatch}
          onReset={feed.reset}
          remaining={feed.remaining}
        />
      ) : (
        <MatchesList />
      )}

      {showMatchModal && newMatch && (
        <MatchCelebrationModal
          match={newMatch}
          onKeepSwiping={() => {
            setShowMatchModal(false);
            setNewMatch(null);
          }}
          onViewMatches={() => {
            setShowMatchModal(false);
            setNewMatch(null);
            setView("matches");
          }}
        />
      )}
    </TabShell>
  );
}
