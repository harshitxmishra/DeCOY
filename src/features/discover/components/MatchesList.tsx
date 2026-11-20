"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { MatchProfile } from "../types";
import { getSharedInterests, generateIcebreakers } from "../icebreakers";
import { MatchChatModal } from "./MatchChatModal";

export function MatchesList() {
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [activeChatMatch, setActiveChatMatch] = useState<MatchProfile | null>(null);

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => r.json())
      .then((data) => {
        setMatches(data.matches || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700">No matches yet</h3>
        <p className="mt-1 text-sm text-gray-400">
          Keep swiping to find your first match!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            {matches.length} {matches.length === 1 ? "Mutual Match" : "Mutual Matches"}
          </h3>
          <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[11px] font-bold text-pink-600">
            100% Reciprocal
          </span>
        </div>

        <div className="space-y-3">
          {matches.map((match) => {
            const shared = getSharedInterests(match.interests);
            const icebreakers = generateIcebreakers(match);
            const isExpanded = expandedMatchId === match.id;

            return (
              <div
                key={match.id}
                className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-xs transition-all hover:shadow-sm"
              >
                <div
                  onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                  className="flex cursor-pointer items-center gap-3 p-3 transition-colors hover:bg-pink-50/40"
                >
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-pink-200">
                    <Image
                      src={match.photo}
                      alt={match.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-gray-900">{match.name}</span>
                      <span className="text-sm text-gray-400">{match.age}</span>
                    </div>
                    <p className="truncate text-xs text-gray-500">{match.bio}</p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-400">
                      <span>{match.location}</span>
                      {shared.length > 0 && (
                        <span className="font-medium text-pink-600">
                          • {shared.length} shared
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveChatMatch(match);
                    }}
                    className="flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-3 text-xs font-semibold text-white shadow-xs hover:opacity-95"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                    <span>Chat</span>
                  </button>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-pink-500">
                    <svg
                      className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Details: Shared Interests & Icebreakers */}
                {isExpanded && (
                  <div className="border-t border-pink-50 bg-gradient-to-b from-pink-50/30 to-purple-50/30 p-3.5">
                    {shared.length > 0 && (
                      <div className="mb-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600">
                          ✨ What You Both Love
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {shared.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-pink-600 shadow-2xs ring-1 ring-pink-100"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                        💬 Tailored Icebreakers
                      </span>
                      <div className="mt-1 space-y-1">
                        {icebreakers.map((prompt, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg bg-white/90 p-2 text-xs italic text-gray-700 shadow-2xs"
                          >
                            {prompt}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {activeChatMatch && (
        <MatchChatModal
          match={activeChatMatch}
          onClose={() => setActiveChatMatch(null)}
        />
      )}
    </div>
  );
}
