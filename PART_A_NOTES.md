# Part A — Coy Feature Proposals & Teardown Analysis

> Exploration, teardown analysis, and strategic feature proposals for **Coy** ([https://app.getcoy.com](https://app.getcoy.com)).
> Written for the **Coy SDE Intern Assignment (Part A)**.

---

## 1. Executive Summary & Product Teardown

Coy is built on a radical, counter-cultural premise in consumer social: **hyper-private, zero-rejection matching**. Where incumbent apps (Tinder, Bumble, Hinge) monetize rejection anxiety via paywalled likes ("See who likes you"), Coy eliminates rejection anxiety entirely by strictly guaranteeing that interest is **cryptographically and architecturally private** until mutual reciprocation.

### Walkthrough & Teardown Observations (`https://app.getcoy.com`)

1. **Phone OTP Onboarding:**
   - *Observation:* Authentication requires mobile phone number verification via OTP.
   - *Rationale:* Anchors each account to a real SIM identity. Mitigates automated bot farms, burner spam accounts, and malicious impersonation while ensuring single-user accountability.

2. **Crush Nomination / Secret Likers:**
   - *Observation:* Users nominate specific individuals (via phone contact or handle/identifier) into private slots.
   - *Rationale:* Flips passive directory browsing into high-intent active nomination. Protects social reputation: if user A adds user B, user B never learns about user A's interest unless B independently nominates A.

3. **Email / Campus Domain Verification:**
   - *Observation:* Option/requirement to verify an institutional or work email.
   - *Rationale:* Establishes a trusted micro-community (e.g., college campus, trusted network) with high social context while maintaining zero-leakage boundaries.

4. **Invite Links & Referral Growth Engine:**
   - *Observation:* Users share custom invite links to onboard friends or prospective matches.
   - *Rationale:* Solves the cold-start problem of double-blind matching. If a user nominates someone who isn't on Coy yet, an anonymous invite loop nudges them to join without disclosing who sent the invite.

5. **Extra-Slots & Scarcity Architecture:**
   - *Observation:* Users have a finite number of active crush/interest slots, with prompts/screens to unlock additional slots via referrals or purchases.
   - *Rationale:* Artificial scarcity forces intentionality. It prevents users from "liking everyone" (which ruins signal-to-noise ratio) and drives viral expansion through invite-based slot unlocks.

---

## 2. Feature Proposal 1: Zero-Leakage Mutual-Match Discovery (The Core Promise)

### What It Does
When a user likes or nominates another person, **no notification, visual hint, blurred thumbnail, or counter increment is ever sent to the recipient**. The like remains strictly confidential on the server. Only when both parties have expressed mutual interest does the system simultaneously unlock the connection for both users.

### Why It's Required
1. **Elimination of Rejection Fear:** In traditional dating apps, swiping is fraught with social risk, especially in tight-knit social circles (college campuses, friend groups). By guaranteeing zero exposure on unreciprocated likes, Coy removes the emotional barrier to expressing genuine interest.
2. **Prevention of Coercive Social Dynamics:** Apps with "Someone liked you" notifications induce guilt, awkward inquiries ("Was it you?"), and game-playing. Coy ensures that every match is authentic and free from external pressure.
3. **High Signal-to-Noise Ratio:** When likes are completely private and slots are finite, users only like people they genuinely care about.

### Technical & Architecture Considerations
- **Strict Data Sanitization:** `incoming_like` must never exist in client-side models, API serializations, or client storage.
- **Server-Side Evaluation:** Match conditions are computed exclusively in server transactions.
- **Timing & Traffic Analysis Defense:** Push notifications on matches should introduce intentional random jitter to prevent side-channel timing correlations (e.g., matching within 50ms of sending an invite).

---

## 3. Feature Proposal 2: Cryptographic Zero-Knowledge "Crush Invite" & Dynamic Slot Loop

### What It Does
When user A wants to nominate someone who may or may not be on Coy yet (e.g., by phone number or university email):
1. Coy hashes the contact identifier client-side/server-side using a salted irreversible hash (`HMAC-SHA256`).
2. An **anonymous notification / invite token** can be delivered ("Someone in your campus circle nominated you on Coy").
3. When the recipient joins and verifies their own contact info, their hash matches the pending nomination, instantly unlocking a mutual match if reciprocated.
4. Users who refer friends or bring unverified contacts into the ecosystem earn **dynamic slot boosts** without exposing contact identities.

### Why It's Required
1. **Solves the Two-Sided Network Cold-Start Problem:** Double-blind dating apps suffer when user A nominates user B, but user B hasn't joined yet. Without an anonymous invite loop, user A's nomination languishes in dead storage, creating churn.
2. **Preserves the Anonymity Contract:** Standard viral loops often leak metadata ("John invited you to join Coy!"). A zero-knowledge notification creates curiosity and viral conversion without betraying user A's identity.
3. **Intent-Gated Viral Growth:** By tying extra crush slots to successful anonymous invites, Coy creates a self-reinforcing flywheel: *Desire for more slots → Anonymous invite sent → New user joins → New user nominates their own circle*.
4. **Anti-Harassment & Velocity Limiting:** Contact hashing prevents bad actors from querying the database to see "who is already registered on Coy". Salted lookups ensure contact discovery is one-way.

### Technical & Architecture Considerations
- **Irreversible Contact Blind Signatures:** Normalize and salt phone numbers (E.164) and emails before hashing to prevent rainbow table attacks.
- **Slot Capacity Constraints:** Default to 3–5 active slots. Dynamically reward slots upon verified referral onboarding, capped at a reasonable limit to preserve signal fidelity.
- **Atomic Match Resolution:** Upon account creation and verification, execute a single database transaction checking for pending matching hashes in the nomination pool.

---

## 4. User Journey & Retention Architecture

```
[Onboarding: Phone OTP] 
       │
       ▼
[Campus / Email Auth] (Micro-network trust)
       │
       ▼
[Discovery / Crush Slots] (Strict finite capacity: 3–5 slots)
       │
       ├── Case A: Swipes/Likes existing user ──► Server evaluates (Zero Leakage)
       │                                              │
       │                                              ├── Mutual: 🎉 "It's a Match!"
       │                                              └── Single: Stays completely private
       │
       └── Case B: Nominates off-platform crush ──► Salted Hash + Anonymous Invite
                                                      │
                                                      ▼
                                          [Crush joins & reciprocates]
                                                      │
                                                      ▼
                                           🎉 Mutual Match + Slot Reward!
```

---

*These notes are structured for immediate inclusion in the assignment submission and can be customized with personal reflections from live testing.*
