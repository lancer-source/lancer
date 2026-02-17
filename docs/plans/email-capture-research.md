# Email Capture Upgrade — Research Report

## Summary

Lancer's waitlist currently stores emails to a local JSON file, which won't work on AWS Amplify in production (the file system is read-only in serverless). After evaluating five options, **the recommendation is Resend Contacts** — it stores waitlist signups AND gives you the ability to send emails later (welcome emails, launch announcements), all from one service with a clean API. It's free for up to 1,000 contacts, which matches Lancer's initial scale perfectly.

## Business Context

Lancer is pre-launch, collecting emails from people interested in the marketplace. The waitlist is the single most important conversion point on the site right now — every visitor who enters their email is a potential early user. The current implementation writes to a JSON file on disk, which works locally but fails on AWS Amplify because serverless deployments don't have a persistent file system.

**What we need:**
- Store waitlist emails reliably in production
- Works on AWS Amplify (serverless-compatible — no file system access)
- Free or very cheap (under 1,000 signups initially, no revenue yet)
- Ability to view who signed up (dashboard or exports)
- Future-ready: can eventually send emails (welcome, updates, launch day)

## Options Evaluated

### Option 1: Resend Contacts (Recommended)

- **What:** Resend is a modern email API built for developers. Beyond sending emails, it has a Contacts feature (formerly "Audiences") that lets you store and manage subscriber lists via API. You can store contacts now and send marketing emails to them later — all from one service.
- **Pros:**
  - Two-in-one: stores contacts AND sends emails (no second service needed later)
  - Dead simple API — 4 lines of code to add a contact
  - Clean TypeScript SDK with excellent docs
  - Built-in dashboard to see who signed up (no admin panel needed)
  - Contact properties let you tag signups (e.g., "lancer" vs "homeowner")
  - Handles unsubscribe management automatically
- **Cons:**
  - Free tier limited to 1,000 contacts (tight if growth is faster than expected)
  - Primary product is email sending — contact storage is a secondary feature
  - Requires domain verification to send emails (not needed for just storing contacts)
  - External vendor (not within AWS ecosystem)
- **Cost:** Free for up to 1,000 contacts + 3,000 emails/month. Pro plan is $20/month for 50,000 contacts if you outgrow the free tier.
- **Effort:** Low — add `resend` npm package, update API route, set one env variable (API key)
- **Best for:** Startups that want contact storage + email sending in one tool with minimal code

### Option 2: AWS DynamoDB (Direct via AWS SDK)

- **What:** Amazon's serverless NoSQL database. You create a table, and your API route reads/writes to it using the AWS SDK. Since Lancer is already on AWS Amplify, this stays within the same ecosystem.
- **Pros:**
  - Already in the AWS ecosystem (Amplify → DynamoDB is natural)
  - Extremely generous free tier (25 GB storage, 25 read/write capacity units)
  - No contact limit — could store millions of emails without paying
  - Highly reliable and scalable (this is what Amazon uses internally)
  - No external vendor dependency
- **Cons:**
  - More setup: create DynamoDB table in AWS Console, create IAM credentials, configure env variables
  - AWS SDK adds bundle size (~200KB)
  - No email sending capability — you'd need to add a second service (SES, Resend) later for emails
  - No built-in dashboard for viewing signups (would need to build one or use AWS Console)
  - AWS IAM and permissions can be confusing for newcomers
- **Cost:** Free for years at Lancer's scale (25 GB stores millions of records)
- **Effort:** Medium — create DynamoDB table, set up IAM user, add AWS SDK, update API route
- **Best for:** Teams already deep in AWS who want maximum control and zero vendor lock-in

### Option 3: Supabase (Postgres Database)

- **What:** Supabase is an open-source Firebase alternative that gives you a full Postgres database, authentication, and more. Think of it as a backend-in-a-box.
- **Pros:**
  - Full Postgres database (can store anything, run complex queries)
  - Great developer experience and dashboard
  - Built-in auth system (useful for Milestone 3: user profiles)
  - Good Next.js integration with official SDK
  - Table viewer makes it easy to see and export signups
- **Cons:**
  - Overkill for just storing emails (bringing a truck to carry a grocery bag)
  - Free projects get paused after 1 week of inactivity (your waitlist API would stop working!)
  - Limited to 2 free projects total
  - Another external service to manage and monitor
  - 1 GB database storage on free tier (plenty for emails, but limited for future growth)
- **Cost:** Free tier (1 GB storage, 5 GB egress). Pro plan is $25/month.
- **Effort:** Medium — create Supabase project, add client SDK, create table, update API route
- **Best for:** Projects that need a full database and auth system (better fit for Milestone 3)

### Option 4: Mailchimp API

- **What:** The classic email marketing platform. Has an API to add subscribers to mailing lists and send campaigns.
- **Pros:**
  - Industry standard for email marketing
  - Powerful email campaign tools
  - Well-known brand (if investors ask what you use)
