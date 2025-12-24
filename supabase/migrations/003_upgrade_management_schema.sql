-- ============================================
-- Upgrade Management System Schema
-- Migration: 003_upgrade_management_schema.sql
-- 
-- Adds:
-- - Agencies table for B2B team structure
-- - Role-based access (Admin/Agent)
-- - Financial snapshot fields for clients
-- - Upgrade pipeline stages
-- - Stage history with audit trail
-- - Client reassignment audit log
-- ============================================

-- ============================================
-- AGENCIES TABLE
-- Every agent belongs to exactly one agency.
-- Solo agents get a personal agency auto-created.
-- ============================================
CREATE TABLE IF NOT EXISTS agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    is_personal BOOLEAN DEFAULT FALSE, -- True for single-agent personal agencies
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- UPDATE AGENTS TABLE
-- Add agency relationship and roles
-- ============================================
ALTER TABLE agents ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'agent' CHECK (role IN ('admin', 'agent'));

-- ============================================
-- ADD FINANCIAL SNAPSHOT FIELDS TO LEADS
-- For tracking income growth and property status
-- ============================================

-- Current financial status
ALTER TABLE leads ADD COLUMN IF NOT EXISTS current_income INTEGER; -- Current monthly income (RM)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS income_last_updated TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS current_property_value INTEGER; -- RM
ALTER TABLE leads ADD COLUMN IF NOT EXISTS property_value_last_updated TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS outstanding_loan_balance INTEGER; -- RM
ALTER TABLE leads ADD COLUMN IF NOT EXISTS loan_balance_last_updated TIMESTAMPTZ;

-- Income history for tracking growth
-- Format: [{"amount": 5000, "date": "2024-01-15", "notes": "Promotion"}]
ALTER TABLE leads ADD COLUMN IF NOT EXISTS income_history JSONB DEFAULT '[]'::JSONB;

-- Life milestones for upgrade context
-- Format: [{"type": "marriage", "date": "2024-06-01", "notes": "Needs bigger home"}]
ALTER TABLE leads ADD COLUMN IF NOT EXISTS life_milestones JSONB DEFAULT '[]'::JSONB;

