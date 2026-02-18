# User Signup & Profiles — Research Report

## Summary

Lancer needs user signup (email/password + Google login) and profile creation (name, photo, bio, skills or needs) to hit its 30-day goal. After evaluating four options, **the recommendation is Supabase Auth + Supabase Database + Supabase Storage** — an all-in-one approach using the service we already have set up. It's free at our scale, has first-class Next.js 16 support, and avoids adding any new services or accounts.

## Business Context

Lancer is building a marketplace connecting skilled workers with homeowners. Right now we have a landing page with a waitlist. The 30-day goal is a working site where both Lancers and homeowners can:

1. **Sign up** with email/password (and optionally Google login)
2. **Create a profile** — name, photo, bio, and either skills (Lancers) or home service needs (homeowners)
3. **View their own profile**

What's NOT in scope yet: browsing other profiles, search/matching, messaging, or payments. This is about getting real users into the system with real profiles — the foundation everything else builds on.

**Why this matters:** Without user accounts, Lancer is just a landing page. With them, it becomes a product. Real profiles also give Jack something tangible to show investors and potential co-founders.

## Options Evaluated

### Option 1: Supabase Auth + Database + Storage (Recommended)

- **What:** Use Supabase for everything — authentication (email/password + Google OAuth), a Postgres `profiles` table for user data, and Supabase Storage for profile photo uploads. Lancer already has a Supabase project set up for the waitlist, so this extends what's already there rather than adding something new.
- **Pros:**
  - Already set up — Supabase project exists, `@supabase/supabase-js` is installed, env variables are configured
  - One service for auth + database + file storage = one dashboard, one bill, one SDK
  - Row Level Security (RLS) ties auth directly to data access — users can only see/edit their own profiles by default
  - 50,000 free monthly active users — orders of magnitude more than Lancer needs right now
  - 500 MB database + 1 GB file storage on the free tier — plenty for hundreds of profiles with photos
  - `@supabase/ssr` package has explicit Next.js 16 support (works with the new `proxy.ts` convention)
  - Google OAuth is a toggle in the Supabase dashboard + a few lines of code
  - Profile photos upload directly from the browser to Supabase Storage — no server needed, works perfectly with Amplify's serverless hosting
  - Auto-create profiles on signup via database triggers (user signs up → profile row created automatically)
  - Built-in email confirmation, password reset, and session management