- **Cons:**
  - Free tier only allows 250 contacts — too low for Lancer's needs
  - Complex, verbose API (compared to Resend's simplicity)
  - Owned by Intuit — bloated platform with lots of features you don't need
  - API authentication is more complex (API key + server prefix + list ID)
  - The cheapest paid plan ($13/month) for 500 contacts is poor value
- **Cost:** Free up to 250 contacts only. Essentials plan starts at $13/month for 500 contacts.
- **Effort:** Medium-High — complex API setup, verbose request format, OAuth considerations
- **Best for:** Established businesses running sophisticated email campaigns (not early-stage startups)

### Option 5: Upstash Redis

- **What:** A serverless Redis database designed for edge and serverless environments. Store data as key-value pairs with a simple API.
- **Pros:**
  - Extremely fast (Redis is an in-memory database)
  - Simple API — just SET and GET operations
  - Serverless-native, works great with Next.js
  - Good rate-limiting features (can prevent waitlist spam)
  - Free tier: 256 MB storage, 500K commands/month
- **Cons:**
  - Redis is designed for caching, not long-term data storage (though Upstash does persist)
  - No built-in way to view stored data nicely (basic CLI only)
  - No email sending capability
  - Data model is awkward for a list of signups (have to manage your own data structure)
  - Not the standard tool for this job
- **Cost:** Free (256 MB, 500K commands/month). Pay-as-you-go after that ($0.20 per 100K commands).
- **Effort:** Low — add SDK, simple commands
- **Best for:** Rate limiting, caching, session storage (not ideal as a primary database for signups)

## Recommendation

**Use Resend Contacts.** Here's why:

1. **Two birds, one stone.** The roadmap says Lancer will eventually need to send welcome emails and launch announcements. Resend handles both storage and sending — you set it up once and never migrate.

2. **Simplest implementation.** The code change is minimal. Replace the JSON file read/write with one Resend API call. The existing API route structure barely changes.

3. **Free tier fits perfectly.** 1,000 contacts for free matches Jack's "under 1,000 signups initially" requirement exactly. If you hit the limit, that's a great problem to have, and $20/month for 50K contacts is a trivial cost at that point.

4. **Dashboard included.** Jack can log into Resend and see every signup — name, email, date, custom properties — without building an admin panel. You can also export to CSV.

5. **Fast to ship.** A developer (or builder agent) can implement this in a single session. One npm package, one API key, one code file to update.

**Why not DynamoDB?** It's the strongest runner-up. More generous free tier and stays in the AWS ecosystem. But it's more setup (IAM, table creation, SDK configuration) and doesn't help with future email sending. If you go DynamoDB for storage, you'd eventually add Resend or SES anyway for sending emails — so you'd end up with two services instead of one.

**When to reconsider:** If Lancer grows past 1,000 signups quickly and budget is extremely tight, DynamoDB's unlimited free storage is more generous. But at that point, $20/month for Resend Pro is a rounding error for a growing business.

## Implementation Notes

### What the Builder Agent Needs to Know

**1. Install the Resend SDK:**
```bash
npm install resend
```

**2. Create a Resend account and get an API key:**
- Sign up at [resend.com](https://resend.com)
- Create an API key in the dashboard
- Add to `.env.local`: `RESEND_API_KEY=re_xxxxxxxxx`

**3. Create an Audience (list) in the Resend dashboard:**
- Go to Audiences → Create Audience → Name it "Lancer Waitlist"
- Copy the Audience ID (you'll need it in the code)
- Add to `.env.local`: `RESEND_AUDIENCE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

**4. Update `src/app/api/waitlist/route.ts`:**
- Remove all `fs` (file system) imports and functions
- Import the Resend SDK
- On POST: use `resend.contacts.create()` to add the email
- On GET: use `resend.contacts.list()` to get the count
- Handle duplicate detection (Resend returns an error if the email already exists)

**5. Key API calls:**

```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

// Add a contact
const { data, error } = await resend.contacts.create({
  email: 'user@example.com',
  audienceId: process.env.RESEND_AUDIENCE_ID!,
  unsubscribed: false,
});

// List contacts (for count)
const { data } = await resend.contacts.list({
  audienceId: process.env.RESEND_AUDIENCE_ID!,
});
```

**6. Environment variables for AWS Amplify:**
- Add `RESEND_API_KEY` and `RESEND_AUDIENCE_ID` in the Amplify Console under Environment Variables
- These won't be in the code or committed to git

**7. Minimal frontend changes:**
- The `WaitlistForm.tsx` component doesn't need to change — it already calls `/api/waitlist` with the right format
- Only the API route (backend) changes

### What to Delete
- Remove `data/waitlist.json` references
- Remove `fs` import from the API route
- Remove `getWaitlist()` and `saveWaitlist()` helper functions

### What NOT to Change
- The `/api/waitlist` endpoint URL stays the same
- The request/response format stays the same (the frontend is already correct)
- The form component stays the same

## References

- [Resend Contacts API — Create Contact](https://resend.com/docs/api-reference/contacts/create-contact)
- [Resend Pricing](https://resend.com/pricing)
- [Resend Audiences Feature](https://resend.com/features/audiences)
- [Resend Next.js SDK](https://resend.com/docs/send-with-nextjs)
- [AWS DynamoDB Free Tier](https://aws.amazon.com/dynamodb/pricing/)
- [AWS DynamoDB + Next.js Template (Vercel)](https://vercel.com/templates/next.js/aws-dynamodb-with-nextjs-api-routes)
- [Supabase Pricing](https://supabase.com/pricing)
- [Supabase Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Mailchimp Pricing Plans](https://mailchimp.com/help/about-mailchimp-pricing-plans)
- [Upstash Redis Pricing](https://upstash.com/pricing/redis)
