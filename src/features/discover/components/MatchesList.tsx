"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { MatchProfile } from "../types";

export function MatchesList() {
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);

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
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          {matches.length} {matches.length === 1 ? "Match" : "Matches"}
        </h3>
        <div className="space-y-3">
          {matches.map((match) => (
            <div
              key={match.id}
              className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 p-3 shadow-sm ring-1 ring-pink-100"
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
                  <span className="font-semibold text-gray-900">{match.name}</span>
                  <span className="text-sm text-gray-400">{match.age}</span>
                </div>
                <p className="truncate text-sm text-gray-500">{match.bio}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {match.location}
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
                <svg className="h-5 w-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
