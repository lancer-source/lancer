# User Signup & Profiles — Implementation Plan

## Overview

Add user authentication and profile management to Lancer using Supabase Auth, Supabase Database, and Supabase Storage (per the research report recommendation). Users will be able to sign up with email/password or Google, create a profile with a name, photo, bio, and skills or needs, and view/edit their own profile. This turns Lancer from a landing page into a real product.

**Estimated build:** 2–3 sessions (multi-session feature)

## Architecture

### Data Flow

**Sign Up (email/password):**
```
User fills signup form → supabase.auth.signUp({ data: { user_type } })
  → Supabase creates auth.users row with user_type in raw_user_meta_data
  → Database trigger creates profiles row (reads user_type from metadata)
  → Redirect to /profile/setup
```

**Sign Up (Google OAuth):**
```
User clicks "Continue with Google" → supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { queryParams: { user_type } }
  }) → Google consent screen → Redirect to /auth/callback → Exchange code for session
  → Database trigger creates profiles row → Redirect to /profile/setup
```

**Login:**
```
User fills login form → supabase.auth.signInWithPassword() → Session cookie set
  → Redirect to /profile (or /profile/setup if profile incomplete)
```

**Password Reset:**
```
User clicks "Forgot password?" on /login → /forgot-password page
  → Enter email → supabase.auth.resetPasswordForEmail() → Supabase sends reset email
  → User clicks link → Supabase handles reset → User logs in with new password
```

**Profile Update:**
```
User edits profile form → supabase.from('profiles').update() → Profile saved
Photo: browser → supabase.storage.upload() → Public URL saved to profiles.avatar_url
```

**Session Management:**
```
Every request → proxy.ts → supabase.auth.getClaims() → Refreshes expired tokens
  → Updated cookies passed to Server Components and browser
```

### Component Structure

**New shared UI components** (`src/components/ui/`):
| Component | Purpose |
|-----------|---------|
| `AuthInput.tsx` | Styled text input for auth forms (email, password, name fields) — consistent styling across all forms |
| `AuthButton.tsx` | Styled submit button with loading state and disabled-while-loading to prevent double-submit — consistent with brand-600 rounded-full pattern |

**New auth components** (`src/components/auth/`):
| Component | Purpose |
|-----------|---------|
| `SignUpForm.tsx` | Email, password, confirm password, user type selector, submit. Client component with form state. Must pass `user_type` in `signUp({ options: { data: { user_type } } })` so the DB trigger can read it. |
| `LoginForm.tsx` | Email, password, submit, "Forgot password?" link to `/forgot-password`, "Don't have an account?" link to `/signup`. Client component with form state. |
| `GoogleAuthButton.tsx` | "Continue with Google" button. Calls `supabase.auth.signInWithOAuth()`. |
| `UserTypeSelector.tsx` | Lancer / Homeowner pill selector. Reuses the pattern from `WaitlistForm.tsx`. |
| `LogoutButton.tsx` | Small button/link that calls `supabase.auth.signOut()` and redirects to `/`. |

**New profile components** (`src/components/profile/`):
| Component | Purpose |
|-----------|---------|
| `ProfileForm.tsx` | Name (maxLength 100), bio textarea (maxLength 500), skills/needs editor. Used on both `/profile/setup` and `/profile/edit`. |
| `AvatarUpload.tsx` | Photo upload with preview. Validates file type (.jpg, .png, .webp) and size (max 5MB) on the client. Uploads to Supabase Storage as `avatars/{user_id}/avatar` (upsert mode to overwrite previous). |
| `ProfileCard.tsx` | Read-only profile display: avatar, name, bio, skills/needs. Used on `/profile`. |
| `SkillsInput.tsx` | Tag-style input for adding/removing skills (Lancers) or needs (homeowners). |

**Modified components:**
| Component | Changes |
|-----------|---------|
| `Header.tsx` | Add auth-aware navigation: show "Log In" / "Sign Up" when logged out, show user avatar + "My Profile" / "Log Out" when logged in |

