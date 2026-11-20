# Part A — Coy Feature Proposals

> Two core features of Coy, with rationale for why each is essential to the product.
> Based on exploring the live app at [https://app.getcoy.com](https://app.getcoy.com).

---

## Feature 1: Mutual-Match Reveal (Private Likes)

### What It Does
On Coy, when you like someone, they are **never notified** unless they also like you back. Your like remains completely private — no "someone liked you" hints, no blurred profile previews, no social pressure. A connection is surfaced **only** when both people have independently expressed interest.

### Why It's Required
This is the **foundational privacy guarantee** that differentiates Coy from every other dating app:

- **Eliminates rejection anxiety** — Users swipe freely knowing their likes won't be exposed unless reciprocated.
- **Prevents social pressure** — No "X liked you" notifications that create an obligation to respond.
- **Builds genuine connections** — Both people must independently decide they're interested, leading to higher-quality matches.
- **Trust & safety** — Users feel safe exploring without fear of unwanted attention or stalking.

This is not a feature — it is the **core promise** of the product. Without it, Coy is just another swipe app.

### Technical Implications
- `incoming_like` must be a server-only field that never reaches the client
- Feed endpoints must sanitize all profile data before returning
- Match detection happens server-side during swipe processing
- API responses must be tested for zero leakage of non-mutual information

---

## Feature 2: <!-- TODO: Add second feature after exploring app.getcoy.com -->

### What It Does
<!-- TODO: Describe the feature -->

### Why It's Required
<!-- TODO: Explain why this feature is core to Coy's value proposition -->

### Technical Implications
<!-- TODO: Outline implementation considerations -->

---

## Notes from App Exploration
<!-- TODO: Document observations from walking through:
- Phone OTP login flow
- Adding a crush
- Email verification
- Invite link sharing
- Extra-slots screen (without purchasing)
-->
