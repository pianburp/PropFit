# PropFit Supabase Migrations

## Migration Order

Run migrations in numerical order:

| File | Purpose | Status |
|------|---------|--------|
| `001_initial_schema.sql` | Base tables (agents, leads, lead_events, pricing_rules, upgrade_alerts) | Active |
| `002_seed_pricing_rules.sql` | Seed data for Malaysia pricing rules | Active |
| `003_upgrade_management_schema.sql` | Adds agencies, B2B roles, financial snapshot, upgrade pipeline | Active |
| `004_upgrade_niche_enhancements.sql` | Adds property types, family alignment, lost reasons, upgrade intent | Active |
| `005_seed_test_leads.sql` | ⚠️ **DEPRECATED** - Use 008 instead | Deprecated |
| `006_fix_qualification_breakdown.sql` | Backfill qualification_breakdown for existing leads | Active |
| `007_add_ic_number_and_upsert.sql` | Adds IC number field and new event types | Active |
| `008_consolidated_schema_and_seed.sql` | **Clean seed data with all fields populated correctly** | Active |

## Key Changes in Migration 008

The new seed file (008) fixes critical issues from the old seed file (005):

### 1. Area Values Use Snake_Case
**Before (005):** `'Mont Kiara'`, `'Bangsar'`, `'KLCC'`
**After (008):** `'mont_kiara'`, `'bangsar'`, `'klcc'`

The app's `lib/areas.ts` defines areas with snake_case `value` properties that are stored in the database, not display labels.

### 2. All Upgrade Fields Populated
The new seed populates these fields that were missing:
- `current_income` - Current monthly income
- `current_property_type` - Condo, apartment, terrace, etc.
- `current_property_location` - Area of current property
- `current_property_city` - City of current property  
- `current_property_purchase_year` - When property was bought
- `current_property_purchase_price` - Original purchase price
- `current_property_value` - Current estimated value
- `outstanding_loan_balance` - Remaining loan amount
- `family_alignment_status` - Decision maker alignment
- `co_applicant_income` - Spouse/partner income
- `upgrade_intent_signals` - Array of upgrade motivations
- `upgrade_target_property_type` - What type they want to upgrade to
- `income_history` - JSONB array of income changes over time
- `life_milestones` - JSONB array of life events
- `upgrade_readiness_score` - 0-100 score
- `upgrade_readiness_state` - not_ready/monitoring/ready
- `upgrade_readiness_breakdown` - Component scores

### 3. Realistic Data Distribution
- 40% first-time buyers (no current property data)
- 60% upgraders (have current property, financial snapshot)
- Income range: RM 4,000 - RM 35,000
- Budget tiers: Budget (40%), Mid (35%), Premium (25%)
- All three cities represented equally

## How to Run

### Fresh Database
```sql
-- Run in Supabase SQL Editor in order:
-- 1. 001_initial_schema.sql
-- 2. 002_seed_pricing_rules.sql
-- 3. 003_upgrade_management_schema.sql
-- 4. 004_upgrade_niche_enhancements.sql
-- 5. 007_add_ic_number_and_upsert.sql
-- 6. 008_consolidated_schema_and_seed.sql (this will seed test data)
```

### Existing Database (Re-seed)
If you already have the schema and just want fresh test data:
```sql
-- Run only:
-- 008_consolidated_schema_and_seed.sql
-- This will DELETE old seeded leads and create 50 new ones
```

## Required: Create Agent First

Before running the seed, you need an agent in the database:

1. Create a user in Supabase Auth (Dashboard > Authentication > Users)
2. Copy the user's UUID
3. Insert into agents table:

```sql
INSERT INTO agents (id, full_name, phone, agency_name, license_number, preferred_cities, subscription_status)
VALUES (
    'YOUR-USER-UUID-HERE'::UUID,
    'Your Name',
    '+60123456789',
    'Your Agency',
    'REN12345',
    ARRAY['klang_valley', 'penang', 'johor_bahru'],
    'active'
) ON CONFLICT (id) DO NOTHING;
```

Then run migration 008 - it will automatically use the first available agent.
