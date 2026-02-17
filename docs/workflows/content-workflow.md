# Content & Design Workflow

## What This Is

A lightweight workflow for making content, copy, and styling changes to the Lancer site. This is the "quick changes" path — no research or planning docs needed. Jack works directly with the Content Editor agent.

**Use this for:** Changing text, updating headlines, tweaking colors, adjusting spacing, updating FAQ answers, fixing typos, rearranging sections, adding/removing content.

**Don't use this for:** Adding new features, integrating APIs, changing how forms work, adding new pages. Use the Feature Development Workflow for those.

## How It Works

```
Jack has content/design changes
        ↓
Content Editor agent creates a branch
        ↓
Jack describes what to change (or edits directly with agent help)
        ↓
Agent makes changes, shows results
        ↓
Jack reviews in dev server (localhost:3000)
        ↓
Agent commits and creates PR
        ↓
Jack approves and merges in GitHub
        ↓
Amplify auto-deploys to production
```

## Step by Step

### 1. Start the Session

Open a Cursor session in `projects/lancer/` and tell the agent:

```
Follow the instructions in docs/agents/content-editor.md

I want to [describe what you want to change].
```

**Examples:**
- "I want to update the hero headline and subtext"
- "I want to rewrite the FAQ answers"
- "I want to change the color scheme from emerald to blue"
- "I want to rearrange the sections on the landing page"

### 2. Agent Creates a Branch

The agent will create a branch like:
```
content/update-hero-copy
content/redesign-features-section
content/update-faq-answers
```

### 3. Make Changes Together

The agent will:
- Show you the current content
- Make changes based on your direction
- Show you what changed
- Let you review in the dev server

**You're the creative director.** The agent handles the code, you decide what it says and how it looks.

### 4. Review and Iterate

Look at the dev server (`localhost:3000`) and give feedback:
- "Make the headline bigger"
- "I don't like that wording, try something more direct"
- "The spacing feels too tight on mobile"

The agent iterates until you're happy.

### 5. Ship It

When you're satisfied:
1. Agent runs `npm run build` to make sure nothing's broken
2. Agent commits and pushes the branch
3. Agent creates a PR in GitHub
4. You review and merge the PR in GitHub
5. Amplify auto-deploys to production

## Content Map

Here's where all the content lives so you know what to ask for:

| What | File | What's In It |
|------|------|-------------|
| Page title & SEO | `src/app/layout.tsx` | Title, description, keywords, Open Graph |
| Navigation | `src/components/sections/Header.tsx` | Logo text, nav button text |
| Hero section | `src/components/sections/HeroSection.tsx` | Launch badge, headline, subtext |
| Features | `src/components/sections/FeaturesSection.tsx` | Section title, 3 feature cards (title + description) |
| How It Works | `src/components/sections/HowItWorksSection.tsx` | Section title, 3 steps (title + description) |
| Marketplace | `src/components/sections/MarketplaceSection.tsx` | Section title, worker benefits, homeowner benefits |
| FAQ | `src/components/sections/FAQSection.tsx` | Section title, 6 Q&A pairs |
| Final CTA | `src/components/sections/CTASection.tsx` | Headline, subtext |
| Footer | `src/components/sections/Footer.tsx` | Logo text, copyright |
| Waitlist form | `src/components/forms/WaitlistForm.tsx` | Placeholder text, button text, success message |

## Tips for Jack

- **Be specific:** "Change the hero headline to 'Work Smarter. Earn More.'" is better than "make it better"
- **Reference competitors:** "I want the FAQ section to feel more like Airbnb's help page" gives good direction
- **Think mobile first:** Most of your visitors will be on phones from ads
- **Less is more:** Uber-level simplicity. If a section isn't earning its place, cut it.
