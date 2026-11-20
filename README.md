# Coy Discover — SDE Intern Assignment (Part B)

A standalone, mobile-first **Discover tab** application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **SQLite**. Implements Coy's mutual-match dating experience where **likes stay private until they're mutual**.

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000/discover
```

---

## 🏗 Architecture

```
Next.js App Router + TypeScript + Tailwind CSS
├── SQLite (better-sqlite3) for persistence
├── Feature-first folder structure
├── Server-only matching logic (privacy-safe)
└── Mobile-first responsive UI
```

### Key Design Decisions

1. **SQLite over PostgreSQL** — Zero-config, single-file DB perfect for a demo app. Persistence across restarts without external services.
2. **Feature-first layout** — All Discover domain logic (`types`, `seed`, `matching-service`, `components`, `hooks`) co-located under `src/features/discover/`.
3. **Privacy by architecture** — `incoming_like` exists only in the DB and server-side code. The `toPublicProfile()` sanitizer strips it before any API response.
4. **Idempotent seeding** — DB self-seeds on first access; `POST /api/reset` re-seeds for demos.

---

## 📱 Features

| Feature | Description |
|---------|-------------|
| **Tab Navigation** | Home (blank) + Discover with bottom tab bar |
| **Swipe Deck** | One card at a time, touch/pointer drag gestures + buttons |
| **Visual Feedback** | Tilt, opacity, LIKE/PASS labels during drag |
| **Mutual Matching** | Match only when both sides like — "It's a Match!" modal |
| **Matches View** | Toggle to see all mutual matches |
| **Empty State** | Clear message + "Reset Demo" when feed is exhausted |
| **Persistence** | SQLite — swipes survive page reloads and server restarts |

---

## 🔌 API Contract

All endpoints available at both `/api/...` and `/...` paths (via Next.js rewrites).

### `GET /api/feed`

Returns unswiped profiles for the demo user.

**Response:**
```json
{
  "profiles": [
    {
      "id": "p01",
      "name": "Ananya Sharma",
      "age": 22,
      "photo": "/avatars/01.svg",
      "bio": "Coffee connoisseur and aspiring novelist...",
      "location": "Delhi University",
      "interests": ["reading", "coffee", "creative writing", "indie music"]
    }
  ],
  "remaining": 32
}
```

> ⚠️ **Privacy:** `incoming_like` is NEVER included in feed responses.

### `POST /api/swipe`

Records a like or pass on a profile.

**Request:**
```json
{ "profileId": "p01", "action": "like" }
```

**Response (non-match):**
```json
{ "success": true, "matched": false, "remaining": 31 }
```

**Response (mutual match):**
```json
{
  "success": true,
  "matched": true,
  "match": {
    "id": "p01",
    "name": "Ananya Sharma",
    "age": 22,
    "photo": "/avatars/01.svg",
    "bio": "...",
    "location": "Delhi University",
    "interests": ["reading", "coffee"],
    "matchedAt": "2024-01-15T10:30:00.000Z"
  },
  "remaining": 31
}
```

### `GET /api/matches`

Returns all mutual matches.

**Response:**
```json
{
  "matches": [{ "id": "p01", "name": "...", "matchedAt": "..." }],
  "count": 1
}
```

### `POST /api/reset`

Resets demo state (clears swipes, re-seeds profiles).

**Response:**
```json
{ "success": true, "profileCount": 32 }
```

---

## 🔒 Privacy Guarantee (Core Promise of Coy)

> **"Your likes stay private until they're mutual."**

- `incoming_like` is a **server-only** database field. It never appears in API responses, client types, or UI components.
- A match is created **only** when: `incoming_like = 1` AND the user swipes `like`.
- The feed endpoint returns NO hints about who has liked the user.
- Automated tests verify zero leakage of non-mutual incoming likes.

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Tests verify:
# ✓ Feed returns >= 30 profiles
# ✓ No incoming_like leakage in feed
# ✓ Swiped profiles excluded from feed
# ✓ Non-mutual like → matched: false
# ✓ Mutual like → matched: true + match data
# ✓ Pass on liker → no match
# ✓ Matches endpoint returns only mutual matches
# ✓ No incoming_like in match responses
# ✓ Duplicate swipe handling
# ✓ Reset demo state
# ✓ Persistence across DB re-init
```

---

## 🗂 Project Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout with Inter font
│   ├── page.tsx                      # Home tab (intentionally blank)
│   ├── discover/page.tsx             # Discover tab (swipe + matches)
│   └── api/
│       ├── feed/route.ts             # GET /api/feed
│       ├── swipe/route.ts            # POST /api/swipe
│       ├── matches/route.ts          # GET /api/matches
│       └── reset/route.ts            # POST /api/reset
├── features/discover/
│   ├── types.ts                      # Public (safe) & internal types
│   ├── seed.ts                       # 32-profile idempotent seeder
│   ├── matching-service.ts           # Core match logic + privacy sanitization
│   ├── components/
│   │   ├── TabShell.tsx              # Layout with bottom tab bar
│   │   ├── SwipeDeck.tsx             # Card stack with gestures
│   │   ├── ProfileCard.tsx           # Individual profile card
│   │   ├── MatchCelebrationModal.tsx # "It's a Match!" overlay
│   │   ├── MatchesList.tsx           # Mutual matches list view
│   │   └── EmptyFeedState.tsx        # Empty feed + reset button
│   └── hooks/
│       └── useDiscoverFeed.ts        # Client-side data fetching
├── lib/
│   └── db.ts                         # SQLite connection + schema
└── tests/
    └── matching-privacy.test.ts      # Privacy invariant tests
```

---

## 📋 Development

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm start         # Start production server
npm run lint      # ESLint
npm test          # Vitest
npx tsc --noEmit  # Type-check
```

---

## 🤖 Agent Instructions

See [`AGENTS.md`](./AGENTS.md) for autonomous agent rules (Antigravity & Google Jules).

---

Built for the Coy SDE Intern Assignment.
