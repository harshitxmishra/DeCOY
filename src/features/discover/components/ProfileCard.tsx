"use client";

import type { PublicProfile } from "../types";
import Image from "next/image";

interface ProfileCardProps {
  profile: PublicProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-100">
      {/* Avatar */}
      <div className="relative flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-6">
        <div className="relative h-48 w-48 overflow-hidden rounded-full ring-4 ring-white/80 shadow-inner">
          <Image
            src={profile.photo}
            alt={profile.name}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Info */}
      <div className="px-5 pb-5 pt-4">
        <div className="flex items-baseline gap-2">
          <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
          <span className="text-lg text-gray-400">{profile.age}</span>
        </div>

        <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {profile.location}
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-600">{profile.bio}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {profile.interests.map((interest) => (
            <span
              key={interest}
              className="rounded-full bg-pink-50 px-2.5 py-1 text-xs font-medium text-pink-600"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
