# PropFit - Lead Qualification Platform for Malaysia Real Estate Agents

A B2B SaaS platform for housing agents in Malaysia (Klang Valley, Penang, Johor Bahru) to qualify leads quickly, recommend realistic locations, predict upgrade readiness, and improve closing efficiency.

## Features

### Core Functionality

- **Instant Lead Qualification** - Smart forms that ask the right questions about income, employment, and budget to score leads instantly
- **Qualification Scoring Engine** - Rule-based scoring (0-100) with status labels (Qualified, Stretch, Not Qualified)
- **Location Affordability Engine** - Malaysia-specific pricing rules for Klang Valley, Penang, and Johor Bahru
- **Financial Readiness Indicator** - Self-declared assessment based on income, commitments, and down payment capability
- **Upgrade Trigger System** - Alerts when leads are ready for property upgrades
- **Agent Dashboard** - Overview of all leads with stats, analytics, and upgrade alerts
- **Lead CRM** - Track lead status from 'New' to 'Closed' with full history

### Scoring Breakdown

- **40%** Income vs Property Affordability
- **30%** Location Fit
- **20%** Financing Readiness
- **10%** Urgency/Intent

### Malaysia-Specific Areas

- **Klang Valley**: Cheras, PJ, Bangsar, Mont Kiara, KLCC, Bukit Jalil, and more
- **Penang**: Georgetown, Gurney, Bayan Lepas, Tanjung Tokong, and more
- **Johor Bahru**: Mount Austin, Medini, Puteri Harbour, Iskandar Puteri, and more

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Server Actions
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL with Row Level Security
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

Both values can be found in [your Supabase project's API settings](https://supabase.com/dashboard/project/_?showConnect=true).

### Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration files in order from `supabase/migrations/`

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## Project Structure

```
├── app/
│   ├── page.tsx              # Landing page
│   ├── auth/                 # Authentication pages
│   │   ├── sign-in/          # Sign in page
│   │   └── sign-up/          # Sign up page
│   └── protected/            # Authenticated routes
│       ├── page.tsx          # Agent dashboard
│       └── leads/            # Lead management
│           ├── page.tsx      # Lead list
│           ├── new/          # Create new lead
│           └── [id]/         # Lead detail & edit
├── components/
│   ├── auth/                 # Authentication components
│   ├── dashboard/            # Dashboard components
│   ├── landing-page/         # Landing page sections
│   │   ├── navbar.tsx        # Navigation bar
│   │   ├── hero.tsx          # Hero section
│   │   ├── features.tsx      # Features section
│   │   ├── pricing.tsx       # Pricing section
│   │   ├── cta.tsx           # Call-to-action section
│   │   └── footer.tsx        # Footer
│   ├── leads/                # Lead management components
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── actions.ts            # Server actions
│   ├── types.ts              # TypeScript definitions
│   ├── areas.ts              # Malaysia area data
│   ├── qualification-engine.ts  # Scoring logic
│   ├── upgrade-triggers.ts   # Upgrade detection
│   └── supabase/             # Supabase client utilities
└── supabase/
    └── migrations/           # Database schema migrations
```

## Key Files

| File | Description |
|------|-------------|
| `lib/qualification-engine.ts` | Rule-based lead scoring logic |
| `lib/upgrade-triggers.ts` | Upgrade alert detection system |
| `lib/areas.ts` | Malaysia-specific area and pricing data |
| `lib/types.ts` | All TypeScript type definitions |
| `lib/actions.ts` | Server actions for data operations |

## Legal Disclaimers

> [!WARNING]
> This system provides a **Financing Readiness Indicator**, NOT a credit score.

- Does not retrieve, store, or infer real credit scores
- Based on self-declared information only
- Final loan approval depends on bank's assessment
- All financial indicators include appropriate disclaimers

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## License

MIT