### API Routes / Route Handlers

| Route | Method | Purpose |
|-------|--------|---------|
| `/auth/callback/route.ts` | GET | Exchange OAuth code for session after Google login. Check `profiles.full_name` — if null, user is new → redirect to `/profile/setup`. If set, user is returning → redirect to `/profile`. |
| `/api/waitlist/route.ts` | POST/GET | **No changes** — existing waitlist keeps working as-is |

No new API routes needed for profile CRUD — Supabase client SDK talks directly to the database from the browser (protected by RLS). This is simpler and avoids building custom API routes for every operation.

### Route Protection

Protected routes (require login) are enforced at the **page level** using Server Components. Each protected page reads the session from cookies using the server Supabase client:

```typescript
const supabase = await createClient()
const { data: { claims } } = await supabase.auth.getClaims()
if (!claims) redirect('/login')
```

This uses `getClaims()` instead of `getUser()` because it validates the JWT locally without a database roundtrip — faster and more efficient. `getUser()` should only be used when you need to guarantee the user still exists in the database (e.g., sensitive operations like deleting an account).

## File Changes

### New Files

| File | Purpose |
|------|---------|
| **Lib / Utilities** | |
| `src/lib/supabase/client.ts` | Browser Supabase client (for Client Components) |
| `src/lib/supabase/server.ts` | Server Supabase client (for Server Components, Route Handlers) |
| `src/lib/supabase/admin.ts` | **Moved from** `src/lib/supabase.ts` — Admin client with service role key (for waitlist API) |
| `src/types/database.ts` | TypeScript types for the profiles table |
| `src/proxy.ts` | Session refresh on every request (Next.js 16 convention — replaces the old `middleware.ts`) |
| **Auth Pages** | |
| `src/app/signup/page.tsx` | Sign up page |
| `src/app/login/page.tsx` | Log in page |
| `src/app/forgot-password/page.tsx` | Password reset request page (enter email to receive reset link) |
| `src/app/auth/callback/route.ts` | OAuth callback route handler |
| **Profile Pages** | |
| `src/app/profile/page.tsx` | View own profile (protected) |
| `src/app/profile/setup/page.tsx` | Complete profile after signup (protected) |
| `src/app/profile/edit/page.tsx` | Edit profile (protected) |
| **Auth Components** | |
| `src/components/auth/SignUpForm.tsx` | Sign up form (email/password + user type) |
| `src/components/auth/LoginForm.tsx` | Login form |
| `src/components/auth/GoogleAuthButton.tsx` | Google OAuth button |
| `src/components/auth/UserTypeSelector.tsx` | Lancer/Homeowner selector |
| `src/components/auth/LogoutButton.tsx` | Logout action |
| **Profile Components** | |
| `src/components/profile/ProfileForm.tsx` | Profile edit form (name, bio, skills/needs) |
| `src/components/profile/AvatarUpload.tsx` | Photo upload with preview |
| `src/components/profile/ProfileCard.tsx` | Read-only profile display |
| `src/components/profile/SkillsInput.tsx` | Tag input for skills/needs |
| **UI Components** | |
| `src/components/ui/AuthInput.tsx` | Styled form input |
| `src/components/ui/AuthButton.tsx` | Styled submit button with loading state |

### Modified Files

