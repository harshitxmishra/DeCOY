# AGENTS.md — Coy Discover Repository Rules

> Shared autonomous-agent instructions for **Antigravity** and **Google Jules**.
> Every agent working on this repository MUST read and follow these rules.

---

## 1. Project Overview

**Coy Discover** is a standalone mobile-first "Discover" tab application for the Coy SDE Intern Assignment (Part B).
It implements a swipe-based mutual-match system where **likes stay private until they're mutual** — the core promise of Coy.

| Stack         | Choice                                      |
|--------------|----------------------------------------------|
| Framework    | Next.js 15 (App Router)                       |
| Language     | TypeScript (strict)                            |
| Styling      | Tailwind CSS v4                               |
| Database     | SQLite via `better-sqlite3`                   |
| Testing      | Vitest                                         |
| Auth         | Single demo user (`demo-user`), no external auth |

---

## 2. Repository Layout

```
├── AGENTS.md                                # THIS FILE — agent rules
├── README.md                                # Setup docs & API contract
├── PART_A_NOTES.md                          # Part A feature proposals
├── package.json / tsconfig.json / next.config.ts
├── .github/workflows/ci.yml                 # CI pipeline
├── data/                                    # SQLite DB (gitignored at runtime)
├── public/avatars/                          # 32 local SVG portraits
└── src/
    ├── app/
    │   ├── layout.tsx                       # Root layout
    │   ├── page.tsx                         # Home tab (blank)
    │   ├── discover/page.tsx                # Discover tab
    │   └── api/{feed,swipe,matches,reset}/route.ts
    ├── features/discover/
    │   ├── types.ts                         # Public & internal types
    │   ├── seed.ts                          # 32-profile idempotent seeder
    │   ├── matching-service.ts              # Core business logic
    │   ├── components/                      # React UI components
    │   └── hooks/useDiscoverFeed.ts         # Client-side hook
    ├── lib/db.ts                            # SQLite connection & schema
    └── tests/matching-privacy.test.ts       # Automated invariant tests
```

---

## 3. Build, Lint & Test Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build && npm start

# Type-check
npx tsc --noEmit

# Lint
npm run lint

# Run tests
npm test

# Reset demo data (via API)
curl -X POST http://localhost:3000/api/reset
```

---

## 4. Database Rules

- SQLite file lives at `data/coy-discover.db` (gitignored).
- Schema is auto-created on first DB access via `src/lib/db.ts`.
- Seeding is **idempotent** — `seedProfiles()` only inserts if < 32 profiles exist.
- `POST /api/reset` wipes swipes + profiles, then re-seeds.
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
