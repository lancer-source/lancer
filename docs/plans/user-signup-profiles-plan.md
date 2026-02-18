# User Signup & Profiles — Implementation Plan

## Overview

Add user authentication and profile management to Lancer using Supabase Auth, Supabase Database, and Supabase Storage (per the research report recommendation). Users will be able to sign up with email/password or Google, create a profile with a name, photo, bio, and skills or needs, and view/edit their own profile. This turns Lancer from a landing page into a real product.

**Estimated build:** 2–3 sessions (multi-session feature)

## Architecture

### Data Flow

**Sign Up (email/password):**
```
User fills signup form → supabase.auth.signUp() → Supabase creates auth.users row
  → Database trigger creates profiles row → Redirect to /profile/setup
```

**Sign Up (Google OAuth):**
```
User clicks "Continue with Google" → supabase.auth.signInWithOAuth({ provider: 'google' })
  → Google consent screen → Redirect to /auth/callback → Exchange code for session
  → Database trigger creates profiles row → Redirect to /profile/setup
```

**Login:**
```
User fills login form → supabase.auth.signInWithPassword() → Session cookie set
  → Redirect to /profile (or /profile/setup if profile incomplete)
```

**Profile Update:**
```
User edits profile form → supabase.from('profiles').update() → Profile saved
Photo: browser → supabase.storage.upload() → Public URL saved to profiles.avatar_url
```

**Session Management:**
```
Every request → proxy.ts → supabase.auth.getUser() → Refreshes expired tokens
  → Updated cookies passed to Server Components and browser
```

### Component Structure

**New shared UI components** (`src/components/ui/`):
| Component | Purpose |
|-----------|---------|
| `AuthInput.tsx` | Styled text input for auth forms (email, password, name fields) — consistent styling across all forms |
| `AuthButton.tsx` | Styled submit button with loading state — consistent with brand-600 rounded-full pattern |

**New auth components** (`src/components/auth/`):
| Component | Purpose |
|-----------|---------|
| `SignUpForm.tsx` | Email, password, confirm password, user type selector, submit. Client component with form state. |
| `LoginForm.tsx` | Email, password, submit, "Forgot password?" link. Client component with form state. |
| `GoogleAuthButton.tsx` | "Continue with Google" button. Calls `supabase.auth.signInWithOAuth()`. |
| `UserTypeSelector.tsx` | Lancer / Homeowner pill selector. Reuses the pattern from `WaitlistForm.tsx`. |
| `LogoutButton.tsx` | Small button/link that calls `supabase.auth.signOut()` and redirects to `/`. |

**New profile components** (`src/components/profile/`):
| Component | Purpose |
|-----------|---------|
| `ProfileForm.tsx` | Name, bio, skills/needs editor. Used on both `/profile/setup` and `/profile/edit`. |
| `AvatarUpload.tsx` | Photo upload with preview. Uploads directly to Supabase Storage. |
| `ProfileCard.tsx` | Read-only profile display: avatar, name, bio, skills/needs. Used on `/profile`. |
| `SkillsInput.tsx` | Tag-style input for adding/removing skills (Lancers) or needs (homeowners). |

**Modified components:**
| Component | Changes |
|-----------|---------|
| `Header.tsx` | Add auth-aware navigation: show "Log In" / "Sign Up" when logged out, show user avatar + "My Profile" / "Log Out" when logged in |

### API Routes / Route Handlers

| Route | Method | Purpose |
|-------|--------|---------|
| `/auth/callback/route.ts` | GET | Exchange OAuth code for session after Google login. Redirects to `/profile/setup` or `/profile`. |
| `/api/waitlist/route.ts` | POST/GET | **No changes** — existing waitlist keeps working as-is |

No new API routes needed for profile CRUD — Supabase client SDK talks directly to the database from the browser (protected by RLS). This is simpler and avoids building custom API routes for every operation.

### Route Protection

Protected routes (require login) are enforced at the **page level** using Server Components. Each protected page reads the session from cookies using the server Supabase client:

```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')
```

This is the Next.js 16 / Supabase recommended pattern — no wrapper components needed.

## File Changes

### New Files

| File | Purpose |
|------|---------|
| **Lib / Utilities** | |
| `src/lib/supabase/client.ts` | Browser Supabase client (for Client Components) |
| `src/lib/supabase/server.ts` | Server Supabase client (for Server Components, Route Handlers) |
| `src/types/database.ts` | TypeScript types for the profiles table |
| `src/proxy.ts` | Session refresh on every request (Next.js 16 convention) |
| **Auth Pages** | |
| `src/app/signup/page.tsx` | Sign up page |
| `src/app/login/page.tsx` | Log in page |
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
| `src/components/sections/Header.tsx` | Add auth-aware nav: login/signup links when logged out, profile link + logout when logged in. Will need `'use client'` (already has it) and Supabase browser client to check auth state. |
| `src/app/layout.tsx` | No structural changes needed. The proxy handles session refresh, and the Supabase client reads cookies directly. |
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
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key. Safe to expose in the browser. Respects Row Level Security policies. Find it in Supabase Dashboard → Settings → API. |

