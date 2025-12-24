-- Lead Qualification & Upgrade Intelligence Platform for Housing Agents
-- Initial Database Schema for Malaysia MVP

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- AGENTS TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    agency_name TEXT,
    license_number TEXT,
    preferred_cities TEXT[] DEFAULT ARRAY['klang_valley'], -- klang_valley, penang, johor_bahru
    subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled')),
    subscription_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Required Fields
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    monthly_income_min INTEGER NOT NULL, -- in RM
    monthly_income_max INTEGER NOT NULL, -- in RM
    preferred_city TEXT NOT NULL CHECK (preferred_city IN ('klang_valley', 'penang', 'johor_bahru')),
    preferred_areas TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    intent TEXT NOT NULL CHECK (intent IN ('rent', 'buy')),
    budget_min INTEGER NOT NULL, -- in RM (monthly rent or property price)
    budget_max INTEGER NOT NULL, -- in RM
    move_in_timeline TEXT NOT NULL CHECK (move_in_timeline IN ('immediate', '1_3_months', '3_6_months', '6_12_months', 'flexible')),
    
    -- Optional Fields
    employment_type TEXT CHECK (employment_type IN ('permanent', 'contract', 'self_employed', 'business_owner', 'freelance')),
    years_in_current_job INTEGER,
    existing_loan_commitment_percent INTEGER, -- percentage of income
    previous_loan_rejection BOOLEAN DEFAULT FALSE,
    is_first_time_buyer BOOLEAN DEFAULT TRUE,
    lease_end_date DATE,
    email TEXT,
    notes TEXT,
    
    -- Scoring Results (calculated)
    qualification_score INTEGER DEFAULT 0 CHECK (qualification_score >= 0 AND qualification_score <= 100),
    qualification_status TEXT DEFAULT 'pending' CHECK (qualification_status IN ('pending', 'not_qualified', 'stretch', 'qualified')),
    financing_readiness TEXT CHECK (financing_readiness IN ('weak', 'moderate', 'strong')),
    
    -- Suggested alternatives (JSON)
    suggested_areas JSONB DEFAULT '[]'::JSONB,
    qualification_breakdown JSONB DEFAULT '{}'::JSONB,
    
    -- Status tracking
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'viewing_scheduled', 'negotiating', 'closed_won', 'closed_lost', 'nurturing')),
    is_upgrade_ready BOOLEAN DEFAULT FALSE,
    upgrade_triggers JSONB DEFAULT '[]'::JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_contacted_at TIMESTAMPTZ
);

-- ============================================
-- LEAD EVENTS TABLE (for tracking changes & triggers)
-- ============================================
CREATE TABLE IF NOT EXISTS lead_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    event_type TEXT NOT NULL CHECK (event_type IN (
        'created',
        'status_changed',
        'income_updated',
        'budget_updated',
        'areas_updated',
        'intent_changed',
        'contacted',
        'viewing_scheduled',
        'note_added',
        'upgrade_triggered',
        'qualification_recalculated'
    )),
    
    event_data JSONB DEFAULT '{}'::JSONB, -- stores old/new values
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRICING RULES TABLE (Malaysia-specific)
-- ============================================
CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city TEXT NOT NULL CHECK (city IN ('klang_valley', 'penang', 'johor_bahru')),
    intent TEXT NOT NULL CHECK (intent IN ('rent', 'buy')),
    
    -- Area affordability rules stored as JSON
    -- Format: { "area_name": { "min_budget": X, "max_budget": Y, "tier": "budget|mid|premium" } }
    area_rules JSONB NOT NULL,
    
    -- General rules for the city
    max_dti_ratio DECIMAL(3,2) DEFAULT 0.35, -- debt-to-income ratio (35%)
    price_to_installment_ratio INTEGER DEFAULT 200, -- property price / monthly installment
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(city, intent)
);

-- ============================================
-- UPGRADE ALERTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS upgrade_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'income_increase',
        'lead_matured',
        'lease_ending',
        'higher_tier_interest',
        'rent_to_buy_ready'
    )),
    
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    suggested_action TEXT,
    
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE upgrade_alerts ENABLE ROW LEVEL SECURITY;

-- Agents can only access their own data
CREATE POLICY "Agents can view own profile" ON agents
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Agents can update own profile" ON agents
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Agents can insert own profile" ON agents
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Leads policies
CREATE POLICY "Agents can view own leads" ON leads
    FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Agents can insert own leads" ON leads
    FOR INSERT WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update own leads" ON leads
    FOR UPDATE USING (auth.uid() = agent_id);

CREATE POLICY "Agents can delete own leads" ON leads
    FOR DELETE USING (auth.uid() = agent_id);

-- Lead events policies
CREATE POLICY "Agents can view own lead events" ON lead_events
    FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Agents can insert own lead events" ON lead_events
    FOR INSERT WITH CHECK (auth.uid() = agent_id);

-- Pricing rules are readable by all authenticated users
CREATE POLICY "Authenticated users can view pricing rules" ON pricing_rules
    FOR SELECT USING (auth.role() = 'authenticated');

-- Upgrade alerts policies
CREATE POLICY "Agents can view own alerts" ON upgrade_alerts
    FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Agents can update own alerts" ON upgrade_alerts
    FOR UPDATE USING (auth.uid() = agent_id);

CREATE POLICY "System can insert alerts" ON upgrade_alerts
    FOR INSERT WITH CHECK (auth.uid() = agent_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_leads_agent_id ON leads(agent_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_qualification_status ON leads(qualification_status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_is_upgrade_ready ON leads(is_upgrade_ready) WHERE is_upgrade_ready = TRUE;
CREATE INDEX idx_lead_events_lead_id ON lead_events(lead_id);
CREATE INDEX idx_lead_events_created_at ON lead_events(created_at DESC);
CREATE INDEX idx_upgrade_alerts_agent_id ON upgrade_alerts(agent_id);
CREATE INDEX idx_upgrade_alerts_is_read ON upgrade_alerts(is_read) WHERE is_read = FALSE;

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_rules_updated_at
    BEFORE UPDATE ON pricing_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
