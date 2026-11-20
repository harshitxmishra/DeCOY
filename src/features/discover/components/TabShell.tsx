"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface TabShellProps {
  activeTab: "home" | "discover";
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}

export function TabShell({ children, headerRight }: TabShellProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isDiscover = pathname === "/discover";

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col bg-white shadow-xl">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-2.5">
        <h1 className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-xl font-bold tracking-tight text-transparent">
          Coy
        </h1>
        {headerRight}
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {children}
      </main>

      {/* Bottom tab bar */}
      <nav className="flex border-t border-gray-200 bg-white">
        <Link
          href="/"
          className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
            isHome ? "text-pink-600" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isHome ? 2.5 : 1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Home
        </Link>
        <Link
          href="/discover"
          className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
            isDiscover ? "text-pink-600" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isDiscover ? 2.5 : 1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          Discover
        </Link>
      </nav>
    </div>
  );
}
