-- Migration: Add IC number field and upsert support
-- This migration adds Malaysian IC/NRIC as a lead identifier for matching

-- ============================================
-- ADD IC NUMBER FIELD TO LEADS
-- ============================================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ic_number TEXT;

-- ============================================
-- ADD INDEXES FOR EFFICIENT MATCHING
-- ============================================
-- IC number index (partial - only when not null)
CREATE INDEX IF NOT EXISTS idx_leads_ic_number ON leads(ic_number) WHERE ic_number IS NOT NULL;

-- Phone index for matching
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);

-- Email index (partial - only when not null)
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email) WHERE email IS NOT NULL;

-- ============================================
-- ADD 'upserted' EVENT TYPE
-- ============================================
-- Drop and recreate the constraint to add the new event type
ALTER TABLE lead_events DROP CONSTRAINT IF EXISTS lead_events_event_type_check;

ALTER TABLE lead_events ADD CONSTRAINT lead_events_event_type_check
  CHECK (event_type IN (
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
    'qualification_recalculated',
    'upserted',
    'stage_changed',
    'marked_lost',
    'conversation_step',
    'fallback_plan'
  ));

-- ============================================
-- COMMENT ON COLUMNS
-- ============================================
COMMENT ON COLUMN leads.ic_number IS 'Malaysian IC/NRIC number for unique identification and upsert matching';
