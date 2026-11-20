"use client";

import type { PublicProfile, MatchProfile } from "../types";
import { ProfileCard } from "./ProfileCard";
import { EmptyFeedState } from "./EmptyFeedState";
import { useRef, useState, useCallback } from "react";

interface SwipeDeckProps {
  profiles: PublicProfile[];
  loading: boolean;
  onSwipe: (profileId: string, action: "like" | "pass") => Promise<{ matched: boolean; match?: MatchProfile }>;
  onMatch: (match: MatchProfile) => void;
  onReset: () => Promise<void>;
  remaining: number;
}

export function SwipeDeck({ profiles, loading, onSwipe, onMatch, onReset, remaining: _remaining }: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentProfile = profiles[currentIndex];

  const handleSwipe = useCallback(async (action: "like" | "pass") => {
    if (swiping || !currentProfile) return;
    setSwiping(true);
    setExitDirection(action === "like" ? "right" : "left");

    // Wait for exit animation
    await new Promise((r) => setTimeout(r, 300));

    const result = await onSwipe(currentProfile.id, action);

    setExitDirection(null);
    setDragOffset(0);
    setCurrentIndex((prev) => prev + 1);
    setSwiping(false);

    if (result.matched && result.match) {
      onMatch(result.match);
    }
  }, [swiping, currentProfile, onSwipe, onMatch]);

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

  if (!currentProfile || currentIndex >= profiles.length) {
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
    <div className="flex flex-1 flex-col">
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

        {/* Remaining count */}
        <div className="absolute bottom-2 right-4 text-xs text-gray-300">
          {profiles.length - currentIndex} remaining
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-6 pb-4">
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
      </div>
    </div>
  );
}
