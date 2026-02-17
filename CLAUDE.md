# Lancer — AI Agent Context

## What Is This Project?

Lancer is an online marketplace for home services — connecting skilled workers ("Lancers") directly with homeowners. No middleman. Set your own rates, work your own schedule, keep more of your earnings. Think TaskRabbit, but the workers keep more and homeowners get better prices.

**Status:** Landing page live, waitlist capture functional (JSON file storage), deployed via AWS Amplify.

**Live URL:** Deployed on AWS Amplify (auto-deploys from `main` branch).

**Repo:** https://github.com/lancer-source/lancer

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript | 5.x |
| UI | React | 19.2.3 |
| Styling | Tailwind CSS | v4 |
| Fonts | Geist Sans + Geist Mono | via next/font |
| Hosting | AWS Amplify | Auto-deploy from main |
| Package Manager | npm | — |

**Important:** This project uses Tailwind CSS v4, which uses `@import "tailwindcss"` in CSS instead of a `tailwind.config.js` file. Theme customization is done via CSS variables in `src/app/globals.css`.

## Project Structure

```
projects/lancer/
├── CLAUDE.md              ← You are here
├── .cursorrules           ← Cursor IDE rules
├── amplify.yml            ← AWS Amplify build config
├── package.json           ← Dependencies and scripts
│
├── docs/
│   ├── agents/            ← Agent prompts for Lancer development
│   ├── workflows/         ← Workflow definitions (content vs feature)
│   ├── roadmap/           ← Development roadmap and priorities
│   └── plans/             ← Implementation plans for features
│
├── public/                ← Static assets (SVGs, images)
│
└── src/
    ├── app/
    │   ├── api/
    │   │   └── waitlist/
    │   │       └── route.ts       ← POST/GET waitlist endpoint
    │   ├── globals.css            ← Tailwind imports + CSS variables
    │   ├── layout.tsx             ← Root layout (metadata, fonts)
    │   └── page.tsx               ← Home page (/)
    │
    └── components/
        ├── forms/
        │   └── WaitlistForm.tsx   ← Email capture form (hero + section variants)
        │
        └── sections/
            ├── Header.tsx         ← Sticky nav with scroll effect
            ├── HeroSection.tsx    ← Hero with headline + waitlist form
            ├── FeaturesSection.tsx ← 3 feature cards
            ├── HowItWorksSection.tsx ← 3-step process
            ├── MarketplaceSection.tsx ← Worker + Homeowner benefits
            ├── FAQSection.tsx     ← Accordion FAQ
            ├── CTASection.tsx     ← Final CTA with waitlist form
            └── Footer.tsx         ← Simple footer
```

## Current State of the Landing Page

The page flows top-to-bottom as a single landing page:

1. **Header** — Fixed nav with "Lancer" logo and "Join Waitlist" button
2. **Hero** — "Your Skills. Your Income." headline, subtext, waitlist email form
3. **Features** — 3 cards: Keep Earnings, Work on Terms, Build Relationships
4. **How It Works** — 3 steps: Create Profile → Connect → Get Paid
5. **Marketplace** — Two-column: Worker benefits vs Homeowner benefits
6. **FAQ** — 6 accordion questions about Lancer
7. **CTA** — Dark section with "Ready to work on your terms?" + waitlist form
8. **Footer** — Logo + copyright

**Design:** Emerald green primary color, slate grays, clean whitespace, rounded cards, mobile-first responsive.

**Waitlist:** Currently stores emails to a local JSON file (`data/waitlist.json`). This needs to be upgraded to a proper backend solution for production.

## Design System

### Colors (Tailwind classes)
- **Primary:** `emerald-600` (buttons, accents), `emerald-500` (hover states), `emerald-50` (light backgrounds)
- **Text:** `slate-900` (headings), `slate-600` (body), `slate-500` (subtle)
- **Background:** `white`, `slate-50` (alternating sections)
- **Dark surfaces:** `slate-900` (CTA section)

### Typography
- **Font:** Geist Sans (body), Geist Mono (code/monospace)
- **Headings:** `font-bold tracking-tight`
- **Body:** `text-base leading-relaxed` or `text-lg`