| File | Changes |
|------|---------|
| `src/components/sections/Header.tsx` | Add auth-aware nav: login/signup links when logged out, profile link + logout when logged in. Already has `'use client'`. Will use Supabase browser client to check auth state. |
| `src/app/api/waitlist/route.ts` | Update import path: `@/lib/supabase` → `@/lib/supabase/admin` (because the old file moves into the new directory) |
| `amplify.yml` | Add `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the env grep so it's available at build time |
| `package.json` | Add `@supabase/ssr` dependency |

### Database Changes (Supabase Dashboard)

These are run manually in the Supabase SQL Editor, not in the codebase:

1. **Create `profiles` table** with columns: id, user_type, full_name, bio, avatar_url, skills, needs, created_at, updated_at
2. **Enable RLS** on profiles with select/insert/update policies
3. **Create trigger** to auto-create profile row on auth signup
4. **Create `avatars` storage bucket** (public) with upload/update/select RLS policies

The full SQL is in the research report (Section 4 and 5 of Implementation Notes).

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/ssr` | latest | Cookie-based auth for Next.js SSR. Required for server-side Supabase client with proper session handling. |

That's the only new dependency. `@supabase/supabase-js` is already installed.

## Environment Variables

**New variable (add to `.env.local` and Amplify Console):**

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (replaces the legacy "anon key" naming). Safe to expose in the browser. Respects Row Level Security policies. Find it in Supabase Dashboard → Settings → API → "Publishable key" (or use the legacy anon key — both work during the transition period). |

**Existing (no changes):**
- `NEXT_PUBLIC_SUPABASE_URL` — Already set up
- `SUPABASE_SERVICE_ROLE_KEY` — Already set up (server-only, used by waitlist)

**Google OAuth credentials** go directly in the Supabase Dashboard (Authentication → Providers → Google), NOT in env files.

## Build Order

### Phase 1: Foundation
Set up the Supabase client infrastructure and database schema. No visible pages yet, but the plumbing that everything else depends on.

- [ ] Install `@supabase/ssr`: `npm install @supabase/ssr`
- [ ] Add `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to `.env.local`
- [ ] **Resolve file conflict:** Move `src/lib/supabase.ts` → `src/lib/supabase/admin.ts`. Update the import in `src/app/api/waitlist/route.ts` from `@/lib/supabase` to `@/lib/supabase/admin`. Verify the waitlist still works.
- [ ] Create `src/lib/supabase/client.ts` — browser client using `createBrowserClient` from `@supabase/ssr`
- [ ] Create `src/lib/supabase/server.ts` — server client using `createServerClient` with cookie handlers. Include try/catch in `setAll` for Server Component compatibility (cookies can't be set from Server Components — the try/catch prevents a crash).
- [ ] Create `src/proxy.ts` — session refresh proxy using `getClaims()` (not `getUser()` — getClaims validates the JWT locally without a database call, which is faster and sufficient for session refresh)
- [ ] Create `src/types/database.ts` — TypeScript type for the `Profile` row
- [ ] Run SQL in Supabase Dashboard: create `profiles` table, enable RLS, add policies, create auto-insert trigger
- [ ] Create `avatars` storage bucket in Supabase Dashboard, add storage RLS policies
- [ ] Update `amplify.yml` — add `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the env grep line so it gets written to `.env.production` during builds
- [ ] **Checkpoint:** `npm run build` passes. Waitlist still works. No visible changes yet, but the infrastructure is ready.

**Commit:** `feat: add Supabase SSR client infrastructure and proxy`

### Phase 2: Auth (Sign Up, Log In, Log Out, Password Reset)
Build the authentication flow — the user-facing pages for creating accounts and logging in.

