# Email Capture Upgrade — Implementation Plan

## Overview

Replace Lancer's waitlist email storage from a local JSON file (`data/waitlist.json`) to **Resend Contacts** — a cloud API that stores signups and can send emails later. The current approach breaks on AWS Amplify because serverless deployments don't have a writable file system. This upgrade makes the waitlist production-ready while setting Lancer up for future email campaigns (welcome emails, launch announcements) with zero migration.

**Based on:** `docs/plans/email-capture-research.md` — Resend Contacts was the recommended option.

## Architecture

### Data Flow

1. Visitor enters email and selects their user type ("Worker" or "Homeowner") in `WaitlistForm.tsx` → clicks "Join Waitlist"
2. Form sends `POST /api/waitlist` with `{ email, userType }` (updated — now includes user type)
3. API route validates the email (unchanged) and normalizes the user type
4. API route calls `resend.contacts.create()` to store the email in Resend's "Lancer Waitlist" audience, with `userType` as a custom property
5. Resend returns success or an error (e.g., duplicate contact)
6. API route returns JSON response to the form (unchanged format)
7. Form shows success or error message (unchanged)

**Key insight:** The endpoint URL and response format stay the same. The API route is a full rewrite (file storage → Resend). The form gets a new user type selector, but the overall structure is preserved.

### Component Structure

| Component | Changes? | Notes |
|-----------|----------|-------|
| `WaitlistForm.tsx` | **Updated** | Add user type selector (pill toggle), send `userType` in POST body |
| `HeroSection.tsx` | **No changes** | Renders `WaitlistForm` |
| `CTASection.tsx` | **No changes** | Renders `WaitlistForm` |
| `api/waitlist/route.ts` | **Full rewrite** | Swap `fs` storage for Resend API calls, accept `userType` property |

### User Type Selector Design

The form gets a pill-style toggle above the email input that lets visitors self-identify:

```
[ I'm a Worker ]  [ I'm a Homeowner ]
```