### Components Patterns
- **Cards:** `rounded-2xl border border-slate-200 bg-white p-8`
- **Buttons:** `rounded-full bg-emerald-600 px-8 py-3 font-medium text-white`
- **Badges:** `rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700`
- **Sections:** Alternating white and `bg-slate-50`, with `py-20 md:py-32` padding
- **Max widths:** `max-w-7xl` (container), `max-w-3xl` (text content), `max-w-2xl` (section headers)

### Interaction Patterns
- **Hover states:** Cards lift with `hover:shadow-lg hover:border-emerald-200`
- **Header:** Transparent → white/blur on scroll
- **FAQ:** Accordion with smooth open/close animation

## Development Commands

```bash
npm run dev       # Start dev server at localhost:3000
npm run build     # Production build (always run before deploying)
npm run lint      # Check code quality
npm run start     # Serve production build locally
```

## Deployment

AWS Amplify auto-deploys when changes are pushed to `main`. The `amplify.yml` file configures the build:
- Install: `npm ci`
- Build: `npm run build`
- Output: `.next` directory

**To deploy:** Push to `main` branch → Amplify picks it up automatically.

**For feature work:** Use feature branches → Create PR → Jack approves → Merge to main → Auto-deploy.

## Agent System

This project uses AI agents for development. Each agent has a specific role and follows a defined workflow.

### Available Agents

| Agent | File | Purpose |
|-------|------|---------|
| Content Editor | `docs/agents/content-editor.md` | Content, copy, and styling changes |
| Feature Researcher | `docs/agents/feature-researcher.md` | Investigate best practices before building |
| Feature Planner | `docs/agents/feature-planner.md` | Create implementation plans for features |
| Senior Reviewer | `docs/agents/senior-reviewer.md` | Review and improve implementation plans |
| Feature Builder | `docs/agents/feature-builder.md` | Implement features from approved plans |
| Code Reviewer | `docs/agents/code-reviewer.md` | Review code before merging PRs |

### Two Workflow Types

**Content/Design Workflow** (lightweight):
For copy changes, styling tweaks, and visual updates. Jack works directly with the Content Editor agent. See `docs/workflows/content-workflow.md`.

**Feature Development Workflow** (full pipeline):
For new features like email capture, user profiles, etc. Multiple agents collaborate through a structured pipeline. See `docs/workflows/feature-workflow.md`.

### How to Start an Agent Session

Open a new Cursor session in `projects/lancer/` and tell the agent:

```
Follow the instructions in docs/agents/[agent-name].md

[Your task or instructions here]
```

## Standards & References

This project follows the standards defined at the workspace level:
- **Coding:** `the-garage/docs/standards/coding-standards.md`
- **UI/UX:** `the-garage/docs/standards/ui-ux-standards.md`
- **Project:** `the-garage/docs/standards/project-standards.md`
- **Agent Workflow:** `the-garage/docs/standards/agent-workflow.md`

## Git Workflow

All agents manage git automatically. Jack should not need to think about git.

### Branch Strategy
- **`main`** — Always deployable. Merges trigger Amplify deployment.
- **Feature branches** — All new work happens on branches:
  ```
  content/update-landing-copy
  feature/email-capture-upgrade
  feature/user-profiles
  ```

### Commit Convention
```bash
feat: add new waitlist confirmation page
fix: correct mobile layout on features section
style: update hero section spacing and colors
content: update FAQ answers and headline copy
docs: add email capture implementation plan
refactor: extract email validation to utility
```

### PR Flow
1. Agent creates feature branch
2. Agent does the work, commits along the way
3. Agent (or Code Reviewer) creates PR with summary
4. Jack reviews and approves in GitHub
5. Merge to main → Auto-deploy on Amplify

## Important Notes

- Jack is learning to code — explain everything in plain language
- Design matters — this is for idea validation, it needs to look professional
- Mobile-first — most visitors will come from ads on phones
- Ship fast — get it working, then polish
- The waitlist form already exists but needs a proper backend (not JSON files)
- Never commit `.env.local` or the `data/` directory
- Always run `npm run build` before saying something is done