- [ ] Create `src/components/ui/AuthInput.tsx` — styled input matching existing form patterns (rounded-full, border-slate-300, focus:border-brand-500). Include `maxLength` prop support.
- [ ] Create `src/components/ui/AuthButton.tsx` — styled button matching existing pattern (rounded-full, bg-brand-600, loading state with spinner, `disabled` while loading to prevent double-submit)
- [ ] Create `src/components/auth/UserTypeSelector.tsx` — Lancer/Homeowner pill selector (extract pattern from `WaitlistForm.tsx`). Values: `'lancer'` and `'homeowner'`.
- [ ] Create `src/components/auth/GoogleAuthButton.tsx` — "Continue with Google" button with Google icon, calls `signInWithOAuth`
- [ ] Create `src/components/auth/SignUpForm.tsx` — email + password + confirm password + UserTypeSelector + GoogleAuthButton. Follow `WaitlistForm.tsx` patterns for state management (idle/loading/success/error). **Critical:** pass `user_type` in signup options: `supabase.auth.signUp({ email, password, options: { data: { user_type } } })` so the database trigger can read it from `raw_user_meta_data`.
- [ ] Create `src/app/signup/page.tsx` — centered card layout with SignUpForm. Redirect to `/profile` if already logged in.
- [ ] Create `src/components/auth/LoginForm.tsx` — email + password + GoogleAuthButton + "Forgot password?" link to `/forgot-password` + "Don't have an account?" link to `/signup`
- [ ] Create `src/app/login/page.tsx` — centered card layout with LoginForm. Redirect to `/profile` if already logged in.
- [ ] Create `src/app/forgot-password/page.tsx` — simple form: enter email, submit calls `supabase.auth.resetPasswordForEmail()`, show success message "Check your email for a reset link." Centered card layout matching login page.
- [ ] Create `src/app/auth/callback/route.ts` — exchange OAuth code for session. Then check the user's profile: query `profiles` table for `full_name`. If `full_name` is null → new user → redirect to `/profile/setup`. If `full_name` exists → returning user → redirect to `/profile`.
- [ ] Create `src/components/auth/LogoutButton.tsx` — calls `supabase.auth.signOut()`, redirects to `/`
- [ ] **Checkpoint:** Can sign up with email/password, log in, log out. Password reset sends email. Google OAuth redirects work. Auth state persists across page refreshes. `npm run build` passes.

**Commit:** `feat: add signup, login, logout, and password reset with Supabase Auth`

### Phase 3: Profile Setup & View
Build the profile pages — the post-signup experience where users complete their profile and can view it.

