# Email Capture Upgrade — Implementation Plan

## Overview

Replace Lancer's waitlist email storage from a local JSON file (`data/waitlist.json`) to **Resend Contacts** — a cloud API that stores signups and can send emails later. The current approach breaks on AWS Amplify because serverless deployments don't have a writable file system. This upgrade makes the waitlist production-ready while setting Lancer up for future email campaigns (welcome emails, launch announcements) with zero migration.

**Based on:** `docs/plans/email-capture-research.md` — Resend Contacts was the recommended option.

## Architecture

### Data Flow

1. Visitor enters email in `WaitlistForm.tsx` → clicks "Join Waitlist"
2. Form sends `POST /api/waitlist` with `{ email }` (unchanged)
3. API route validates the email (unchanged)
4. API route calls `resend.contacts.create()` to store the email in Resend's "Lancer Waitlist" audience
5. Resend returns success or an error (e.g., duplicate contact)
6. API route returns JSON response to the form (unchanged format)
7. Form shows success or error message (unchanged)

**Key insight:** Only the API route changes. The frontend form and the endpoint URL stay exactly the same — this is a backend-only swap.

### Component Structure

| Component | Changes? | Notes |
|-----------|----------|-------|
| `WaitlistForm.tsx` | **No changes** | Already calls `/api/waitlist` with the right format |
| `HeroSection.tsx` | **No changes** | Renders `WaitlistForm` |
| `CTASection.tsx` | **No changes** | Renders `WaitlistForm` |
| `api/waitlist/route.ts` | **Full rewrite** | Swap `fs` storage for Resend API calls |

### API Routes

**`POST /api/waitlist`** (rewritten internals, same interface)

Request (unchanged):
```json
{ "email": "user@example.com" }
```

Success response (unchanged):
```json
{ "success": true, "message": "You're on the list!" }
```

Error responses (unchanged format):
```json
{ "error": "Email is required." }           // 400
{ "error": "Please enter a valid email." }   // 400
{ "error": "This email is already on the waitlist." }  // 409
{ "error": "Something went wrong. Please try again." } // 500
```

**`GET /api/waitlist`** (rewritten internals, same interface)

Response (unchanged):
```json
{ "count": 42 }
```

## File Changes

### New Files

None. This upgrade modifies existing files only.

### Modified Files

| File | Changes |
|------|---------|
| `src/app/api/waitlist/route.ts` | Remove `fs`/`path` imports, remove `getWaitlist()`/`saveWaitlist()` helpers, replace with Resend SDK calls. Keep the same validation logic and response format. |

### Deleted Files / References

| What | Action |
|------|--------|
| `data/waitlist.json` | No longer needed. Don't delete the file (it has existing signups), but the code will no longer read/write it. Jack can keep it as a backup of early signups. |
| `fs` and `path` imports in route.ts | Remove — these cause errors in serverless environments. |

## Dependencies

| Package | Purpose | Install |
|---------|---------|---------|
| `resend` | Resend SDK for contacts API and future email sending | `npm install resend` |

No other dependencies are needed. The Resend SDK is lightweight and has zero sub-dependencies.

## Environment Variables

| Variable | Description | Where to Set |
|----------|-------------|-------------|
| `RESEND_API_KEY` | API key from Resend dashboard (starts with `re_`) | `.env.local` for local dev, Amplify Console for production |
| `RESEND_AUDIENCE_ID` | ID of the "Lancer Waitlist" audience in Resend | `.env.local` for local dev, Amplify Console for production |

**Important:** These are secrets — never commit them to git. The `.env.local` file is already in `.gitignore`.

## Build Order

This is a single-session build. Three short phases, each with a testable checkpoint.

### Phase 1: Setup & Dependencies

