"use client";

import type { PublicProfile } from "../types";

export type FilterCategory = "All" | "Tech" | "Music" | "Coffee" | "Creative" | "Fitness";

export const CATEGORY_MAP: Record<FilterCategory, string[]> = {
  All: [],
  Tech: ["tech", "coding", "web dev", "open source", "cloud computing", "machine learning", "physics", "astronomy", "space", "biotechnology"],
  Music: ["music", "indie music", "singing", "guitar", "songwriting", "drums", "jazz", "electronic music", "EDM", "DJing", "music production"],
  Coffee: ["coffee", "chai", "tea"],
  Creative: ["reading", "creative writing", "cinema", "photography", "art", "theatre", "improv", "standup", "sketching", "pottery", "storytelling", "illustration", "comics", "fashion"],
  Fitness: ["yoga", "dance", "hiking", "cycling", "swimming", "basketball", "running", "biking", "football", "badminton", "cricket"],
};

export function matchesCategory(profile: PublicProfile, category: FilterCategory): boolean {
  if (category === "All") return true;
  const keywords = CATEGORY_MAP[category];
  return profile.interests.some((interest) =>
    keywords.some((keyword) => interest.toLowerCase().includes(keyword.toLowerCase()))
  );
}

interface InterestFilterBarProps {
  selectedCategory: FilterCategory;
  onSelectCategory: (category: FilterCategory) => void;
  profiles: PublicProfile[];
}

export function InterestFilterBar({
  selectedCategory,
  onSelectCategory,
  profiles,
}: InterestFilterBarProps) {
  const categories: FilterCategory[] = ["All", "Tech", "Music", "Coffee", "Creative", "Fitness"];

  return (
    <div className="border-b border-gray-100 bg-white/80 px-4 py-2.5 backdrop-blur-sm">
      <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          const count = profiles.filter((p) => matchesCategory(p, category)).length;

          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                isSelected
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm ring-2 ring-pink-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>{category}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  isSelected ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