-- ============================================
-- UPGRADE PIPELINE STAGES
-- Each client exists in exactly one stage
-- ============================================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS upgrade_stage TEXT DEFAULT 'monitoring' 
    CHECK (upgrade_stage IN ('monitoring', 'window_open', 'planning', 'executed', 'lost'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS upgrade_stage_changed_at TIMESTAMPTZ DEFAULT NOW();

-- Upgrade readiness score (0-100, deterministic)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS upgrade_readiness_score INTEGER DEFAULT 0 
    CHECK (upgrade_readiness_score >= 0 AND upgrade_readiness_score <= 100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS upgrade_readiness_state TEXT DEFAULT 'not_ready'
    CHECK (upgrade_readiness_state IN ('not_ready', 'monitoring', 'ready'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS upgrade_readiness_breakdown JSONB DEFAULT '{}'::JSONB;

-- Conversation timeline for upgrade discussions
-- Tracks progress through 5 advisory steps
-- Format: {"financial_validation": {"completed": true, "completed_at": "...", "notes": "..."}, ...}
ALTER TABLE leads ADD COLUMN IF NOT EXISTS conversation_timeline JSONB DEFAULT NULL;

-- Fallback plan when upgrade is not proceeding
-- Format: {"reason": "...", "reason_notes": "...", "next_review_date": "...", "advisory_notes": "...", "created_at": "..."}
ALTER TABLE leads ADD COLUMN IF NOT EXISTS fallback_plan JSONB DEFAULT NULL;

-- ============================================
-- UPGRADE STAGE HISTORY TABLE
-- Timestamped audit trail for all stage changes
-- ============================================
CREATE TABLE IF NOT EXISTS upgrade_stage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    from_stage TEXT,
    to_stage TEXT NOT NULL,
    changed_by UUID NOT NULL REFERENCES agents(id),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLIENT REASSIGNMENT AUDIT LOG
-- Required for B2B compliance
-- ============================================
CREATE TABLE IF NOT EXISTS client_reassignment_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    from_agent_id UUID NOT NULL REFERENCES agents(id),
    to_agent_id UUID NOT NULL REFERENCES agents(id),
    reassigned_by UUID NOT NULL REFERENCES agents(id), -- Must be admin
    reason TEXT NOT NULL, -- Required field
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY UPDATES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE upgrade_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_reassignment_log ENABLE ROW LEVEL SECURITY;

-- Agencies: Users can view their own agency
CREATE POLICY "Users can view own agency" ON agencies
    FOR SELECT USING (
        id IN (SELECT agency_id FROM agents WHERE id = auth.uid())
    );

-- Agencies: Allow system to create agencies (for trigger)
CREATE POLICY "System can insert agencies" ON agencies
    FOR INSERT WITH CHECK (TRUE);

-- Agencies: Admins can update their agency
CREATE POLICY "Admins can update own agency" ON agencies
    FOR UPDATE USING (
        id IN (
            SELECT agency_id FROM agents 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Upgrade stage history: Viewable by agent owner or agency admin
CREATE POLICY "View stage history" ON upgrade_stage_history
    FOR SELECT USING (
        -- Own leads or admin of same agency
        lead_id IN (
            SELECT l.id FROM leads l
            WHERE l.agent_id = auth.uid()
            UNION
            SELECT l.id FROM leads l
            JOIN agents a ON l.agent_id = a.id
            JOIN agents viewer ON viewer.agency_id = a.agency_id
            WHERE viewer.id = auth.uid() AND viewer.role = 'admin'
        )
    );

-- Upgrade stage history: Insertable by lead owner or agency admin
CREATE POLICY "Insert stage history" ON upgrade_stage_history
    FOR INSERT WITH CHECK (
        changed_by = auth.uid() AND
        lead_id IN (
            SELECT l.id FROM leads l
            WHERE l.agent_id = auth.uid()
            UNION
            SELECT l.id FROM leads l
            JOIN agents a ON l.agent_id = a.id
            JOIN agents viewer ON viewer.agency_id = a.agency_id
            WHERE viewer.id = auth.uid() AND viewer.role = 'admin'
        )
    );

-- Client reassignment log: Viewable by agency admins
CREATE POLICY "Admins view reassignment log" ON client_reassignment_log
    FOR SELECT USING (
        lead_id IN (
            SELECT l.id FROM leads l
            JOIN agents a ON l.agent_id = a.id
            JOIN agents viewer ON viewer.agency_id = a.agency_id
            WHERE viewer.id = auth.uid() AND viewer.role = 'admin'
        )
    );

-- Client reassignment log: Only admins can insert
CREATE POLICY "Admins can log reassignment" ON client_reassignment_log
    FOR INSERT WITH CHECK (
        reassigned_by = auth.uid() AND
        auth.uid() IN (SELECT id FROM agents WHERE role = 'admin')
    );

-- ============================================
-- UPDATE LEADS RLS FOR AGENCY ACCESS
-- Admins can view all leads in their agency
-- ============================================

-- Drop existing leads policies to recreate with agency support
DROP POLICY IF EXISTS "Agents can view own leads" ON leads;
DROP POLICY IF EXISTS "Agents can update own leads" ON leads;
DROP POLICY IF EXISTS "Agents can delete own leads" ON leads;

-- Agents view own leads OR agency admins view all agency leads
CREATE POLICY "View leads with agency access" ON leads
    FOR SELECT USING (
        agent_id = auth.uid()
        OR
        agent_id IN (
            SELECT a.id FROM agents a
            JOIN agents viewer ON viewer.agency_id = a.agency_id
            WHERE viewer.id = auth.uid() AND viewer.role = 'admin'
        )
    );

-- Agents update own leads OR agency admins update all agency leads
CREATE POLICY "Update leads with agency access" ON leads
    FOR UPDATE USING (
        agent_id = auth.uid()
        OR
        agent_id IN (
            SELECT a.id FROM agents a
            JOIN agents viewer ON viewer.agency_id = a.agency_id
            WHERE viewer.id = auth.uid() AND viewer.role = 'admin'
        )
    );

-- Only agents can delete their own leads (not even admins)
CREATE POLICY "Agents delete own leads" ON leads
    FOR DELETE USING (agent_id = auth.uid());

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_agents_agency_id ON agents(agency_id);
CREATE INDEX IF NOT EXISTS idx_agents_role ON agents(role);
CREATE INDEX IF NOT EXISTS idx_leads_upgrade_stage ON leads(upgrade_stage);
CREATE INDEX IF NOT EXISTS idx_leads_upgrade_readiness_state ON leads(upgrade_readiness_state);
CREATE INDEX IF NOT EXISTS idx_upgrade_stage_history_lead_id ON upgrade_stage_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_upgrade_stage_history_created ON upgrade_stage_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_reassignment_lead_id ON client_reassignment_log(lead_id);

-- ============================================
-- TRIGGER: AUTO-UPDATE upgrade_stage_changed_at
-- ============================================
CREATE OR REPLACE FUNCTION update_upgrade_stage_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.upgrade_stage IS DISTINCT FROM NEW.upgrade_stage THEN
        NEW.upgrade_stage_changed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_upgrade_stage_timestamp
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_upgrade_stage_timestamp();

-- ============================================
-- TRIGGER: Update agencies updated_at
-- ============================================
CREATE TRIGGER update_agencies_updated_at
    BEFORE UPDATE ON agencies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Create personal agency for new agent
-- Called when agent profile is created
-- ============================================
CREATE OR REPLACE FUNCTION create_personal_agency_for_agent()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_agency_id UUID;
BEGIN
    -- Only create if agent doesn't have an agency
    IF NEW.agency_id IS NULL THEN
        INSERT INTO agencies (name, is_personal)
        VALUES (NEW.full_name || '''s Agency', TRUE)
        RETURNING id INTO new_agency_id;
        
        NEW.agency_id = new_agency_id;
        NEW.role = 'admin'; -- Solo agents are admins of their personal agency
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_personal_agency
    BEFORE INSERT ON agents
    FOR EACH ROW
    EXECUTE FUNCTION create_personal_agency_for_agent();

-- ============================================
-- MIGRATE EXISTING AGENTS
-- Create personal agencies for existing agents
-- ============================================
DO $$
DECLARE
    agent_record RECORD;
    new_agency_id UUID;
BEGIN
    FOR agent_record IN 
        SELECT id, full_name FROM agents WHERE agency_id IS NULL
    LOOP
        INSERT INTO agencies (name, is_personal)
        VALUES (agent_record.full_name || '''s Agency', TRUE)
        RETURNING id INTO new_agency_id;
        
        UPDATE agents 
        SET agency_id = new_agency_id, role = 'admin'
        WHERE id = agent_record.id;
    END LOOP;
END $$;
