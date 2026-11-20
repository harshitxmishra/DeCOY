# AGENTS.md — Coy Discover Repository Rules

> Autonomous-agent instructions for **Antigravity** (and legacy/read-only Google Jules context).
> Every agent working on this repository MUST read and follow these rules.

---

## 1. Project Overview

**Coy Discover** is a standalone mobile-first "Discover" tab application for the Coy SDE Intern Assignment (Part B).
It implements a swipe-based mutual-match system where **likes stay private until they're mutual** — the core promise of Coy.

| Stack         | Choice                                      |
|--------------|----------------------------------------------|
| Framework    | Next.js 16 (App Router)                       |
| Language     | TypeScript (strict)                            |
| Styling      | Tailwind CSS v4                               |
| Database     | SQLite via `better-sqlite3` (WAL mode)         |
| Testing      | Vitest                                         |
| Auth         | Single demo user (`demo-user`), no external auth |

---

## 2. Repository Layout

```
├── AGENTS.md                                # THIS FILE — agent rules & guidelines
├── README.md                                # Setup docs, API contract & privacy architecture
├── PART_A_NOTES.md                          # Part A teardown & 2 core feature proposals
├── package.json / tsconfig.json / next.config.ts
├── .github/workflows/ci.yml                 # CI pipeline (lint, tsc, test, build)
├── data/
│   └── .gitkeep                             # SQLite DB (coy-discover.db gitignored)
├── public/avatars/                          # 32 local SVG portraits (01.svg – 32.svg)
└── src/
    ├── app/
    │   ├── layout.tsx                       # Root layout & font
    │   ├── page.tsx                         # Home tab (intentionally blank per spec)
    │   ├── discover/page.tsx                # Discover tab (swipe deck, match modal, matches)
    │   └── api/{feed,swipe,matches,reset}/route.ts
    ├── features/discover/
    │   ├── types.ts                         # Public (safe) & internal server-only types
    │   ├── seed.ts                          # 32-profile idempotent seeder (9 pre-seeded likers)
    │   ├── matching-service.ts              # Core matching logic & privacy sanitization
    │   ├── components/                      # React UI components (SwipeDeck, ProfileCard, etc.)
    │   └── hooks/useDiscoverFeed.ts         # Client-side feed & swipe hook
    ├── lib/db.ts                            # SQLite connection, schema init, WAL mode
    └── tests/
        ├── matching-privacy.test.ts         # 12 automated invariant tests
        └── setup.ts                         # Test runner setup
```

---

## 3. Build, Lint & Test Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build & start
npm run build && npm start

# Type-check
npx tsc --noEmit

# Lint
npm run lint

# Run all automated tests
npm test

# Reset demo data (via API)
curl -X POST http://localhost:3000/api/reset
```

---

## 4. Database Rules

- SQLite file lives at `data/coy-discover.db` (gitignored).
- Schema is auto-created on first DB access via `src/lib/db.ts`.
- Seeding is **idempotent** — `seedProfiles()` only inserts if < 32 profiles exist.
- `POST /api/reset` (and `/reset` rewrite) wipes swipes + profiles, then re-seeds.
- Always use `WAL` journal mode for concurrent read safety.
- Use transactions for any multi-statement write operation.

---

## 5. Privacy Invariants (CRITICAL — NEVER VIOLATE)

> These are the **non-negotiable rules** that protect Coy's core mutual-match promise.

1. **`incoming_like` is a server-only field.** It MUST NEVER appear in any API response (`GET /api/feed`, `POST /api/swipe`, `GET /api/matches`), any client-side type, or any React component prop.

2. **A match occurs ONLY when:** a profile has `incoming_like = 1` **AND** the demo user swipes `like` on that profile.

3. **`GET /api/feed`** returns profiles with ONLY these fields: `id`, `name`, `age`, `photo`, `bio`, `location`, `interests`. No `incoming_like`, no `likedByUser`, no match hints.

4. **`GET /api/matches`** returns ONLY mutual matches. Never include one-sided likes.

5. **`POST /api/swipe`** response includes `matched: true` ONLY for mutual matches.

6. **Automated tests** in `src/tests/matching-privacy.test.ts` verify all these invariants. All tests MUST pass before any PR merge.

---

## 6. Coding Standards

- **TypeScript strict mode** — no `any` unless absolutely necessary.
- **Feature-first folder structure** — all Discover logic lives under `src/features/discover/`.
- **Server vs client** — API routes and matching-service are server-only. Components marked `"use client"`.
- **No external image URLs** — all avatars are local SVGs under `public/avatars/`.
- **Mobile-first** — design for 375px+ screens, responsive up to desktop.

---

## 7. Git Conventions

- Branch naming: `feature/<name>`, `fix/<name>`, `chore/<name>`
- Commit messages: conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`)
- CI must pass (typecheck + lint + tests + build) before merge.

---

## 8. Agent Workflow

When making changes to this repo:

1. Read this `AGENTS.md` first.
2. Make your changes.
3. Run `npx tsc --noEmit && npm run lint && npm test && npm run build`.
4. Fix any failures before committing.
5. Never bypass or weaken privacy invariant tests.