- **Cons:**
  - Auth UI is basic — you build your own login/signup forms (more work than Clerk's pre-built components)
  - Session management requires a `proxy.ts` file to refresh tokens on each request
  - Free projects pause after 7 days of inactivity (need to keep the project active, or upgrade to Pro at $25/mo)
  - Supabase is a younger company than Google/AWS — slightly more vendor risk
  - Documentation can be scattered across old auth-helpers and new SSR patterns
- **Cost:** $0 at Lancer's scale (50K MAU, 500 MB database, 1 GB storage all included in free tier). Pro plan is $25/month if you need more.
- **Effort:** Low-Medium — the Supabase project already exists. Need to add `@supabase/ssr`, create browser/server client utilities, set up `proxy.ts` for session refresh, create the profiles table + RLS policies, and build the auth/profile UI pages.
- **Best for:** Projects already using Supabase that want a unified backend without adding new services

### Option 2: Clerk (Auth) + Supabase (Database + Storage)

- **What:** Use Clerk for authentication (signup, login, user management) and keep Supabase for the database and file storage. Clerk provides beautiful pre-built UI components for sign-up, sign-in, and user profile pages — you drop them in and they work.
- **Pros:**
  - Pre-built UI components — sign-up, sign-in, and user profile pages work out of the box with ~5 minutes of setup
  - Excellent Next.js integration (first-class App Router support)
  - Handles email verification, password reset, social login, and MFA automatically
  - Beautiful, polished UI that looks professional immediately
  - 50,000 free monthly retained users (generous free tier)
  - User metadata syncing via webhooks to keep Supabase profiles in sync
  - Great developer experience and documentation
- **Cons:**
  - Adds a second service alongside Supabase — two dashboards, two accounts, two SDKs
  - Requires webhook setup to sync Clerk users → Supabase profiles table (additional complexity)
  - Clerk owns your auth data — harder to migrate away later
  - After free tier, costs $0.02 per monthly active user ($20/month at 1,000 MAU, $100/month at 5,000 MAU)
  - Auth and database are decoupled — no native RLS integration (Clerk JWT → Supabase requires custom JWT templates)
  - More moving parts = more things that can break
- **Cost:** $0 up to 50K users. After that, $0.02/MAU. Also need Supabase ($0 on free tier) for the database/storage.
- **Effort:** Low for auth (pre-built components), Medium for integration (webhook syncing, JWT configuration for Supabase RLS)
- **Best for:** Teams that prioritize beautiful auth UI and are willing to pay for convenience and manage two services

### Option 3: Auth.js v5 (NextAuth) + Supabase (Database + Storage)

- **What:** Auth.js (formerly NextAuth.js) is the most popular open-source auth library for Next.js. It handles email/password and OAuth login, and you'd use Supabase for the database (with a Supabase adapter) and file storage.
- **Pros:**
  - Free and open-source — no usage limits, no vendor lock-in
  - 50+ OAuth providers supported (Google, GitHub, Apple, etc.)
  - Full control over every aspect of authentication
  - Large community and ecosystem
  - v5 has a simpler API — single `auth()` function works everywhere (server components, route handlers, proxy)
  - Database adapter pattern means you own all the auth data in your own Supabase database
- **Cons:**
  - No pre-built UI — you build all login, signup, and profile pages from scratch
  - More boilerplate code and configuration than managed solutions
  - Email/password auth (called "Credentials provider") requires extra care for security — you handle password hashing, rate limiting, etc.
  - Documentation has been in flux during the v4→v5 migration — some guides are outdated
  - Community-maintained adapters can lag behind framework updates
  - Session management and token refresh require manual setup
  - Steeper learning curve, especially for non-technical teams
- **Cost:** $0 (fully open-source). Only pay for Supabase database/storage (free tier).
- **Effort:** High — build auth forms, configure providers, set up database adapter, handle email verification flow, password reset flow, session management, and proxy integration. Significant code to write and maintain.
- **Best for:** Experienced developers who need maximum control and customization of the auth flow

### Option 4: Firebase Auth + Supabase (Database + Storage)

- **What:** Use Google's Firebase Authentication for signup/login and keep Supabase for the database and storage. Firebase Auth is battle-tested, handles email/password and Google login natively, and has a generous free tier.
- **Pros:**
  - Battle-tested at massive scale (Google infrastructure)
  - Excellent Google OAuth support (it's Google's own service)
  - Pre-built UI library (FirebaseUI) for login flows
  - Generous free tier (no MAU limit on most auth methods)
  - Good React/Next.js support
- **Cons:**
  - Adds a completely separate service (Firebase) alongside Supabase — different paradigm, different SDK, different dashboard
  - Firebase and Supabase are competing products — using both is architecturally awkward
  - Syncing Firebase auth users to Supabase profiles requires custom server-side logic
  - Firebase SDK is heavy (~100KB+ added to client bundle)
  - No native integration with Supabase RLS (have to verify Firebase tokens manually)
  - Google vendor lock-in for auth
  - Adds unnecessary complexity when Supabase already offers the same capability
- **Cost:** $0 (Firebase Auth is free for email/password and most social providers). Also need Supabase ($0 on free tier) for database/storage.
- **Effort:** Medium-High — set up Firebase project, install Firebase SDK, build auth UI, create sync logic between Firebase users and Supabase profiles, configure custom token verification
- **Best for:** Projects already using Firebase for other features (not Lancer's situation)

## Recommendation

**Use Supabase for everything — Auth, Database, and Storage.** Here's why:

### 1. We're already there
Supabase is already set up. The `@supabase/supabase-js` package is installed. Environment variables are configured. The waitlist API route already talks to Supabase. Adding auth and profiles extends what exists rather than bolting on something new.

### 2. One service = simplicity
Every additional service adds complexity — a new account, a new dashboard, a new SDK, new failure points, and data syncing logic. With Supabase handling auth + database + storage, everything lives in one place. When a user signs up, their auth record and profile are in the same system. No webhooks, no syncing, no glue code.

### 3. Row Level Security is a superpower
Supabase RLS means you write a one-line SQL policy like "users can only read/update their own profile" and it's enforced at the database level. Even if there's a bug in your app code, the database won't let User A see User B's data. With Clerk or Firebase, you'd have to enforce this in your application code — more work and more room for mistakes.

### 4. The free tier is absurdly generous for Lancer's stage
50,000 monthly active users, 500 MB database, 1 GB file storage. Lancer's 30-day goal is basic signup and profiles. Even the 90-day goal of 500 users wouldn't use 1% of the free tier. This won't cost a penny until Lancer is a real business with real revenue.

### 5. Photo uploads work perfectly with serverless
This is a key concern since Amplify is serverless (no persistent file system). With Supabase Storage, profile photos upload directly from the user's browser to Supabase — the server is never involved. No file system needed, no server memory limits, no timeout issues. It just works.

### 6. Speed to ship
The biggest argument for Clerk is its pre-built UI. But the trade-off is integration complexity (webhook syncing, JWT templates, two dashboards). For Lancer's simple auth needs (email/password + Google, basic profile), building clean auth forms in Tailwind is straightforward and ships in the same timeframe — especially since we skip the Clerk↔Supabase integration headaches.

### When to reconsider
- **If Lancer needs advanced auth features** (MFA, SSO, organization management), Clerk would be worth the complexity. But that's not the 30-day or even 90-day goal.
- **If the team grows** and developer experience becomes more important than simplicity, Clerk's pre-built components save time at scale.
- **If Supabase's free tier becomes limiting** (pausing after inactivity is the main risk), upgrading to Pro at $25/month is the simple fix.

## Implementation Notes

### What the Planner and Builder Need to Know

#### 1. Install the SSR package

```bash
npm install @supabase/ssr
```

The project already has `@supabase/supabase-js`. The `@supabase/ssr` package adds cookie-based session management for server-side rendering in Next.js.

#### 2. Supabase Client Setup (two clients needed)

**Browser client** (`src/lib/supabase/client.ts`) — for Client Components:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Server client** (`src/lib/supabase/server.ts`) — for Server Components, Route Handlers, Server Actions:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options))
        }
      }
    }
  )
}
```

**Important:** The existing `src/lib/supabase.ts` (admin client with service role key) stays for server-only operations like the waitlist. The new clients use the **anon key** and respect RLS policies.

#### 3. Proxy Setup for Session Refresh (Next.js 16)

Next.js 16 replaced `middleware.ts` with `proxy.ts`. Create `src/proxy.ts` (or project root) to refresh auth tokens on every request:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        }
      }
    }
  )
  await supabase.auth.getUser()
  return supabaseResponse
}
```