**Existing (no changes):**
- `NEXT_PUBLIC_SUPABASE_URL` — Already set up
- `SUPABASE_SERVICE_ROLE_KEY` — Already set up (server-only, used by waitlist)

**Google OAuth credentials** go directly in the Supabase Dashboard (Authentication → Providers → Google), NOT in env files.

## Build Order

### Phase 1: Foundation
Set up the Supabase client infrastructure and database schema. No visible pages yet, but the plumbing that everything else depends on.

- [ ] Install `@supabase/ssr`: `npm install @supabase/ssr`
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
- [ ] Create `src/lib/supabase/client.ts` — browser client using `createBrowserClient` from `@supabase/ssr`
- [ ] Create `src/lib/supabase/server.ts` — server client using `createServerClient` with cookie handlers
- [ ] Create `src/proxy.ts` — session refresh proxy (calls `supabase.auth.getUser()` on every request)
- [ ] Create `src/types/database.ts` — TypeScript type for the `Profile` row
- [ ] Run SQL in Supabase Dashboard: create `profiles` table, enable RLS, add policies, create auto-insert trigger
- [ ] Create `avatars` storage bucket in Supabase Dashboard, add storage RLS policies
- [ ] **Checkpoint:** `npm run build` passes. No visible changes yet, but the infrastructure is ready.

**Commit:** `feat: add Supabase SSR client infrastructure and proxy`

### Phase 2: Auth (Sign Up, Log In, Log Out)
Build the authentication flow — the user-facing pages for creating accounts and logging in.

- [ ] Create `src/components/ui/AuthInput.tsx` — styled input matching existing form patterns (rounded-full, border-slate-300, focus:border-brand-500)
- [ ] Create `src/components/ui/AuthButton.tsx` — styled button matching existing pattern (rounded-full, bg-brand-600, loading state)
- [ ] Create `src/components/auth/UserTypeSelector.tsx` — Lancer/Homeowner pill selector (extract pattern from `WaitlistForm.tsx`)
- [ ] Create `src/components/auth/GoogleAuthButton.tsx` — "Continue with Google" button with Google icon, calls `signInWithOAuth`
- [ ] Create `src/components/auth/SignUpForm.tsx` — email + password + confirm password + UserTypeSelector + GoogleAuthButton. Follow `WaitlistForm.tsx` patterns for state management (idle/loading/success/error)
- [ ] Create `src/app/signup/page.tsx` — centered card layout with SignUpForm. Redirect to `/profile` if already logged in.
- [ ] Create `src/components/auth/LoginForm.tsx` — email + password + GoogleAuthButton + "Don't have an account?" link to /signup
- [ ] Create `src/app/login/page.tsx` — centered card layout with LoginForm. Redirect to `/profile` if already logged in.
- [ ] Create `src/app/auth/callback/route.ts` — exchange OAuth code for session, redirect to `/profile/setup` (new users) or `/profile` (returning users)
- [ ] Create `src/components/auth/LogoutButton.tsx` — calls `supabase.auth.signOut()`, redirects to `/`
- [ ] **Checkpoint:** Can sign up with email/password, log in, log out. Google OAuth redirects work. Auth state persists across page refreshes. `npm run build` passes.

**Commit:** `feat: add signup, login, and logout with Supabase Auth`

### Phase 3: Profile Setup & View
Build the profile pages — the post-signup experience where users complete their profile and can view it.

- [ ] Create `src/components/profile/AvatarUpload.tsx` — file input with image preview, uploads to Supabase Storage `avatars/{user_id}/avatar.ext`, returns public URL. Shows current avatar if one exists.
- [ ] Create `src/components/profile/SkillsInput.tsx` — text input where user types a skill/need and presses Enter to add it as a tag. Tags are removable. Stores as `string[]`.
- [ ] Create `src/components/profile/ProfileForm.tsx` — full name input, bio textarea, AvatarUpload, SkillsInput (label changes based on user_type: "Your Skills" for Lancers, "Your Home Service Needs" for homeowners). Has save button with loading state.
- [ ] Create `src/app/profile/setup/page.tsx` — protected page. Shows "Complete Your Profile" heading + ProfileForm. On save, redirect to `/profile`. Server-side check: if user not logged in, redirect to `/login`.
- [ ] Create `src/components/profile/ProfileCard.tsx` — displays avatar (or placeholder), full name, user type badge ("Lancer" or "Homeowner"), bio, skills/needs tags. Read-only. "Edit Profile" link.
- [ ] Create `src/app/profile/page.tsx` — protected page. Fetches profile data server-side. Shows ProfileCard. If profile is incomplete (no full_name), redirect to `/profile/setup`.
- [ ] Create `src/app/profile/edit/page.tsx` — protected page. Loads current profile data, shows ProfileForm pre-filled. On save, redirect to `/profile`.
- [ ] **Checkpoint:** Full flow works: sign up → profile setup → view profile → edit profile. Photos upload and display correctly. Skills/needs tags work. `npm run build` passes.

