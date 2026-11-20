"use client";

interface EmptyFeedStateProps {
  onReset: () => Promise<void>;
}

export function EmptyFeedState({ onReset }: EmptyFeedStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100">
        <svg className="h-10 w-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-700">
        You&apos;ve seen everyone!
      </h3>
      <p className="mt-2 text-sm text-gray-400">
        No more profiles to discover right now. Check back later or reset the demo.
      </p>
      <button
        onClick={onReset}
        className="mt-6 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
      >
        Reset Demo
      </button>
    </div>
  );
}