- [ ] Create `src/components/profile/AvatarUpload.tsx` — file input with image preview. Validate on the client: accept only `.jpg`, `.png`, `.webp`, max 5MB. Uploads to Supabase Storage as `avatars/{user_id}/avatar` using `upsert: true` (overwrites previous upload). Returns public URL. Shows current avatar if one exists, otherwise shows initials placeholder.
- [ ] Create `src/components/profile/SkillsInput.tsx` — text input where user types a skill/need and presses Enter to add it as a tag. Tags are removable. Stores as `string[]`. Max 20 tags.
- [ ] Create `src/components/profile/ProfileForm.tsx` — full name input (maxLength 100), bio textarea (maxLength 500), AvatarUpload, SkillsInput (label changes based on user_type: "Your Skills" for Lancers, "Your Home Service Needs" for homeowners). Has save button with loading state. Also has a "Skip for now" link on the `/profile/setup` page variant (so users aren't trapped).
- [ ] Create `src/app/profile/setup/page.tsx` — protected page. Shows "Complete Your Profile" heading + ProfileForm in setup mode (shows "Skip for now" link to `/profile`). On save, redirect to `/profile`. Server-side check: if user not logged in, redirect to `/login`.
- [ ] Create `src/components/profile/ProfileCard.tsx` — displays avatar (or initials placeholder with brand-100 background), full name, user type badge ("Lancer" or "Homeowner"), bio, skills/needs tags. Read-only. "Edit Profile" link. Empty state prompts for missing bio and skills/needs.
- [ ] Create `src/app/profile/page.tsx` — protected page. Fetches profile data server-side. Shows ProfileCard. If profile `full_name` is null AND this is the user's first visit (just signed up), redirect to `/profile/setup`. Don't redirect if the user explicitly skipped setup (they already visited `/profile/setup`).
- [ ] Create `src/app/profile/edit/page.tsx` — protected page. Loads current profile data, shows ProfileForm pre-filled. On save, redirect to `/profile`.
- [ ] **Checkpoint:** Full flow works: sign up → profile setup → view profile → edit profile. Photos upload and display correctly. Skills/needs tags work. Skip works without redirect loop. `npm run build` passes.

**Commit:** `feat: add profile setup, view, and edit pages`

### Phase 4: Header Integration & Polish
Connect auth state to the site-wide header and handle edge cases.

- [ ] Update `src/components/sections/Header.tsx`:
  - When logged out: show "Log In" text link + "Sign Up" brand-600 button (right side of nav)
  - When logged in: show user's avatar (small circle, or initials placeholder) + "My Profile" link + LogoutButton
  - Use Supabase browser client to check auth state with `onAuthStateChange` listener
- [ ] Add "Already have an account? Log in" link near the waitlist form on the landing page
- [ ] Handle auth errors with user-friendly messages:
  - "Email already registered" → suggest logging in with link to `/login`
  - "Invalid password" → clear message, no hint about which field is wrong
  - "Email not confirmed" → tell user to check inbox (if email confirmation is enabled later)
  - Network errors → generic retry message
- [ ] Ensure all auth and profile pages are responsive (mobile-first):
  - Forms should be full-width on mobile, centered card on desktop
  - Auth pages: `max-w-md mx-auto` card with padding
  - Profile pages: `max-w-2xl mx-auto` for profile card
- [ ] Add loading states:
  - Auth pages show spinner while checking if already logged in
  - Profile page shows skeleton while loading profile data
  - Avatar shows placeholder while uploading
- [ ] Handle empty states:
  - Profile with no photo: show initials circle (first letter of name) with brand-100 background
  - Profile with no bio: show subtle prompt "Add a bio to tell people about yourself"
  - Profile with no skills/needs: show subtle prompt to add them
- [ ] Run `npm run build` — verify clean build with zero errors
- [ ] **Checkpoint:** Header reflects auth state. All pages look good on mobile and desktop. Loading, error, and empty states handled. Build passes clean.

**Commit:** `feat: integrate auth into header and polish UX`

## Error Handling

| Layer | Error | Handling |
|-------|-------|----------|
| **Sign up** | Email already in use | Show "This email is already registered. Try logging in." with link to `/login` |
| **Sign up** | Weak password | Show Supabase's password requirements message |
| **Sign up** | Passwords don't match | Client-side validation before submission |
| **Sign up** | No user type selected | Client-side validation: "Please select whether you're a Lancer or homeowner." |
| **Sign up** | Double-click submit | AuthButton disables itself while loading — second click does nothing |
| **Login** | Wrong credentials | Show "Invalid email or password." (don't reveal which is wrong) |
| **Login** | Email not confirmed | Show "Please check your email to confirm your account." |
| **Password reset** | Email not found | Show the same success message regardless (don't leak whether an email exists) |
| **Password reset** | Rate limited | Show "Please wait a moment before requesting another reset email." |
| **OAuth** | Google login cancelled | Redirect back to `/login` with no error (user chose to cancel) |
| **OAuth** | Callback error | Show generic error page with "Try again" link |
| **Profile save** | Network error | Show "Something went wrong. Please try again." with retry |
| **Profile save** | Name or bio too long | Client-side maxLength on inputs prevents this; server-side Supabase column limits as a backstop |
| **Photo upload** | File too large | Client-side check: limit to 5MB. Show "Photo must be under 5MB." |
| **Photo upload** | Wrong file type | Client-side check: accept only .jpg, .png, .webp. Show "Please upload a JPG, PNG, or WebP image." |
| **Photo upload** | Upload fails | Show "Couldn't upload your photo. Please try again." Keep previous avatar. |
| **Protected page** | Not logged in | Server-side redirect to `/login` (user never sees the protected page) |

## Testing Strategy

Manual testing checklist for the Builder (test each after building):

### Auth Flow
- [ ] Sign up with email/password → lands on profile setup
- [ ] Sign up with same email twice → shows "already registered" error
- [ ] Log in with correct credentials → lands on profile
- [ ] Log in with wrong password → shows error message
- [ ] Log out → redirected to home page, header shows login/signup
- [ ] Google sign up → consent screen → callback → profile setup
- [ ] Google login (returning user) → callback → profile page
- [ ] Close and reopen browser → session persists (still logged in)
- [ ] Visit `/profile` while logged out → redirected to `/login`
- [ ] Visit `/signup` while logged in → redirected to `/profile`
- [ ] Request password reset → email arrives with reset link
- [ ] Double-click signup/login button → only one request fires

### Profile Flow
- [ ] Complete profile setup: fill name, bio, upload photo, add skills → saved correctly
- [ ] Skip profile setup → lands on profile page without redirect loop
- [ ] View profile: all data displays correctly
- [ ] Edit profile: change name/bio → changes persist
- [ ] Upload new photo → replaces old one
- [ ] Add and remove skills/needs tags → updates correctly
- [ ] Profile with no photo shows initials placeholder
- [ ] Profile with no bio shows subtle prompt

### Responsive
- [ ] Signup page looks good on mobile (375px) and desktop (1440px)
- [ ] Login page looks good on mobile and desktop
- [ ] Profile setup, view, and edit pages work on mobile
- [ ] Header auth links/avatar work on mobile (may need hamburger menu later, but basic links work for now)

### Build
- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes (or only has pre-existing warnings)
- [ ] Waitlist form still works after the `supabase.ts` → `supabase/admin.ts` move

## Security Considerations

| Concern | How It's Addressed |
|---------|-------------------|
| **Password storage** | Supabase handles hashing (bcrypt) — we never see or store raw passwords |
| **Session tokens** | Stored in HTTP-only cookies via `@supabase/ssr`. Not accessible by JavaScript, resistant to XSS. |
| **Data access** | Row Level Security enforced at the database level. Users can only read/update their own profile, even if app code has bugs. |
| **File uploads** | Storage RLS ensures users can only upload to their own `avatars/{user_id}/` folder. Client-side validation for file type and size. Server-side: storage bucket can be configured with a 5MB max file size in Supabase Dashboard as a backstop. |
| **Input length limits** | Name limited to 100 characters, bio to 500 characters on the client. Consider adding `CHECK` constraints on the Supabase columns as a server-side backstop. |
| **Service role key** | The `SUPABASE_SERVICE_ROLE_KEY` (which bypasses RLS) is only used server-side in the waitlist API route. The new auth flow uses the publishable key, which respects RLS. |
| **OAuth** | Google OAuth uses PKCE flow (proof of code exchange), the current standard. Redirect URLs are locked to the Supabase project domain. |
| **CSRF** | Supabase Auth tokens are cookie-based with SameSite protection. The `proxy.ts` refreshes tokens server-side, not via client-side JavaScript. |
| **Rate limiting** | Supabase Auth has built-in rate limiting on auth endpoints (signup, login, password reset). No additional rate limiting needed at the app level for MVP. |
| **Password reset email enumeration** | The forgot-password page shows the same success message whether the email exists or not, preventing attackers from discovering which emails are registered. |

## Open Questions

These need Jack's input or a decision during the build:

1. **Email confirmation:** Should users confirm their email before they can use the app? Supabase supports this out of the box, but it adds friction (user has to check email, click link, come back). For an MVP focused on speed, we could skip it initially and add it later. **Recommendation:** Skip for now — let users in immediately. Add email confirmation later when trust matters more.

2. **Google OAuth priority:** Is Google login a must-have for launch, or a nice-to-have? It requires setting up a Google Cloud project and OAuth credentials, which Jack would need to do in the Google Console. **Recommendation:** Build it in Phase 2 since the code is trivial (one button, one function call), but Jack can defer the Google Cloud setup if it's holding up the launch.

3. **Profile completeness:** After signup, should we force users through `/profile/setup` before they can access anything else, or let them skip and complete it later? **Recommendation:** Redirect to setup after signup, but allow skipping with a "Skip for now" link. Show a subtle banner on `/profile` if the profile is incomplete.

4. **Predefined skills list:** Should Lancers pick from a predefined list of skills (plumbing, electrical, painting, etc.) or free-type anything? Predefined is better for future search/matching but limits flexibility. **Recommendation:** Free-type for now (simpler to build). Add predefined categories when we build search/matching later.

## Review Notes

**Reviewed by:** Senior Reviewer Agent
**Date:** February 17, 2026
**Verdict:** Ready for build

### Changes Made

1. **Fixed critical file conflict** — The plan created `src/lib/supabase/client.ts` and `src/lib/supabase/server.ts`, but `src/lib/supabase.ts` already exists as a file. You can't have a file and a directory with the same name. Added a Phase 1 task to move `supabase.ts` → `supabase/admin.ts` and update the waitlist route import. Without this fix, the build would fail immediately.

2. **Updated environment variable naming** — Changed `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Supabase is transitioning to the new "publishable key" naming convention. Both work during the transition, but the plan should use the current standard.

3. **Switched proxy from `getUser()` to `getClaims()`** — The proxy runs on every single request. `getUser()` makes a database call to Supabase on each request; `getClaims()` validates the JWT locally with zero network calls. For a session-refresh proxy, `getClaims()` is the correct choice — faster and lower latency. Updated the proxy description and route protection examples.

4. **Added `amplify.yml` update to the build order** — The plan mentioned adding the new env variable to Amplify Console but forgot to update `amplify.yml`, which is what actually writes env vars to `.env.production` during the build. Without this, the publishable key would be undefined in production. Deployment would silently break.

5. **Added password reset page** — The original plan recommended including password reset (Open Question #2 said "Include it"), but never added it to the build order. Added `/forgot-password` page to Phase 2, plus error handling and testing entries. It's a single simple page — not building it would be a noticeable gap since users expect it.

6. **Made `user_type` metadata passing explicit** — The database trigger reads `user_type` from `raw_user_meta_data`, but the SignUpForm description didn't mention passing it in the `signUp()` call. This is a subtle bug that would cause all users to default to "homeowner." Added the exact `options: { data: { user_type } }` syntax to the SignUpForm description and data flow diagram.

7. **Clarified OAuth callback logic** — The plan said the callback redirects new users to `/profile/setup` and returning users to `/profile`, but didn't explain how to distinguish them. Added the specific check: query `profiles.full_name` — null means new user, set means returning user.

8. **Added profile setup skip handling** — Without a "Skip for now" option, users who don't want to complete their profile immediately could get stuck in a redirect loop (`/profile` → redirect to `/profile/setup` → back to `/profile`). Added skip link and adjusted the `/profile` redirect logic.

9. **Added input length limits** — Name and bio fields had no length limits, which means a user (or bot) could submit enormous strings. Added maxLength 100 for name, 500 for bio, and max 20 tags for skills. Simple client-side enforcement with optional server-side `CHECK` constraints noted.

10. **Added double-submit protection** — AuthButton now explicitly disables while loading. Added to error handling table and testing checklist.

11. **Removed Open Question #2 (Password Reset)** — Since the recommendation was "include it" and I've now added it to the build order, it's no longer an open question.

12. **Added password reset security** — The forgot-password page shows the same success message regardless of whether the email exists. This prevents email enumeration attacks (an attacker can't discover which emails are registered by trying resets).

### Flagged for Jack
- **Google OAuth setup** — Jack needs to create a Google Cloud project and OAuth credentials if he wants Google login. The code side is trivial, but the Google Console setup requires Jack's Google account. This can be deferred without blocking the build.
- **Supabase free tier pausing** — Free Supabase projects pause after 7 days of inactivity. As long as there's any traffic (even Jack checking the site), this won't be an issue. If it becomes a problem, upgrading to Pro ($25/month) is the fix.
