# Lancer Development Roadmap

## Where We Are

The Lancer landing page is live on AWS Amplify with:
- A complete landing page (8 sections)
- A waitlist email capture form (stores to local JSON file)
- Clean, mobile-first design with emerald green theme
- Auto-deployment from `main` branch

## What's Next

### Milestone 1: Content & Styling Refresh
**Workflow:** Content Workflow (lightweight)
**Priority:** NOW
**Estimated effort:** 1-2 sessions

Jack reviews and updates the landing page content and styling to match his vision. This is about making the site feel right — the copy, the messaging, the visual tone.

**What to do:**
1. Open a Cursor session in `projects/lancer/`
2. Activate the Content Editor agent: `Follow the instructions in docs/agents/content-editor.md`
3. Walk through each section and update what needs changing
4. Review in the dev server, iterate until happy
5. Agent creates a PR → Jack merges → Amplify deploys

**Content to review:**
- [ ] Hero headline and subtext — does it hook the right audience?
- [ ] Features section — are these the right 3 benefits to highlight?
- [ ] How It Works — does the 3-step process make sense?
- [ ] Marketplace section — are the benefit lists complete and compelling?
- [ ] FAQ — are the right questions covered? Are the answers accurate?
- [ ] CTA — is the final call-to-action compelling?
- [ ] SEO metadata — is the page title and description right for search?
- [ ] Overall tone — does it feel like Lancer? Professional but approachable?

**Branch:** `content/landing-page-refresh`

---

### Milestone 2: Email Capture Upgrade
**Workflow:** Feature Development Workflow (full pipeline)
**Priority:** After Milestone 1
**Estimated effort:** 4-6 sessions across the pipeline

The current waitlist form saves emails to a local JSON file — that's fine for development but won't work in production on Amplify (the file system is read-only in serverless). We need a real email capture solution.

**What we need:**
- A reliable backend for storing waitlist signups
- Works on AWS Amplify (serverless-compatible)
- Free or very cheap at our current scale
- Bonus: ability to see who signed up (admin dashboard or exports)
- Future-ready: can eventually send welcome emails (not now, but later)

**The pipeline:**

| Step | Agent | What Happens |
|------|-------|-------------|
| 1. Research | Feature Researcher | Evaluate email capture backends (DynamoDB, Supabase, Resend, etc.) |
| 2. Plan | Feature Planner | Create implementation plan from research |
| 3. Review | Senior Reviewer | Review and improve the plan |
| 4. Build | Feature Builder | Implement the approved plan |
| 5. Code Review | Code Reviewer | Review code and create PR |
| 6. Ship | Jack | Approve and merge PR in GitHub |

**Branch:** `feature/email-capture`

**How to start:**
```
Follow the instructions in docs/agents/feature-researcher.md

Research the best way to handle email capture for Lancer's waitlist.
The current implementation uses a local JSON file (see src/app/api/waitlist/route.ts)
which won't work on AWS Amplify in production. I need a serverless-compatible
solution that's free or cheap at our scale (under 1,000 signups initially).

Consider: DynamoDB, Supabase, Resend audience lists, Mailchimp API,
or any other options that work with Next.js on AWS Amplify.
```

---

### Milestone 3: User Signup & Profiles (30-day goal)
**Workflow:** Feature Development Workflow (full pipeline)
**Priority:** After Milestone 2
**Estimated effort:** Multiple sessions, larger feature

Enable homeowners and Lancers to:
- Sign up with email/password (or social login)
- Create a profile (name, photo, bio, skills/needs)
- View their own profile

This is the 30-day goal from Jack's roadmap.

**Not in scope yet:**
- Browsing other profiles
- Search/matching
- Messaging
- Payments

---

### Milestone 4: Growth & Validation (90-day goal)
**Workflow:** Mix of content and feature workflows
**Priority:** After Milestone 3

Working toward 500 interested users and investor-ready state:
- SEO optimization
- Social proof / testimonials section
- Referral mechanics
- Analytics and conversion tracking
- Landing page A/B testing
- Investor-ready deck and metrics

---

## How to Use This Roadmap

1. **Work top-down.** Start with Milestone 1 and move forward.
2. **One milestone at a time.** Don't start Milestone 2 until 1 is merged and deployed.
3. **Follow the workflow.** Content changes use the Content Workflow. Features use the Feature Workflow.
4. **Jack drives priorities.** If business needs change, reorder the milestones.

## Decision Log

Track important decisions here as they happen:

| Date | Decision | Reasoning |
|------|----------|-----------|
| 2026-02-17 | Set up agentic development framework | Structured agent system for consistent development |
| | | |
