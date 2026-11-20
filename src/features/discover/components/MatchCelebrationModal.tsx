"use client";

import type { MatchProfile } from "../types";
import Image from "next/image";

interface MatchCelebrationModalProps {
  match: MatchProfile;
  onKeepSwiping: () => void;
  onViewMatches: () => void;
}

export function MatchCelebrationModal({
  match,
  onKeepSwiping,
  onViewMatches,
}: MatchCelebrationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm animate-bounce-in rounded-3xl bg-white p-8 text-center shadow-2xl">
        {/* Celebration header */}
        <div className="mb-6">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
            <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <h2 className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-3xl font-black text-transparent">
            It&apos;s a Match!
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            You and {match.name} liked each other
          </p>
        </div>

        {/* Match avatar */}
        <div className="mx-auto mb-6 h-28 w-28 overflow-hidden rounded-full ring-4 ring-pink-200 shadow-lg">
          <Image
            src={match.photo}
            alt={match.name}
            width={112}
            height={112}
            className="h-full w-full object-cover"
          />
        </div>

        <p className="mb-6 text-lg font-semibold text-gray-800">
          {match.name}, {match.age}
        </p>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onViewMatches}
            className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
          >
            View Matches
          </button>
          <button
            onClick={onKeepSwiping}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 font-semibold text-gray-600 transition-all hover:bg-gray-50 active:scale-[0.98]"
          >
            Keep Swiping
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