**Design details:**
- Two pill buttons side by side, one selected (filled brand color), one deselected (outlined)
- Defaults to no selection — both pills are deselected initially
- Selection is **required** before submitting (gentle validation if they skip it)
- Sits above the email input row to create a natural top-down flow
- On mobile: pills sit side by side (they're short enough), same layout as desktop
- Matches existing design system: `rounded-full`, brand colors, smooth transitions

**Expandability:** The selector is built as a generic `options` array pattern — to add a third option later (e.g., "I'm a Property Manager"), the Builder just adds one more entry to the array. No structural changes needed. The form sends a generic `properties` object to the API, so new fields (name, zip code, skills) can be added the same way in the future.

### API Routes

**`POST /api/waitlist`** (rewritten internals, updated request body)

Request (updated — now includes optional userType):
```json
{ "email": "user@example.com", "userType": "worker" }
```
`userType` accepts `"worker"` or `"homeowner"`. It's sent to Resend as a custom contact property so Jack can segment the list later.

Success response (unchanged):
```json
{ "success": true, "message": "You're on the list!" }
```

Error responses (unchanged format):
```json
{ "error": "Email is required." }           // 400
{ "error": "Please enter a valid email." }   // 400
{ "error": "Please select whether you're a worker or homeowner." }  // 400
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
| `src/app/api/waitlist/route.ts` | Remove `fs`/`path` imports, remove `getWaitlist()`/`saveWaitlist()` helpers, replace with Resend SDK calls. Accept `userType` from request body and pass as Resend contact property. Keep the same validation logic and response format. |
| `src/components/forms/WaitlistForm.tsx` | Add user type pill selector (worker / homeowner) above the email input. Add `userType` state. Send `userType` in POST body. Add validation that a type is selected. Build the selector as a generic options pattern for easy future expansion. |

### Deleted Files / References

| What | Action |
|------|--------|
| `data/waitlist.json` | No longer needed. Contains only test data — safe to ignore. Code will no longer read/write it. Can be deleted at any time. |
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
  - Extract `userType` from request body, validate it's `"worker"` or `"homeowner"` (return 400 if missing/invalid)
  - Replace `getWaitlist()` / `waitlist.push()` / `saveWaitlist()` with `resend.contacts.create()`, passing `userType` as a custom property via the `properties` field (Resend supports arbitrary key-value properties on contacts — this is how Jack can filter workers vs homeowners in the dashboard)
  - Handle duplicates: Resend returns a `422` error when a contact already exists — map this to the existing `409` response with "This email is already on the waitlist."
  - Keep the `console.log` for new signups (helpful for debugging)
  - Return the same success JSON: `{ success: true, message: "You're on the list!" }`
- [ ] Rewrite `GET` handler:
  - Replace `getWaitlist()` with `resend.contacts.list()`
  - Return `{ count: data.length }` using the contacts array from Resend
- [ ] **Checkpoint:** Run `npm run build` — should compile with zero errors.

### Phase 3: Add User Type Selector to the Form

- [ ] Open `src/components/forms/WaitlistForm.tsx`
- [ ] Add `userType` state: `useState<string>('')`
- [ ] Define a `USER_TYPE_OPTIONS` array at the top of the file for expandability:
  ```typescript
  const USER_TYPE_OPTIONS = [
    { value: 'worker', label: "I'm a Worker" },
    { value: 'homeowner', label: "I'm a Homeowner" },
  ];
  ```
  To add a future option (e.g., "I'm a Property Manager"), the Builder just adds one more object to this array — nothing else changes.
- [ ] Render a pill selector above the email input:
  - Map over `USER_TYPE_OPTIONS` to render pill buttons
  - Selected pill: `bg-brand-600 text-white` (filled)
  - Deselected pill: `border border-slate-300 text-slate-600` (outlined), with hover: `hover:border-brand-500 hover:text-brand-600`
  - Dark theme variant: adjust border/text colors for the CTA section's dark background
  - Use `rounded-full` to match existing button style
  - On click: set `userType` state to the option's value
- [ ] Update validation in `handleSubmit`:
  - Before the email check, add: if no `userType` is selected, show "Please select whether you're a worker or homeowner." and return
- [ ] Update the fetch body to include `userType`:
  ```typescript
  body: JSON.stringify({ email, userType })
  ```
- [ ] Reset `userType` on success (along with the existing `setEmail('')`)
- [ ] **Checkpoint:** Form shows the pill selector. Selecting a type highlights the pill. Submitting without a selection shows an error. The selected type is sent in the POST body.

### Phase 4: Verify, Clean Up & Deploy Prep

- [ ] Test the full flow locally: select a user type, enter email, submit → check it appears in the Resend dashboard with the correct `userType` property
- [ ] Test duplicate handling: submit the same email again → verify "already on the waitlist" error
- [ ] Test missing user type: submit with email but no type selected → verify validation error
- [ ] Test with invalid input: empty email, malformed email
- [ ] Test the GET endpoint: visit `/api/waitlist` in the browser, confirm it returns the correct count
- [ ] Test both form variants: check the hero section form AND the CTA section form (dark theme)
- [ ] Test on mobile viewport: pill selector and form should look clean and tappable
- [ ] Run `npm run build` one final time to confirm production build passes
- [ ] Commit and push to a feature branch
- [ ] Remind Jack to add `RESEND_API_KEY` and `RESEND_AUDIENCE_ID` to AWS Amplify Console environment variables before merging
- [ ] **Checkpoint:** Form works locally end-to-end with user type selection. Signups appear in the Resend dashboard with type property. Both form variants (light hero + dark CTA) look correct. Build passes.

## Error Handling

| Layer | Error | Handling |
|-------|-------|----------|
| Frontend (form) | No user type selected | Client-side validation prevents submission, shows inline error |
| Frontend (form) | Empty or invalid email | Client-side validation prevents submission, shows inline error |
| API route | Missing or malformed email | Returns 400 with descriptive error message |
| API route | Missing or invalid userType | Returns 400 with "Please select whether you're a worker or homeowner." |
| API route | Duplicate email | Resend returns error → API returns 409 "already on the waitlist" |
| API route | Resend API failure (network, auth, rate limit) | Caught by try/catch → returns 500 "Something went wrong" |
| API route | Missing env vars | Resend client will throw on initialization → caught by try/catch → 500 error |

**Graceful degradation:** If Resend is temporarily down, the user sees "Something went wrong. Please try again." — they can retry in a minute. No data is lost because nothing was partially written.

## Testing Strategy

All manual testing (no automated tests for this milestone):

1. **Happy path:** Select "Worker", enter a new email → see success message → check Resend dashboard for the contact with `userType: worker`
2. **Happy path (homeowner):** Select "Homeowner", enter a new email → see success → check Resend dashboard for `userType: homeowner`
3. **No type selected:** Enter email, skip the type selector, submit → see "please select" validation error
4. **Duplicate:** Enter the same email again → see "already on the waitlist" error
5. **Invalid email:** Enter "notanemail" → see validation error (client-side)
6. **Empty submit:** Click submit with empty field → see validation error (client-side)
7. **GET endpoint:** Visit `http://localhost:3000/api/waitlist` → see correct count
8. **Dark theme:** Test the CTA section form — pills should look correct on dark background
9. **Mobile:** Test the form on a narrow viewport — pills and input should look clean and tappable
10. **Build check:** `npm run build` completes with zero errors

## Security Considerations

| Concern | Mitigation |
|---------|-----------|
| API key exposure | Stored in `.env.local` (not committed) and Amplify env vars (not in code). Server-side only — never sent to the browser. |
| Spam/bot submissions | Basic: email format validation. Future improvement: add rate limiting or CAPTCHA if abuse is detected. Not needed at current traffic levels. |
| Data privacy | Resend handles GDPR-compliant unsubscribe management. Contact data is stored in Resend's infrastructure (SOC 2 compliant). |
| Injection attacks | Email is trimmed, lowercased, and validated before being sent to Resend. Resend's API also validates on their end. |

## Decisions Made

These were open questions that Jack resolved:

1. **Existing waitlist emails** — `data/waitlist.json` contains only test data. No migration needed. Safe to ignore.

2. **User type selector** — Yes, add it now. Workers and homeowners select their type when signing up. Built as an expandable pattern so future options (e.g., "Property Manager") can be added by updating a single array.

## Open Questions

1. **Resend account setup** — Jack needs to create the Resend account, generate the API key, and create the "Lancer Waitlist" audience before the Builder starts. Takes about 2 minutes at [resend.com](https://resend.com).

## Estimated Complexity

**Single session build.** Two files modified (`route.ts` full rewrite, `WaitlistForm.tsx` add selector), one new dependency, two env vars. The form selector is a straightforward addition using existing design patterns. A Builder agent should complete this in 20–40 minutes of implementation time, plus whatever time Jack needs for the Resend account setup.
