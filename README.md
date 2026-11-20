# Coy Discover — Standalone Discover Tab (SDE Intern Assignment)

A production-grade, mobile-first **Discover tab** dating application built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **Vercel-Safe Dual-Mode Persistence** (Local SQLite + Serverless State Adapter + libSQL/Turso ready).

Implements the foundational promise of Coy: **likes stay private until they're mutual**.

[![CI](https://github.com/harshitxmishra/DeCOY/actions/workflows/ci.yml/badge.svg)](https://github.com/harshitxmishra/DeCOY/actions/workflows/ci.yml)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fharshitxmishra%2FDeCOY)

---

## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/harshitxmishra/DeCOY.git
cd DeCOY

# Install dependencies
npm install

# Start local development server
npm run dev
# Open http://localhost:3000/discover

# Run all 16 Vitest automated invariant tests
npm test

# Type-check & lint
npx tsc --noEmit && npm run lint

# Production build & start
npm run build && npm start
```

---

## 🚀 Live Vercel Deployment

Deploy with one command via Vercel CLI:

```bash
# Deploy to production
npx vercel --prod
```

### Serverless Persistence Architecture on Vercel
Traditional SQLite files fail on serverless platforms because writes to ephemeral storage vanish upon cold starts. Coy Discover solves this with an architectural **Dual-Mode Persistence Adapter** (`src/lib/storage/adapter.ts`):
1. **Local Development & CI (`npm test`):** Executes queries against local SQLite (`data/coy-discover.db`) in WAL mode via `better-sqlite3`.
2. **Cloud Database (Optional):** Supports `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` via `@libsql/client`.
3. **Stateless Serverless Fallback (Default on Vercel):** When deployed to Vercel without a cloud DB, swipes, mutual matches, and messages are persisted in an **authenticated, tamper-resistant HTTP-only session cookie** (`coy_session` with SHA-256 HMAC verification). This guarantees **100% reload persistence across cold starts** with zero native Linux binary errors!

---

## 🌟 Standout Product & Engineering Features

### 1. 🛡️ Live "Zero-Leakage Privacy Audit" Inspector (Reviewer Showcase)
- Located in the Discover top bar as a **"Privacy Shield: Verified"** badge.
- Clicking opens a real-time inspection drawer auditing incoming network payloads from `/api/feed` and `/api/swipe`.
- Verifies that forbidden fields (`incoming_like`, `likedByUser`, internal IDs) **never leave the server** (`0 leaked fields`).

### 2. 🏷️ Privacy-Safe Interest Filter Chips
- Horizontal filter bar above the card deck: `All`, `Tech`, `Music`, `Coffee`, `Creative`, `Fitness`.
- Dynamically filters the card stack without modifying server feed ordering or revealing match hints.
- Displays live remaining counters per category.

### 3. ✨ Mutual-Only Icebreaker Reveal & Shared Interests
- Once a swipe results in a mutual match (`matched: true`), the app computes overlapping interests between `demo-user` and the match.
- Displays tailored conversation starters in the **"It's a match!"** modal and the **Matches** view.

### 4. 💬 Interactive Match Chat Preview
- Tap any match to open an interactive conversation drawer.
- Quick-tap icebreaker bubbles to instantly fill and send conversation starters.
- Realistic simulated auto-replies with typing indicators, persisted in session state across page reloads.

### 5. ⌨️ Desktop Power-User Keyboard Controls
- `←` (`ArrowLeft`) to Pass
- `→` (`ArrowRight`) to Like
- `Esc` to close modals and chat drawers
- Keycap badges rendered on desktop controls.

---

## 🔒 Privacy Guarantee (Core Promise of Coy)

> **"Your likes stay private until they're mutual."**

1. **`incoming_like` is strictly server-only.** It is stripped from database models before reaching any API response or React component.
2. **Matches occur ONLY when:** `incoming_like = 1` AND the user swipes `like`.
3. **Passing on a liker never creates a match.**
4. **Feed returns 0 clues** about who has liked the user.
5. **Verified by 16 automated invariant tests.**

---

## 🔌 API Contract & Rewrites

All endpoints are accessible both at `/api/...` and top-level rewrites (`/...`):

| Endpoint | Method | Description |
|:---|:---|:---|
| `/api/feed` (or `/feed`) | `GET` | Returns unswiped profiles (never leaks `incoming_like`) |
| `/api/swipe` (or `/swipe`) | `POST` | Records a like or pass; returns `{ matched: true, match: ... }` on mutual match |
| `/api/matches` (or `/matches`) | `GET` | Returns mutual matches only |
| `/api/messages` | `GET` / `POST` | Fetches and sends simulated chat messages for a match |
| `/api/reset` (or `/reset`) | `POST` | Wipes swipes and re-seeds clean demo state |

---

## 🧪 Testing Suite (`npm test`)

The test suite runs 16 automated tests covering:
- Feed seeding count (`>= 30`) and public field sanitization
- Exclusion of swiped profiles (`like` and `pass`)
- Non-mutual like returns `matched: false`
- Mutual like returns `matched: true` with match object
- Zero leakage of `incoming_like` across feed, swipe, and match endpoints
- Category filter matching logic
- Shared-interests calculation and tailored icebreaker generator
- Serverless session state serialization, HMAC signature verification, and tamper resistance
- State persistence across DB/service re-initialization

---

## 📁 Repository Structure

```text
├── .github/workflows/ci.yml         # CI workflow (lint, tsc, test, build)
├── data/                            # SQLite database (gitignored at runtime)
├── public/avatars/                  # 32 local SVG portraits (offline safe)
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # "Home" tab (intentionally blank per spec)
│   │   ├── discover/page.tsx        # "Discover" tab
│   │   └── api/                     # REST API endpoints (feed, swipe, matches, reset, messages)
│   ├── features/discover/
│   │   ├── components/              # SwipeDeck, ProfileCard, MatchCelebrationModal, MatchesList,
│   │   │                            # MatchChatModal, InterestFilterBar, PrivacyAuditDrawer
│   │   ├── hooks/useDiscoverFeed.ts # Feed, swipe, and telemetry hook
│   │   ├── icebreakers.ts           # Shared-interests and icebreaker prompts
│   │   ├── matching-service.ts      # Core matching domain logic
│   │   ├── seed.ts                  # 32 seeded mock profiles (9 pre-seeded likers)
│   │   └── types.ts                 # Safe public types vs server-only types
│   ├── lib/
│   │   ├── db.ts                    # SQLite & serverless detection
│   │   ├── session.ts               # Authenticated session cookie encoder/decoder
│   │   └── storage/adapter.ts       # Dual-mode SQLite + Vercel state adapter
│   └── tests/
│       └── matching-privacy.test.ts # 16 Vitest automated invariant tests
├── AGENTS.md                        # Autonomous agent instructions
├── PART_A_NOTES.md                  # Part A product teardown & feature proposals
└── README.md                        # Project documentation
```

---

Built for the Coy SDE Intern Assignment.