This runs on every navigation, silently refreshing expired tokens so the user stays logged in.

#### 4. Database Schema

**Profiles table** (create in Supabase SQL Editor):

```sql
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  user_type text not null check (user_type in ('lancer', 'homeowner')),
  full_name text,
  bio text,
  avatar_url text,
  skills text[],        -- for Lancers (e.g., ['plumbing', 'electrical', 'painting'])
  needs text[],         -- for homeowners (e.g., ['kitchen remodel', 'lawn care'])
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (id)
);

alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Users can insert their own profile (for the trigger)
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);
```

**Auto-create profile on signup** (database trigger):

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, user_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'user_type', 'homeowner')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

This means every signup automatically creates a profile row. The user then fills in their name, bio, photo, and skills/needs on a profile setup page.

#### 5. Supabase Storage for Profile Photos

**Create an `avatars` bucket** in the Supabase dashboard (Storage → New Bucket → name: "avatars", public: yes).

**Storage RLS policies** (so users can only upload/update their own photo):

```sql
-- Allow authenticated users to upload their avatar
create policy "Users can upload own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update their avatar
create policy "Users can update own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow anyone to view avatars (public bucket)
create policy "Anyone can view avatars"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');
```

**Upload pattern:** Store photos as `avatars/{user_id}/avatar.jpg`. The client uploads directly to Supabase Storage (no server roundtrip). The public URL gets saved to `profiles.avatar_url`.

#### 6. Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Enable the Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret
7. In Supabase Dashboard → Authentication → Providers → Google → Enable and paste credentials

That's it. One toggle in the dashboard, one redirect URI. The code just calls `supabase.auth.signInWithOAuth({ provider: 'google' })`.

#### 7. Environment Variables

Existing (already set up):
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Admin key (server-only, for waitlist)

New (add to `.env.local` and Amplify Console):
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Public anon key (safe for browser, respects RLS)

No Google OAuth keys needed in `.env.local` — those go directly in the Supabase dashboard.

#### 8. Pages to Build

| Page | Route | Purpose |
|------|-------|---------|
| Sign Up | `/signup` | Email/password form + Google button + user type selector (Lancer or Homeowner) |
| Log In | `/login` | Email/password form + Google button |
| Auth Callback | `/auth/callback` | Handles OAuth redirects (route handler, not a page) |
| Profile Setup | `/profile/setup` | After signup: name, bio, photo upload, skills/needs |
| My Profile | `/profile` | View your own profile (read-only display) |
| Edit Profile | `/profile/edit` | Update name, bio, photo, skills/needs |

#### 9. Auth Flow

1. User visits `/signup` → enters email/password (or clicks "Sign in with Google")
2. Supabase creates the auth user + triggers auto-creation of profile row
3. User is redirected to `/profile/setup` to complete their profile
4. On `/profile/setup`, user enters name, bio, uploads photo, selects skills/needs
5. Profile data is saved to the `profiles` table, photo uploaded to `avatars` bucket
6. User can view their profile at `/profile` and edit at `/profile/edit`

#### 10. Amplify Compatibility

Everything works on Amplify's serverless hosting:
- **Auth:** Cookie-based sessions managed by `proxy.ts` — no file system needed
- **Database:** API calls to Supabase's hosted Postgres — no local database
- **Photo uploads:** Client-side uploads direct to Supabase Storage — no server file handling
- **Environment variables:** Set in Amplify Console, injected at build time

No changes needed to `amplify.yml` or the deployment pipeline.

## References

- [Supabase Auth — Next.js Quickstart](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
- [Supabase SSR — Creating a Client](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase AI Prompt — Bootstrap Next.js v16 with Supabase Auth](https://supabase.com/docs/guides/getting-started/ai-prompts/nextjs-supabase-auth)
- [Supabase Auth — Google Social Login](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase — Managing User Data (Profiles Pattern)](https://supabase.com/docs/guides/auth/managing-user-data)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage — Access Control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase Pricing](https://supabase.com/pricing)
- [Clerk Pricing](https://clerk.com/pricing)
- [Auth.js v5 — Migration Guide](https://authjs.dev/getting-started/migrating-to-v5)
- [Next.js 16 — Proxy (replacing Middleware)](https://nextjs.org/docs/app/getting-started/proxy)
- [Next.js 16 — Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
