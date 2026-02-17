# Lancer

**Your Skills. Your Income.** — An online marketplace for home services connecting skilled workers directly with homeowners. No middleman.

## What is Lancer?

Lancer is a platform where skilled workers (plumbers, electricians, carpenters, painters, handymen) connect directly with homeowners who need their services. Workers set their own rates, choose their own schedule, and keep more of their earnings. Think TaskRabbit, but without the middleman.

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Hosting:** AWS Amplify

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm installed

### Run Locally

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── app/
│   ├── api/waitlist/route.ts   # Email capture API endpoint
│   ├── globals.css             # Tailwind CSS imports and theme
│   ├── layout.tsx              # Root layout with fonts and SEO metadata
│   └── page.tsx                # Landing page (composes all sections)
├── components/
│   ├── forms/
│   │   └── WaitlistForm.tsx    # Email capture form with validation
│   └── sections/
│       ├── Header.tsx          # Sticky navigation header
│       ├── HeroSection.tsx     # Hero with headline and CTA
│       ├── FeaturesSection.tsx # Value propositions (3 cards)
│       ├── HowItWorksSection.tsx # 3-step process
│       ├── MarketplaceSection.tsx # For Workers / For Homeowners
│       ├── FAQSection.tsx      # Accordion FAQ
│       ├── CTASection.tsx      # Final call-to-action
│       └── Footer.tsx          # Site footer
```

## Email Waitlist

The waitlist form captures emails via the `/api/waitlist` endpoint. In development, emails are stored in `data/waitlist.json` (gitignored for privacy).

**For production on AWS Amplify**, you'll want to connect a proper database or email service since the serverless filesystem is read-only. Options include:

- **AWS DynamoDB** — Native to AWS, scales automatically
- **Supabase** — Free tier, easy to set up
- **ConvertKit / Mailchimp** — If you just need email collection

## Deploying to AWS Amplify

1. Push this project to a GitHub repository
2. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
3. Click "New app" → "Host web app"
4. Connect your GitHub repo and select the branch
5. Amplify will auto-detect the Next.js build settings
6. Click "Save and deploy"

The included `amplify.yml` configures the build process.

## License

Private — All rights reserved.
