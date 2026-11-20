"use client";

import type { PublicProfile, MatchProfile } from "../types";
import { ProfileCard } from "./ProfileCard";
import { EmptyFeedState } from "./EmptyFeedState";
import { InterestFilterBar, FilterCategory, matchesCategory } from "./InterestFilterBar";
import { useRef, useState, useCallback, useMemo, useEffect } from "react";

interface SwipeDeckProps {
  profiles: PublicProfile[];
  loading: boolean;
  onSwipe: (profileId: string, action: "like" | "pass") => Promise<{ matched: boolean; match?: MatchProfile }>;
  onMatch: (match: MatchProfile) => void;
  onReset: () => Promise<void>;
  remaining: number;
}

export function SwipeDeck({ profiles, loading, onSwipe, onMatch, onReset, remaining: _remaining }: SwipeDeckProps) {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("All");
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  const [swiping, setSwiping] = useState(false);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Available unswiped profiles
  const unswipedProfiles = useMemo(
    () => profiles.filter((p) => !swipedIds.has(p.id)),
    [profiles, swipedIds]
  );

  // Filtered by selected interest category
  const filteredProfiles = useMemo(
    () => unswipedProfiles.filter((p) => matchesCategory(p, selectedCategory)),
    [unswipedProfiles, selectedCategory]
  );

  const currentProfile = filteredProfiles[0];

  const handleSwipe = useCallback(async (action: "like" | "pass") => {
    if (swiping || !currentProfile) return;
    setSwiping(true);
    setExitDirection(action === "like" ? "right" : "left");

    // Wait for exit animation
    await new Promise((r) => setTimeout(r, 300));

    const result = await onSwipe(currentProfile.id, action);

    setSwipedIds((prev) => new Set([...prev, currentProfile.id]));
    setExitDirection(null);
    setDragOffset(0);
    setSwiping(false);

    if (result.matched && result.match) {
      onMatch(result.match);
    }
  }, [swiping, currentProfile, onSwipe, onMatch]);

  // Keyboard navigation for desktop power users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleSwipe("pass");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleSwipe("like");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSwipe]);

  // Pointer/touch gesture handling
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (swiping) return;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [swiping]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current || swiping) return;
    const dx = e.clientX - dragStartRef.current.x;
    setDragOffset(dx);
  }, [swiping]);

  const handlePointerUp = useCallback(() => {
    if (!dragStartRef.current) return;
    const threshold = 100;
    if (dragOffset > threshold) {
      handleSwipe("like");
    } else if (dragOffset < -threshold) {
      handleSwipe("pass");
    } else {
      setDragOffset(0);
    }
    dragStartRef.current = null;
  }, [dragOffset, handleSwipe]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
      </div>
    );
  }

  if (unswipedProfiles.length === 0) {
    return <EmptyFeedState onReset={onReset} />;
  }

  // Calculate visual transform based on drag
  const rotation = dragOffset * 0.1;
  const opacity = Math.max(0.5, 1 - Math.abs(dragOffset) / 400);
  const likeOpacity = Math.min(1, Math.max(0, dragOffset / 150));
  const passOpacity = Math.min(1, Math.max(0, -dragOffset / 150));

  let transform = `translateX(${dragOffset}px) rotate(${rotation}deg)`;
  if (exitDirection === "right") transform = "translateX(120%) rotate(20deg)";
  if (exitDirection === "left") transform = "translateX(-120%) rotate(-20deg)";

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Category filter chips */}
      <InterestFilterBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        profiles={unswipedProfiles}
      />

      {!currentProfile ? (
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <div className="mb-3 rounded-full bg-pink-50 p-4 text-pink-500">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h4 className="text-base font-bold text-gray-800">No {selectedCategory} profiles left</h4>
          <p className="mt-1 text-xs text-gray-500">
            You&apos;ve swiped through all profiles matching this interest.
          </p>
          <button
            onClick={() => setSelectedCategory("All")}
            className="mt-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-95"
          >
            Show All Profiles ({unswipedProfiles.length})
          </button>
        </div>
      ) : (
        <>
          {/* Card area */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-4">
            <div
              ref={cardRef}
              className="relative w-full max-w-sm cursor-grab select-none active:cursor-grabbing"
              style={{
                transform,
                opacity: exitDirection ? 0 : opacity,
                transition: exitDirection || dragOffset === 0 ? "all 0.3s ease-out" : "none",
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {/* Swipe direction indicators */}
              <div
                className="pointer-events-none absolute left-4 top-6 z-10 rounded-lg border-4 border-green-500 px-4 py-2 font-black text-green-500"
                style={{
                  opacity: likeOpacity,
                  transform: `rotate(-20deg) scale(${0.8 + likeOpacity * 0.2})`,
                }}
              >
                LIKE
              </div>
              <div
                className="pointer-events-none absolute right-4 top-6 z-10 rounded-lg border-4 border-red-400 px-4 py-2 font-black text-red-400"
                style={{
                  opacity: passOpacity,
                  transform: `rotate(20deg) scale(${0.8 + passOpacity * 0.2})`,
                }}
              >
                PASS
              </div>

              <ProfileCard profile={currentProfile} />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col items-center gap-1.5 pb-3">
            <div className="flex items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handleSwipe("pass")}
                  disabled={swiping}
                  className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-200 bg-white text-red-400 shadow-md transition-all hover:scale-110 hover:bg-red-50 hover:shadow-lg active:scale-95 disabled:opacity-50"
                  aria-label="Pass"
                >
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <span className="hidden text-[10px] text-gray-400 sm:block">
                  Pass <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.2 text-[9px]">←</kbd>
                </span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handleSwipe("like")}
                  disabled={swiping}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-95 disabled:opacity-50"
                  aria-label="Like"
                >
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
                <span className="hidden text-[10px] text-gray-400 sm:block">
                  Like <kbd className="rounded border border-pink-200 bg-pink-50 px-1 py-0.2 text-[9px] text-pink-600">→</kbd>
                </span>
              </div>
            </div>

            <span className="text-[11px] text-gray-400">
              {filteredProfiles.length} {filteredProfiles.length === 1 ? "profile" : "profiles"} left in {selectedCategory}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