**Commit:** `feat: add profile setup, view, and edit pages`

### Phase 4: Header Integration & Polish
Connect auth state to the site-wide header and handle edge cases.

- [ ] Update `src/components/sections/Header.tsx`:
  - When logged out: show "Log In" text link + "Sign Up" brand-600 button (right side of nav)
  - When logged in: show user's avatar (small circle, or initials placeholder) + "My Profile" link + LogoutButton
  - Use Supabase browser client to check auth state with `onAuthStateChange` listener
- [ ] Add "Already on the waitlist? Log in" link to the hero section or near the waitlist form
- [ ] Handle auth errors with user-friendly messages:
  - "Email already registered" → suggest logging in
  - "Invalid password" → clear message
  - "Email not confirmed" → tell user to check inbox
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
| **Login** | Wrong credentials | Show "Invalid email or password." (don't reveal which is wrong) |
| **Login** | Email not confirmed | Show "Please check your email to confirm your account." |
| **OAuth** | Google login cancelled | Redirect back to `/login` with no error (user chose to cancel) |
| **OAuth** | Callback error | Show generic error page with "Try again" link |
| **Profile save** | Network error | Show "Something went wrong. Please try again." with retry |
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

### Profile Flow
- [ ] Complete profile setup: fill name, bio, upload photo, add skills → saved correctly
- [ ] View profile: all data displays correctly
- [ ] Edit profile: change name/bio → changes persist
- [ ] Upload new photo → replaces old one
- [ ] Add and remove skills/needs tags → updates correctly
- [ ] Profile with no photo shows initials placeholder

### Responsive
- [ ] Signup page looks good on mobile (375px) and desktop (1440px)
- [ ] Login page looks good on mobile and desktop
- [ ] Profile setup, view, and edit pages work on mobile
- [ ] Header auth links/avatar work on mobile (may need hamburger menu later, but basic links work for now)

### Build
- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes (or only has pre-existing warnings)

## Security Considerations

| Concern | How It's Addressed |
|---------|-------------------|
| **Password storage** | Supabase handles hashing (bcrypt) — we never see or store raw passwords |
| **Session tokens** | Stored in HTTP-only cookies via `@supabase/ssr`. Not accessible by JavaScript, resistant to XSS. |
| **Data access** | Row Level Security enforced at the database level. Users can only read/update their own profile, even if app code has bugs. |
| **File uploads** | Storage RLS ensures users can only upload to their own `avatars/{user_id}/` folder. File type validation on the client prevents non-image uploads. |
| **Service role key** | The `SUPABASE_SERVICE_ROLE_KEY` (which bypasses RLS) is only used server-side in the waitlist API route. The new auth flow uses the anon key, which respects RLS. |
| **OAuth** | Google OAuth uses PKCE flow (proof of code exchange), the current standard. Redirect URLs are locked to the Supabase project domain. |
| **CSRF** | Supabase Auth tokens are cookie-based with SameSite protection. The `proxy.ts` refreshes tokens server-side, not via client-side JavaScript. |

## Open Questions

These need Jack's input or a decision during the build:

1. **Email confirmation:** Should users confirm their email before they can use the app? Supabase supports this out of the box, but it adds friction (user has to check email, click link, come back). For an MVP focused on speed, we could skip it initially and add it later. **Recommendation:** Skip for now — let users in immediately. Add email confirmation later when trust matters more.

2. **Password reset:** Should we build a "Forgot password?" flow? It's straightforward with Supabase (sends a reset link email), but it's another page to build. **Recommendation:** Include it — it's a single page and users expect it. Without it, locked-out users have no way back in.

3. **Google OAuth priority:** Is Google login a must-have for launch, or a nice-to-have? It requires setting up a Google Cloud project and OAuth credentials, which Jack would need to do in the Google Console. **Recommendation:** Build it in Phase 2 since the code is trivial (one button, one function call), but Jack can defer the Google Cloud setup if it's holding up the launch.

4. **Profile completeness:** After signup, should we force users through `/profile/setup` before they can access anything else, or let them skip and complete it later? **Recommendation:** Redirect to setup after signup, but allow skipping. Show a subtle banner on `/profile` if the profile is incomplete.

5. **Predefined skills list:** Should Lancers pick from a predefined list of skills (plumbing, electrical, painting, etc.) or free-type anything? Predefined is better for future search/matching but limits flexibility. **Recommendation:** Free-type for now (simpler to build). Add predefined categories when we build search/matching later.
