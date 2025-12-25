-- ============================================
-- Migration: Upgrade Niche Enhancements
-- Purpose: Add current property, family alignment, lost reason tracking
-- ============================================

-- Add Property Type Enum
DO $$ BEGIN
    CREATE TYPE property_type AS ENUM (
        'condo',
        'apartment',
        'serviced_residence',
        'flat',
        'terrace',
        'semi_d',
        'bungalow',
        'townhouse',
        'soho',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add Family Alignment Status Enum
DO $$ BEGIN
    CREATE TYPE family_alignment_status AS ENUM (
        'not_discussed',
        'spouse_pending',
        'spouse_aligned',
        'family_objection',
        'all_aligned'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add Lost Reason Type Enum
DO $$ BEGIN
    CREATE TYPE lost_reason_type AS ENUM (
        'family_disagreement',
        'numbers_no_longer_work',
        'went_with_competitor',
        'decided_to_stay',
        'life_circumstances',
        'market_conditions',
        'financing_rejected',
        'timing_not_right',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add Upgrade Intent Signal Enum
DO $$ BEGIN
    CREATE TYPE upgrade_intent_signal AS ENUM (
        'wants_bigger_space',
        'wants_landed',
        'wants_better_location',
        'investment_opportunity',
        'downsizing',
        'relocating'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- Add Current Property Fields to Leads Table
-- ============================================
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS current_property_type property_type,
ADD COLUMN IF NOT EXISTS current_property_location text,
ADD COLUMN IF NOT EXISTS current_property_city text,
ADD COLUMN IF NOT EXISTS current_property_purchase_year integer,
ADD COLUMN IF NOT EXISTS current_property_purchase_price integer;

-- Add constraint for purchase year
ALTER TABLE leads
ADD CONSTRAINT check_purchase_year 
CHECK (current_property_purchase_year IS NULL OR (current_property_purchase_year >= 1970 AND current_property_purchase_year <= EXTRACT(YEAR FROM CURRENT_DATE)));

-- ============================================
-- Add Family Alignment Fields
-- ============================================
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS family_alignment_status family_alignment_status DEFAULT 'not_discussed',
ADD COLUMN IF NOT EXISTS family_alignment_notes text,
ADD COLUMN IF NOT EXISTS co_applicant_income integer,
ADD COLUMN IF NOT EXISTS number_of_decision_makers integer DEFAULT 1;

-- ============================================
-- Add Upgrade Intent Fields
-- ============================================
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS upgrade_intent_signals upgrade_intent_signal[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS upgrade_target_property_type property_type,
ADD COLUMN IF NOT EXISTS upgrade_target_areas text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS upgrade_budget_min integer,
ADD COLUMN IF NOT EXISTS upgrade_budget_max integer;

-- ============================================
-- Add Lost Deal Tracking Fields
-- ============================================
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS lost_reason lost_reason_type,
ADD COLUMN IF NOT EXISTS lost_reason_notes text,
ADD COLUMN IF NOT EXISTS lost_at timestamptz;

-- ============================================
-- Note: Life Milestone Types are stored as JSONB
-- in the life_milestones column, not as an enum.
-- New types (kids_school, kids_leaving, retirement_planning)
-- are handled at the application layer in lib/types.ts
-- ============================================

-- ============================================
-- Create Index for Upgrade Queries
-- ============================================
CREATE INDEX IF NOT EXISTS idx_leads_upgrade_stage ON leads(upgrade_stage);
CREATE INDEX IF NOT EXISTS idx_leads_family_alignment ON leads(family_alignment_status);
CREATE INDEX IF NOT EXISTS idx_leads_lost_reason ON leads(lost_reason);
CREATE INDEX IF NOT EXISTS idx_leads_upgrade_readiness_state ON leads(upgrade_readiness_state);

-- ============================================
-- Create View for Timing Intelligence
-- ============================================
CREATE OR REPLACE VIEW upgrade_timing_intelligence AS
SELECT 
    l.id,
    l.name,
    l.agent_id,
    l.upgrade_stage,
    l.upgrade_readiness_score,
    l.upgrade_readiness_state,
    l.current_property_value,
    l.outstanding_loan_balance,
    l.lease_end_date,
    l.current_income,
    l.income_history,
    -- Calculate equity percentage
    CASE 
        WHEN l.current_property_value > 0 AND l.outstanding_loan_balance IS NOT NULL 
        THEN ((l.current_property_value - l.outstanding_loan_balance)::decimal / l.current_property_value) * 100
        ELSE NULL
    END as equity_percent,
    -- Check if approaching 20% equity threshold (15-20%)
    CASE 
        WHEN l.current_property_value > 0 AND l.outstanding_loan_balance IS NOT NULL 
             AND ((l.current_property_value - l.outstanding_loan_balance)::decimal / l.current_property_value) * 100 BETWEEN 15 AND 20
        THEN true
        ELSE false
    END as approaching_equity_threshold,
    -- Check if lease ending in next 90 days
    CASE 
        WHEN l.lease_end_date IS NOT NULL 
             AND l.lease_end_date <= (CURRENT_DATE + INTERVAL '90 days')
             AND l.lease_end_date >= CURRENT_DATE
        THEN true
        ELSE false
    END as lease_ending_soon,
    -- Days until lease ends
    CASE 
        WHEN l.lease_end_date IS NOT NULL 
        THEN l.lease_end_date - CURRENT_DATE
        ELSE NULL
    END as days_until_lease_end,
    -- Days in current stage
    EXTRACT(DAY FROM NOW() - l.upgrade_stage_changed_at) as days_in_stage
FROM leads l
WHERE l.upgrade_stage IN ('monitoring', 'window_open', 'planning');

-- ============================================
-- Function to calculate income growth percentage
-- ============================================
CREATE OR REPLACE FUNCTION calculate_income_growth(
    income_history jsonb,
    current_income integer
) RETURNS decimal AS $$
DECLARE
    oldest_income integer;
    growth_percent decimal;
BEGIN
    IF income_history IS NULL OR jsonb_array_length(income_history) = 0 OR current_income IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Get the oldest income from history (first element after sorting by date)
    SELECT (elem->>'amount')::integer INTO oldest_income
    FROM jsonb_array_elements(income_history) AS elem
    ORDER BY (elem->>'date')::date ASC
    LIMIT 1;
    
    IF oldest_income IS NULL OR oldest_income = 0 THEN
        RETURN NULL;
    END IF;
    
    growth_percent := ((current_income - oldest_income)::decimal / oldest_income) * 100;
    RETURN growth_percent;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- Add RLS Policies for new columns
-- ============================================
-- Existing RLS policies on leads table should automatically cover new columns

COMMENT ON COLUMN leads.current_property_type IS 'Type of the client current property (for upgrade analysis)';
COMMENT ON COLUMN leads.current_property_location IS 'Location/project name of current property';
COMMENT ON COLUMN leads.family_alignment_status IS 'Status of family/decision maker alignment on upgrade';
COMMENT ON COLUMN leads.lost_reason IS 'Reason why an upgrade opportunity was lost';
COMMENT ON COLUMN leads.upgrade_intent_signals IS 'Array of signals client has mentioned about upgrading';
COMMENT ON VIEW upgrade_timing_intelligence IS 'View for dashboard timing intelligence metrics';