- [ ] Install the Resend SDK: `npm install resend`
- [ ] Jack creates a Resend account at [resend.com](https://resend.com) and generates an API key
- [ ] Jack creates an audience called "Lancer Waitlist" in the Resend dashboard and copies the Audience ID
- [ ] Add `RESEND_API_KEY` and `RESEND_AUDIENCE_ID` to `.env.local`
- [ ] **Checkpoint:** `npm run build` still passes — no code changes yet, just setup

### Phase 2: Rewrite the API Route

- [ ] Open `src/app/api/waitlist/route.ts`
- [ ] Remove `fs` and `path` imports
- [ ] Remove `DATA_FILE` constant, `getWaitlist()`, and `saveWaitlist()` helper functions
- [ ] Add Resend SDK import and client initialization at the top of the file
- [ ] Rewrite `POST` handler:
  - Keep the existing email validation (null check, trim, lowercase, format check)
  - Replace `getWaitlist()` / `waitlist.push()` / `saveWaitlist()` with `resend.contacts.create()`
  - Handle duplicates: Resend returns a `422` error when a contact already exists — map this to the existing `409` response with "This email is already on the waitlist."
  - Keep the `console.log` for new signups (helpful for debugging)
  - Return the same success JSON: `{ success: true, message: "You're on the list!" }`
- [ ] Rewrite `GET` handler:
  - Replace `getWaitlist()` with `resend.contacts.list()`
  - Return `{ count: data.length }` using the contacts array from Resend
- [ ] **Checkpoint:** Run `npm run build` — should compile with zero errors. Run `npm run dev` and test the form locally (requires valid env vars).

### Phase 3: Verify, Clean Up & Deploy Prep

- [ ] Test the full flow locally: submit an email, check it appears in the Resend dashboard
- [ ] Test duplicate handling: submit the same email again, verify "already on the waitlist" error
- [ ] Test with invalid input: empty email, malformed email
- [ ] Test the GET endpoint: visit `/api/waitlist` in the browser, confirm it returns the correct count
- [ ] Run `npm run build` one final time to confirm production build passes
- [ ] Commit and push to a feature branch
- [ ] Remind Jack to add `RESEND_API_KEY` and `RESEND_AUDIENCE_ID` to AWS Amplify Console environment variables before merging
- [ ] **Checkpoint:** Form works locally end-to-end. Signups appear in the Resend dashboard. Build passes.

## Error Handling

| Layer | Error | Handling |
|-------|-------|----------|
| Frontend (form) | Empty or invalid email | Client-side validation prevents submission, shows inline error |
| API route | Missing or malformed email | Returns 400 with descriptive error message |
| API route | Duplicate email | Resend returns error → API returns 409 "already on the waitlist" |
| API route | Resend API failure (network, auth, rate limit) | Caught by try/catch → returns 500 "Something went wrong" |
| API route | Missing env vars | Resend client will throw on initialization → caught by try/catch → 500 error |

**Graceful degradation:** If Resend is temporarily down, the user sees "Something went wrong. Please try again." — they can retry in a minute. No data is lost because nothing was partially written.

## Testing Strategy

All manual testing (no automated tests for this milestone):

1. **Happy path:** Enter a new email → see success message → check Resend dashboard for the contact
2. **Duplicate:** Enter the same email again → see "already on the waitlist" error
3. **Invalid email:** Enter "notanemail" → see validation error (client-side)
4. **Empty submit:** Click submit with empty field → see validation error (client-side)
5. **GET endpoint:** Visit `http://localhost:3000/api/waitlist` → see correct count
6. **Mobile:** Test the form on a narrow viewport — should work identically
7. **Build check:** `npm run build` completes with zero errors

## Security Considerations

| Concern | Mitigation |
|---------|-----------|
| API key exposure | Stored in `.env.local` (not committed) and Amplify env vars (not in code). Server-side only — never sent to the browser. |
| Spam/bot submissions | Basic: email format validation. Future improvement: add rate limiting or CAPTCHA if abuse is detected. Not needed at current traffic levels. |
| Data privacy | Resend handles GDPR-compliant unsubscribe management. Contact data is stored in Resend's infrastructure (SOC 2 compliant). |
| Injection attacks | Email is trimmed, lowercased, and validated before being sent to Resend. Resend's API also validates on their end. |

## Open Questions

These need Jack's input before or during the build:

1. **Resend account setup** — Jack needs to create the Resend account, generate the API key, and create the "Lancer Waitlist" audience. The Builder agent can't do this (it requires signing up for a service). *Jack, you'll need to do this before the Builder starts — it takes about 2 minutes.*

2. **Existing waitlist emails** — There may be emails in `data/waitlist.json` from local testing. Should the Builder manually add these to Resend, or are they just test data we can ignore?

3. **Contact properties** — Resend lets you tag contacts with custom properties (e.g., `type: "lancer"` vs `type: "homeowner"`). The current form only captures email. Do we want to add a "I am a..." selector now, or keep it simple and add that later? *Recommendation: keep it simple for now, add it later when we have separate signup flows.*

## Estimated Complexity

**Single session build.** This is a small, focused change — one file rewrite, one new dependency, two env vars. The frontend doesn't change at all. A Builder agent should complete this in 15–30 minutes of implementation time, plus whatever time Jack needs for the Resend account setup.
