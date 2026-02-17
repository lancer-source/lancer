# Feature Development Workflow

## What This Is

The full development pipeline for building new features on Lancer. Multiple specialized agents collaborate through a structured process — research, plan, review, build, and code review — before Jack approves the final PR.

Think of it like a professional dev team: someone investigates the best approach, someone creates the blueprint, a senior engineer reviews the blueprint, a developer builds it, and a code reviewer checks the work before it goes live.

**Use this for:** New features (email capture, user profiles, search), API integrations, new pages, infrastructure changes, anything that adds functionality.

**Don't use this for:** Copy changes, styling tweaks, content updates. Use the Content Workflow for those.

## The Pipeline

```
Jack describes the feature
        ↓
┌─────────────────────────────────┐
│  1. RESEARCH                    │  Feature Researcher agent
│     Investigate best practices  │  → Output: docs/plans/[feature]-research.md
│     and technical options        │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│  2. PLAN                        │  Feature Planner agent
│     Create implementation plan   │  → Output: docs/plans/[feature]-plan.md
│     with architecture & tasks   │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│  3. SENIOR REVIEW               │  Senior Reviewer agent
│     Review plan, find gaps,     │  → Output: Updated plan with improvements
│     improve directly            │
└─────────────────────────────────┘
        ↓
  Jack reviews the plan (optional but recommended)
        ↓
┌─────────────────────────────────┐
│  4. BUILD                       │  Feature Builder agent
│     Implement the approved plan │  → Output: Working code on feature branch
│     (multiple sessions if needed)│
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│  5. CODE REVIEW                 │  Code Reviewer agent
│     Review implementation,      │  → Output: PR with review notes
│     check quality, create PR    │
└─────────────────────────────────┘
        ↓
Jack approves and merges PR in GitHub
        ↓
Amplify auto-deploys to production
```

## Step by Step

### Step 1: Research

**Agent:** Feature Researcher (`docs/agents/feature-researcher.md`)

**What happens:** The agent investigates best practices, evaluates technical options, and produces a research report with recommendations.

**Start the session:**
```
Follow the instructions in docs/agents/feature-researcher.md

I want to add [feature description]. Research the best way to do this
for our stack (Next.js 16, Tailwind v4, AWS Amplify). Consider
[any specific requirements or constraints].
```

**Output:** `docs/plans/[feature]-research.md`

**Example:** For email capture, the researcher would investigate email service providers (Resend, SendGrid, AWS SES), form validation approaches, spam prevention, GDPR compliance, and recommend the best option for Lancer's stage.

### Step 2: Plan

**Agent:** Feature Planner (`docs/agents/feature-planner.md`)

**What happens:** Using the research report, the planner creates a detailed implementation plan — file changes, component architecture, data flow, and a step-by-step build order.

**Start the session:**
```
Follow the instructions in docs/agents/feature-planner.md

Create an implementation plan for [feature]. The research report is at
docs/plans/[feature]-research.md. Follow its recommendations.
```

**Output:** `docs/plans/[feature]-plan.md`

### Step 3: Senior Review

**Agent:** Senior Reviewer (`docs/agents/senior-reviewer.md`)

**What happens:** A "senior engineer" reviews the implementation plan. They look for gaps, edge cases, security issues, and architectural problems. They make improvements directly to the plan.

**Start the session:**
```
Follow the instructions in docs/agents/senior-reviewer.md

Review and improve the implementation plan at docs/plans/[feature]-plan.md.
The research report is at docs/plans/[feature]-research.md for context.
```

**Output:** Updated `docs/plans/[feature]-plan.md` with improvements

### Step 4: Build

**Agent:** Feature Builder (`docs/agents/feature-builder.md`)

**What happens:** The builder implements the feature following the approved plan. They create the branch, write the code, test it, and commit along the way.

**Start the session:**
```
Follow the instructions in docs/agents/feature-builder.md

Implement the feature described in docs/plans/[feature]-plan.md.
Create a feature branch and follow the plan step by step.
```

**Output:** Working code on a feature branch

**Note:** For large features, the build might span multiple sessions. Each session picks up where the last one left off by reading the plan and checking git status.

### Step 5: Code Review

**Agent:** Code Reviewer (`docs/agents/code-reviewer.md`)

**What happens:** The reviewer checks the implementation against the plan, looks for bugs, tests the build, and creates a PR with a clear summary for Jack.

**Start the session:**
```
Follow the instructions in docs/agents/code-reviewer.md

Review the implementation on branch [branch-name].
The plan is at docs/plans/[feature]-plan.md.
Create a PR when the code is ready.
```

**Output:** GitHub PR ready for Jack to review

### Step 6: Jack Merges

Jack reviews the PR in GitHub:
- Read the PR summary to understand what changed
- Look at the file changes if curious
- Click "Merge" when satisfied
- Amplify auto-deploys

## File Naming Convention

All plans and research docs go in `docs/plans/`:

```
docs/plans/
├── email-capture-research.md     ← Research report
├── email-capture-plan.md         ← Implementation plan (updated by reviewer)
├── user-profiles-research.md
├── user-profiles-plan.md
└── ...
```

## Branch Naming Convention

Feature branches follow this pattern:
```
feature/email-capture
feature/user-profiles
feature/search-functionality
```

## When to Skip Steps

Not every feature needs the full pipeline:

| Feature Size | Steps to Use |
|-------------|--------------|
| **Small** (add a new section, update form) | Plan → Build → Review |
| **Medium** (email capture, new API route) | Research → Plan → Review → Build → Code Review |
| **Large** (user auth, profiles, payments) | Full pipeline, possibly multiple build sessions |

Jack decides the scope. When in doubt, do the research — it's cheap and prevents expensive mistakes.

## Handoff Between Agents

Each agent communicates through files, not conversation. The handoff works like this:

1. **Research → Plan:** Planner reads the research doc
2. **Plan → Senior Review:** Reviewer reads and edits the plan doc
3. **Senior Review → Build:** Builder reads the updated plan doc
4. **Build → Code Review:** Reviewer reads the plan and checks the code on the branch

**Every agent commits its output.** Research docs, plans, and code are all version-controlled.

## Tips for Jack

- **Start with "why":** Tell the researcher what business problem you're solving, not just what to build
- **Review the plan:** Even a quick skim of the implementation plan helps you understand what's being built
- **Ask questions:** If something in the plan doesn't make sense, ask before the build starts
- **Trust the pipeline:** Each stage catches different problems. Research catches bad technical choices. Planning catches missing pieces. Senior review catches edge cases. Code review catches bugs.
