# LeadQualify - Lead Qualification Platform for Malaysia Real Estate Agents

A B2B SaaS platform for housing agents in Malaysia (Klang Valley, Penang, Johor Bahru) to qualify leads quickly, recommend realistic locations, predict upgrade readiness, and improve closing efficiency.

## Features

### Core Functionality
- **Lead Input & Management** - Create and manage leads with comprehensive details
- **Qualification Scoring Engine** - Rule-based scoring (0-100) with status labels
- **Location Affordability Engine** - Malaysia-specific pricing rules for KV, Penang, JB
- **Financing Readiness Indicator** - Self-declared assessment (not credit score)
- **Upgrade Trigger System** - Alerts when leads are ready for property upgrades
- **Agent Dashboard** - Overview of all leads with stats and alerts

### Scoring Breakdown
- 40% Income vs Property Affordability
- 30% Location Fit
- 20% Financing Readiness
- 10% Urgency/Intent

### Malaysia-Specific Areas
- **Klang Valley**: Cheras, PJ, Bangsar, Mont Kiara, KLCC, etc.
- **Penang**: Georgetown, Gurney, Bayan Lepas, etc.
- **Johor Bahru**: Mount Austin, Medini, Puteri Harbour, etc.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), Tailwind CSS, shadcn/ui
- **Backend**: Server Actions, Supabase Auth
- **Database**: Supabase PostgreSQL with Row Level Security
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account

### Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration files in order:
   ```
   supabase/migrations/001_initial_schema.sql
   supabase/migrations/002_seed_pricing_rules.sql
   ```

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── protected/           # Authenticated routes
│   │   ├── page.tsx        # Dashboard
│   │   └── leads/          # Lead management
│   │       ├── page.tsx    # Lead list
│   │       ├── new/        # Create lead
│   │       └── [id]/       # Lead detail & edit
│   └── auth/               # Authentication pages
├── components/
│   ├── dashboard.tsx       # Dashboard component
│   ├── lead-form.tsx       # Lead create/edit form
│   ├── lead-list.tsx       # Lead listing
│   ├── lead-detail.tsx     # Lead detail view
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── actions.ts          # Server actions
│   ├── types.ts            # TypeScript types
│   ├── areas.ts            # Malaysia area data
│   ├── qualification-engine.ts  # Scoring logic
│   └── upgrade-triggers.ts      # Upgrade detection
└── supabase/
    └── migrations/         # Database schema
```

## Key Files

- **[lib/qualification-engine.ts](lib/qualification-engine.ts)** - Rule-based scoring logic
- **[lib/upgrade-triggers.ts](lib/upgrade-triggers.ts)** - Upgrade alert detection
- **[lib/areas.ts](lib/areas.ts)** - Malaysia-specific area data
- **[lib/types.ts](lib/types.ts)** - All TypeScript definitions

## Legal Disclaimers

⚠️ **Important**: This system provides a **Financing Readiness Indicator**, NOT a credit score.

- Does not retrieve, store, or infer real credit scores
- Based on self-declared information only
- Final loan approval depends on bank's assessment
- All financial indicators include appropriate disclaimers

## License

MIT

## Clone and run locally

1. You'll first need a Supabase project which can be made [via the Supabase dashboard](https://database.new)

2. Create a Next.js app using the Supabase Starter template npx command

   ```bash
   npx create-next-app --example with-supabase with-supabase-app
   ```

   ```bash
   yarn create next-app --example with-supabase with-supabase-app
   ```

   ```bash
   pnpm create next-app --example with-supabase with-supabase-app
   ```

3. Use `cd` to change into the app's directory

   ```bash
   cd with-supabase-app
   ```

4. Rename `.env.example` to `.env.local` and update the following:

  ```env
  NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[INSERT SUPABASE PROJECT API PUBLISHABLE OR ANON KEY]
  ```
  > [!NOTE]
  > This example uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, which refers to Supabase's new **publishable** key format.
  > Both legacy **anon** keys and new **publishable** keys can be used with this variable name during the transition period. Supabase's dashboard may show `NEXT_PUBLIC_SUPABASE_ANON_KEY`; its value can be used in this example.
  > See the [full announcement](https://github.com/orgs/supabase/discussions/29260) for more information.

  Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` can be found in [your Supabase project's API settings](https://supabase.com/dashboard/project/_?showConnect=true)

5. You can now run the Next.js local development server:

   ```bash
   npm run dev
   ```

   The starter kit should now be running on [localhost:3000](http://localhost:3000/).

6. This template comes with the default shadcn/ui style initialized. If you instead want other ui.shadcn styles, delete `components.json` and [re-install shadcn/ui](https://ui.shadcn.com/docs/installation/next)

> Check out [the docs for Local Development](https://supabase.com/docs/guides/getting-started/local-development) to also run Supabase locally.

## Feedback and issues

Please file feedback and issues over on the [Supabase GitHub org](https://github.com/supabase/supabase/issues/new/choose).

## More Supabase examples

- [Next.js Subscription Payments Starter](https://github.com/vercel/nextjs-subscription-payments)
- [Cookie-based Auth and the Next.js 13 App Router (free course)](https://youtube.com/playlist?list=PL5S4mPUpp4OtMhpnp93EFSo42iQ40XjbF)
- [Supabase Auth and the Next.js App Router](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)
