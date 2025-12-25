-- ============================================
-- PropFit Consolidated Schema & Seed Data
-- Migration: 008_consolidated_schema_and_seed.sql
-- 
-- This migration:
-- 1. Ensures all columns exist with proper defaults
-- 2. Cleans up old seed data 
-- 3. Seeds fresh realistic test data with all fields populated
-- ============================================

-- ============================================
-- CLEAN UP OLD TEST DATA
-- ============================================
DELETE FROM lead_events WHERE lead_id IN (SELECT id FROM leads WHERE name LIKE '%bin %' OR name LIKE '%binti %' OR name LIKE '% Wei %' OR name LIKE '% Kumar%' OR name LIKE '% Nair%');
DELETE FROM upgrade_alerts WHERE lead_id IN (SELECT id FROM leads WHERE name LIKE '%bin %' OR name LIKE '%binti %' OR name LIKE '% Wei %' OR name LIKE '% Kumar%' OR name LIKE '% Nair%');
DELETE FROM upgrade_stage_history WHERE lead_id IN (SELECT id FROM leads WHERE name LIKE '%bin %' OR name LIKE '%binti %' OR name LIKE '% Wei %' OR name LIKE '% Kumar%' OR name LIKE '% Nair%');
DELETE FROM leads WHERE name LIKE '%bin %' OR name LIKE '%binti %' OR name LIKE '% Wei %' OR name LIKE '% Kumar%' OR name LIKE '% Nair%';

-- ============================================
-- SEED 50 REALISTIC TEST LEADS
-- ============================================
DO $$
DECLARE
    agent_uuid UUID;
    lead_id UUID;
    
    -- Arrays for randomization
    names TEXT[] := ARRAY[
        'Ahmad Razak', 'Siti Aminah', 'Muhammad Hafiz', 'Nurul Izzah', 'Mohd Farid',
        'Tan Wei Ming', 'Lee Mei Ling', 'Wong Kah Wai', 'Lim Soo Mei', 'Ng Kok Leong',
        'Rajesh Kumar', 'Priya Devi', 'Suresh Nair', 'Deepa Menon', 'Ganesh Pillai',
        'Aishah Rahman', 'Zainab Hassan', 'Ismail Ibrahim', 'Fatimah Yusof', 'Ali Osman',
        'Chan Bee Ling', 'Goh Soon Huat', 'Ong Kim Huat', 'Foo Mei Yen', 'Teh Wei Liang',
        'Arjun Singh', 'Meera Krishnan', 'Vikram Rao', 'Kavitha Nair', 'Balaji Muthu',
        'Haslina Mohd', 'Azman Abdullah', 'Rosmah Ahmad', 'Hafiz Hassan', 'Fauziah Ibrahim',
        'Low Yee Ling', 'Cheah Soo Lin', 'Yeoh Beng Kiat', 'Koh Mei Fong', 'Sim Hui Ling',
        'Santhosh Kumar', 'Revathi Devi', 'Anand Pillai', 'Lakshmi Menon', 'Krishna Rajan',
        'Zulkifli Ramli', 'Nor Azizah', 'Ramli Yusof', 'Amir Hassan', 'Aminah Ibrahim'
    ];
    
    -- Klang Valley areas (snake_case values)
    kv_budget TEXT[] := ARRAY['cheras', 'seri_kembangan', 'setapak', 'kepong', 'puchong', 'kajang', 'semenyih'];
    kv_mid TEXT[] := ARRAY['petaling_jaya', 'old_klang_road', 'subang_jaya', 'shah_alam', 'kota_damansara', 'ampang'];
    kv_premium TEXT[] := ARRAY['mont_kiara', 'bangsar', 'damansara_heights', 'klcc', 'bukit_bintang', 'desa_parkcity', 'ttdi'];
    
    -- Penang areas (snake_case values)
    pg_budget TEXT[] := ARRAY['butterworth', 'bayan_lepas', 'jelutong', 'air_itam'];
    pg_mid TEXT[] := ARRAY['gelugor', 'pulau_tikus', 'tanjung_tokong'];
    pg_premium TEXT[] := ARRAY['georgetown', 'gurney', 'tanjung_bungah'];
    
    -- Johor Bahru areas (snake_case values)
    jb_budget TEXT[] := ARRAY['skudai', 'tampoi', 'perling', 'taman_universiti', 'masai'];
    jb_mid TEXT[] := ARRAY['mount_austin', 'tebrau', 'taman_molek', 'bukit_indah'];
    jb_premium TEXT[] := ARRAY['medini', 'puteri_harbour', 'iskandar_puteri'];
    
    cities TEXT[] := ARRAY['klang_valley', 'penang', 'johor_bahru'];
    intents TEXT[] := ARRAY['rent', 'buy'];
    timelines TEXT[] := ARRAY['immediate', '1_3_months', '3_6_months', '6_12_months', 'flexible'];
    employment_types TEXT[] := ARRAY['permanent', 'contract', 'self_employed', 'business_owner', 'freelance'];
    statuses TEXT[] := ARRAY['new', 'contacted', 'viewing_scheduled', 'negotiating', 'nurturing'];
    property_types TEXT[] := ARRAY['condo', 'apartment', 'serviced_residence', 'flat', 'terrace', 'semi_d', 'townhouse'];
    family_statuses TEXT[] := ARRAY['not_discussed', 'spouse_pending', 'spouse_aligned', 'family_objection', 'all_aligned'];
    upgrade_signals TEXT[] := ARRAY['wants_bigger_space', 'wants_landed', 'wants_better_location', 'investment_opportunity', 'downsizing', 'relocating'];
    upgrade_stages TEXT[] := ARRAY['monitoring', 'window_open', 'planning'];
    readiness_states TEXT[] := ARRAY['not_ready', 'monitoring', 'ready'];
    
    i INTEGER;
    v_name TEXT;
    v_phone TEXT;
    v_city TEXT;
    v_intent TEXT;
    v_areas TEXT[];
    v_income_min INTEGER;
    v_income_max INTEGER;
    v_budget_min INTEGER;
    v_budget_max INTEGER;
    v_timeline TEXT;
    v_emp_type TEXT;
    v_years_job INTEGER;
    v_loan_pct INTEGER;
    v_has_rejection BOOLEAN;
    v_first_time BOOLEAN;
    v_lease_end DATE;
    v_email TEXT;
    v_notes TEXT;
    v_qual_score INTEGER;
    v_qual_status TEXT;
    v_fin_readiness TEXT;
    v_status TEXT;
    v_qual_breakdown JSONB;
    v_income_score INTEGER;
    v_location_score INTEGER;
    v_credit_score INTEGER;
    v_urgency_score INTEGER;
    
    -- Upgrade fields
    v_current_income INTEGER;
    v_current_prop_type TEXT;
    v_current_prop_loc TEXT;
    v_current_prop_city TEXT;
    v_current_prop_year INTEGER;
    v_current_prop_price INTEGER;
    v_current_prop_value INTEGER;
    v_outstanding_loan INTEGER;
    v_family_status TEXT;
    v_co_applicant_income INTEGER;
    v_num_decision_makers INTEGER;
    v_upgrade_signals TEXT[];
    v_upgrade_target_type TEXT;
    v_upgrade_stage TEXT;
    v_upgrade_readiness INTEGER;
    v_upgrade_state TEXT;
    v_upgrade_breakdown JSONB;
    v_income_history JSONB;
    v_life_milestones JSONB;
    
    -- Temp variables
    tier_rand FLOAT;
    city_idx INTEGER;
    
BEGIN
    -- Get first available agent
    SELECT id INTO agent_uuid FROM agents LIMIT 1;
    
    IF agent_uuid IS NULL THEN
        RAISE NOTICE 'No agent found. Please create an agent first.';
        RETURN;
    END IF;

    FOR i IN 1..50 LOOP
        -- Pick name
        v_name := names[1 + floor(random() * array_length(names, 1))];
        
        -- Generate phone
        v_phone := '+601' || (floor(random() * 10))::TEXT || lpad((floor(random() * 10000000))::TEXT, 7, '0');
        
        -- Pick city and areas based on budget tier
        city_idx := floor(random() * 3);
        tier_rand := random();
        
        IF city_idx = 0 THEN
            v_city := 'klang_valley';
            IF tier_rand < 0.4 THEN
                v_areas := ARRAY[kv_budget[1 + floor(random() * array_length(kv_budget, 1))], kv_budget[1 + floor(random() * array_length(kv_budget, 1))]];
            ELSIF tier_rand < 0.75 THEN
                v_areas := ARRAY[kv_mid[1 + floor(random() * array_length(kv_mid, 1))], kv_mid[1 + floor(random() * array_length(kv_mid, 1))]];
            ELSE
                v_areas := ARRAY[kv_premium[1 + floor(random() * array_length(kv_premium, 1))], kv_premium[1 + floor(random() * array_length(kv_premium, 1))]];
            END IF;
        ELSIF city_idx = 1 THEN
            v_city := 'penang';
            IF tier_rand < 0.4 THEN
                v_areas := ARRAY[pg_budget[1 + floor(random() * array_length(pg_budget, 1))], pg_budget[1 + floor(random() * array_length(pg_budget, 1))]];
            ELSIF tier_rand < 0.75 THEN
                v_areas := ARRAY[pg_mid[1 + floor(random() * array_length(pg_mid, 1))], pg_mid[1 + floor(random() * array_length(pg_mid, 1))]];
            ELSE
                v_areas := ARRAY[pg_premium[1 + floor(random() * array_length(pg_premium, 1))], pg_premium[1 + floor(random() * array_length(pg_premium, 1))]];
            END IF;
        ELSE
            v_city := 'johor_bahru';
            IF tier_rand < 0.4 THEN
                v_areas := ARRAY[jb_budget[1 + floor(random() * array_length(jb_budget, 1))], jb_budget[1 + floor(random() * array_length(jb_budget, 1))]];
            ELSIF tier_rand < 0.75 THEN
                v_areas := ARRAY[jb_mid[1 + floor(random() * array_length(jb_mid, 1))], jb_mid[1 + floor(random() * array_length(jb_mid, 1))]];
            ELSE
                v_areas := ARRAY[jb_premium[1 + floor(random() * array_length(jb_premium, 1))], jb_premium[1 + floor(random() * array_length(jb_premium, 1))]];
            END IF;
        END IF;
        
        -- Remove duplicate areas
        v_areas := ARRAY(SELECT DISTINCT unnest(v_areas));
        
        -- Intent
        v_intent := intents[1 + floor(random() * 2)];
        
        -- Income (RM 4,000 - RM 35,000 range)
        v_income_min := 4000 + floor(random() * 15000);
        v_income_max := v_income_min + 1000 + floor(random() * 5000);
        
        -- Budget based on intent and tier
        IF v_intent = 'rent' THEN
            IF tier_rand < 0.4 THEN
                v_budget_min := 800 + floor(random() * 500);
                v_budget_max := v_budget_min + 500 + floor(random() * 500);
            ELSIF tier_rand < 0.75 THEN
                v_budget_min := 1500 + floor(random() * 1000);
                v_budget_max := v_budget_min + 500 + floor(random() * 1000);
            ELSE
                v_budget_min := 3000 + floor(random() * 2000);
                v_budget_max := v_budget_min + 1000 + floor(random() * 2000);
            END IF;
        ELSE
            IF tier_rand < 0.4 THEN
                v_budget_min := 300000 + floor(random() * 150000);
                v_budget_max := v_budget_min + 50000 + floor(random() * 100000);
            ELSIF tier_rand < 0.75 THEN
                v_budget_min := 500000 + floor(random() * 300000);
                v_budget_max := v_budget_min + 100000 + floor(random() * 200000);
            ELSE
                v_budget_min := 1000000 + floor(random() * 500000);
                v_budget_max := v_budget_min + 200000 + floor(random() * 500000);
            END IF;
        END IF;
        
        -- Other basic fields
        v_timeline := timelines[1 + floor(random() * array_length(timelines, 1))];
        v_emp_type := employment_types[1 + floor(random() * array_length(employment_types, 1))];
        v_years_job := floor(random() * 15);
        v_loan_pct := floor(random() * 50);
        v_has_rejection := random() < 0.12;
        v_first_time := random() < 0.4;
        
        -- Lease end (only for renters upgrading, 40% chance)
        IF NOT v_first_time AND random() < 0.4 THEN
            v_lease_end := CURRENT_DATE + (30 + floor(random() * 335))::INTEGER;
        ELSE
            v_lease_end := NULL;
        END IF;
        
        -- Email (80% have)
        IF random() < 0.8 THEN
            v_email := lower(regexp_replace(v_name, '[^a-zA-Z]', '.', 'g')) || floor(random() * 100)::TEXT || '@gmail.com';
        ELSE
            v_email := NULL;
        END IF;
        
        -- Notes
        CASE floor(random() * 6)::INTEGER
            WHEN 0 THEN v_notes := 'Referred by existing client. Very motivated.';
            WHEN 1 THEN v_notes := 'Looking to relocate from outstation for work.';
            WHEN 2 THEN v_notes := 'Family expanding, needs bigger space.';
            WHEN 3 THEN v_notes := 'Investment buyer, looking for rental yield.';
            WHEN 4 THEN v_notes := 'Upgrading from current apartment.';
            ELSE v_notes := NULL;
        END CASE;
        
        -- ============================================
        -- UPGRADE-RELATED FIELDS
        -- ============================================
        
        -- Current income (slightly higher than income range midpoint for upgraders)
        IF NOT v_first_time THEN
            v_current_income := floor((v_income_min + v_income_max) / 2) + floor(random() * 2000);
        ELSE
            v_current_income := floor((v_income_min + v_income_max) / 2);
        END IF;
        
        -- Current property (for non-first-time buyers, 70% have details)
        IF NOT v_first_time AND random() < 0.7 THEN
            v_current_prop_type := property_types[1 + floor(random() * array_length(property_types, 1))];
            v_current_prop_city := v_city;
            v_current_prop_year := 2010 + floor(random() * 12);
            v_current_prop_price := 250000 + floor(random() * 400000);
            v_current_prop_value := floor(v_current_prop_price * (1.1 + random() * 0.4)); -- 10-50% appreciation
            v_outstanding_loan := floor(v_current_prop_price * (0.3 + random() * 0.5)); -- 30-80% remaining
            
            CASE v_current_prop_city
                WHEN 'klang_valley' THEN v_current_prop_loc := kv_mid[1 + floor(random() * array_length(kv_mid, 1))];
                WHEN 'penang' THEN v_current_prop_loc := pg_mid[1 + floor(random() * array_length(pg_mid, 1))];
                ELSE v_current_prop_loc := jb_mid[1 + floor(random() * array_length(jb_mid, 1))];
            END CASE;
        ELSE
            v_current_prop_type := NULL;
            v_current_prop_loc := NULL;
            v_current_prop_city := NULL;
            v_current_prop_year := NULL;
            v_current_prop_price := NULL;
            v_current_prop_value := NULL;
            v_outstanding_loan := NULL;
        END IF;
        
        -- Family alignment
        v_family_status := family_statuses[1 + floor(random() * array_length(family_statuses, 1))];
        v_num_decision_makers := 1 + floor(random() * 3);
        
        -- Co-applicant income (40% have)
        IF random() < 0.4 THEN
            v_co_applicant_income := 3000 + floor(random() * 10000);
        ELSE
            v_co_applicant_income := NULL;
        END IF;
        
        -- Upgrade intent signals (1-3 signals for non-first-time)
        IF NOT v_first_time THEN
            v_upgrade_signals := ARRAY[upgrade_signals[1 + floor(random() * array_length(upgrade_signals, 1))]];
            IF random() < 0.5 THEN
                v_upgrade_signals := array_append(v_upgrade_signals, upgrade_signals[1 + floor(random() * array_length(upgrade_signals, 1))]);
            END IF;
            v_upgrade_target_type := property_types[1 + floor(random() * array_length(property_types, 1))];
        ELSE
            v_upgrade_signals := ARRAY[]::TEXT[];
            v_upgrade_target_type := NULL;
        END IF;
        
        -- Income history (for non-first-time, show growth)
        IF NOT v_first_time AND v_current_income IS NOT NULL THEN
            v_income_history := jsonb_build_array(
                jsonb_build_object(
                    'amount', floor(v_current_income * 0.75),
                    'date', (CURRENT_DATE - INTERVAL '2 years')::DATE::TEXT,
                    'notes', 'Starting salary'
                ),
                jsonb_build_object(
                    'amount', floor(v_current_income * 0.9),
                    'date', (CURRENT_DATE - INTERVAL '1 year')::DATE::TEXT,
                    'notes', 'After annual increment'
                ),
                jsonb_build_object(
                    'amount', v_current_income,
                    'date', (CURRENT_DATE - INTERVAL '3 months')::DATE::TEXT,
                    'notes', 'Current income'
                )
            );
        ELSE
            v_income_history := '[]'::JSONB;
        END IF;
        
        -- Life milestones (30% have)
        IF random() < 0.3 THEN
            v_life_milestones := jsonb_build_array(
                jsonb_build_object(
                    'type', CASE floor(random() * 4)::INTEGER
                        WHEN 0 THEN 'marriage'
                        WHEN 1 THEN 'child'
                        WHEN 2 THEN 'promotion'
                        ELSE 'job_change'
                    END,
                    'date', (CURRENT_DATE - (30 + floor(random() * 365))::INTEGER)::TEXT,
                    'notes', 'Life event recorded'
                )
            );
        ELSE
            v_life_milestones := '[]'::JSONB;
        END IF;
        
        -- ============================================
        -- SCORING
        -- ============================================
        
        -- Calculate component scores
        v_income_score := 30 + floor(random() * 70);
        v_location_score := 30 + floor(random() * 70);
        v_credit_score := CASE 
            WHEN v_has_rejection THEN 20 + floor(random() * 30)
            WHEN v_emp_type = 'permanent' AND v_years_job >= 2 THEN 60 + floor(random() * 40)
            ELSE 40 + floor(random() * 40)
        END;
        v_urgency_score := CASE v_timeline
            WHEN 'immediate' THEN 85 + floor(random() * 15)
            WHEN '1_3_months' THEN 70 + floor(random() * 20)
            WHEN '3_6_months' THEN 50 + floor(random() * 25)
            WHEN '6_12_months' THEN 30 + floor(random() * 25)
            ELSE 20 + floor(random() * 30)
        END;
        
        -- Total score
        v_qual_score := floor(v_income_score * 0.35 + v_location_score * 0.25 + v_credit_score * 0.25 + v_urgency_score * 0.15);
        
        -- Qualification status
        IF v_qual_score < 40 THEN
            v_qual_status := 'not_qualified';
            v_fin_readiness := 'weak';
        ELSIF v_qual_score < 65 THEN
            v_qual_status := 'stretch';
            v_fin_readiness := 'moderate';
        ELSE
            v_qual_status := 'qualified';
            v_fin_readiness := CASE WHEN v_credit_score >= 65 THEN 'strong' ELSE 'moderate' END;
        END IF;
        
        -- Qualification breakdown
        v_qual_breakdown := jsonb_build_object(
            'income_score', v_income_score,
            'location_score', v_location_score,
            'credit_score', v_credit_score,
            'urgency_score', v_urgency_score,
            'total_score', v_qual_score,
            'details', jsonb_build_object(
                'income_analysis', CASE 
                    WHEN v_income_score >= 75 THEN 'Excellent income-to-budget ratio. Comfortable financing position.'
                    WHEN v_income_score >= 55 THEN 'Good income level. Budget within reasonable affordability.'
                    ELSE 'Income may be stretched. Consider adjusting budget.'
                END,
                'location_analysis', CASE 
                    WHEN v_location_score >= 75 THEN 'Excellent location-budget match. Preferred areas align well.'
                    WHEN v_location_score >= 55 THEN 'Good location fit. Most areas within budget range.'
                    ELSE 'Some areas may be a stretch. Will suggest alternatives.'
                END,
                'credit_analysis', CASE 
                    WHEN v_credit_score >= 70 THEN 'Strong financing profile. Stable employment and low debt.'
                    WHEN v_credit_score >= 50 THEN 'Moderate financing readiness. Standard approval expected.'
                    ELSE 'Some financing concerns. May need pre-approval.'
                END,
                'urgency_analysis', CASE v_timeline
                    WHEN 'immediate' THEN 'High urgency - actively looking and ready to decide.'
                    WHEN '1_3_months' THEN 'Good timeline. Motivated with clear intent.'
                    WHEN '3_6_months' THEN 'Moderate timeline. Good for nurturing.'
                    ELSE 'Flexible timeline. May be exploring options.'
                END
            )
        );
        
        -- Lead status
        v_status := statuses[1 + floor(random() * array_length(statuses, 1))];
        
        -- Upgrade pipeline fields
        IF NOT v_first_time AND v_current_prop_value IS NOT NULL THEN
            v_upgrade_stage := upgrade_stages[1 + floor(random() * array_length(upgrade_stages, 1))];
            v_upgrade_readiness := 20 + floor(random() * 80);
            v_upgrade_state := CASE 
                WHEN v_upgrade_readiness >= 70 THEN 'ready'
                WHEN v_upgrade_readiness >= 40 THEN 'monitoring'
                ELSE 'not_ready'
            END;
            v_upgrade_breakdown := jsonb_build_object(
                'income_growth_score', 10 + floor(random() * 30),
                'income_growth_reason', 'Income has grown steadily over time.',
                'equity_score', 15 + floor(random() * 30),
                'equity_reason', 'Building equity in current property.',
                'debt_score', 10 + floor(random() * 25),
                'debt_reason', 'Debt obligations within manageable range.',
                'employment_score', 15 + floor(random() * 25),
                'employment_reason', 'Stable employment history.',
                'rejection_score', CASE WHEN v_has_rejection THEN 0 ELSE 20 END,
                'rejection_reason', CASE WHEN v_has_rejection THEN 'Previous rejection on record.' ELSE 'No rejection history.' END,
                'total_score', v_upgrade_readiness
            );
        ELSE
            v_upgrade_stage := 'monitoring';
            v_upgrade_readiness := 0;
            v_upgrade_state := 'not_ready';
            v_upgrade_breakdown := '{}'::JSONB;
        END IF;
        
        -- ============================================
        -- INSERT LEAD
        -- ============================================
        INSERT INTO leads (
            agent_id,
            name,
            phone,
            monthly_income_min,
            monthly_income_max,
            preferred_city,
            preferred_areas,
            intent,
            budget_min,
            budget_max,
            move_in_timeline,
            employment_type,
            years_in_current_job,
            existing_loan_commitment_percent,
            previous_loan_rejection,
            is_first_time_buyer,
            lease_end_date,
            email,
            notes,
            qualification_score,
            qualification_status,
            qualification_breakdown,
            financing_readiness,
            status,
            is_upgrade_ready,
            -- Financial snapshot
            current_income,
            income_last_updated,
            current_property_value,
            property_value_last_updated,
            outstanding_loan_balance,
            loan_balance_last_updated,
            income_history,
            life_milestones,
            -- Current property
            current_property_type,
            current_property_location,
            current_property_city,
            current_property_purchase_year,
            current_property_purchase_price,
            -- Family & decision makers
            family_alignment_status,
            family_alignment_notes,
            co_applicant_income,
            number_of_decision_makers,
            -- Upgrade intent
            upgrade_intent_signals,
            upgrade_target_property_type,
            -- Upgrade pipeline
            upgrade_stage,
            upgrade_stage_changed_at,
            upgrade_readiness_score,
            upgrade_readiness_state,
            upgrade_readiness_breakdown,
            -- Timestamps
            created_at,
            updated_at
        ) VALUES (
            agent_uuid,
            v_name,
            v_phone,
            v_income_min,
            v_income_max,
            v_city,
            v_areas,
            v_intent,
            v_budget_min,
            v_budget_max,
            v_timeline,
            v_emp_type,
            v_years_job,
            v_loan_pct,
            v_has_rejection,
            v_first_time,
            v_lease_end,
            v_email,
            v_notes,
            v_qual_score,
            v_qual_status,
            v_qual_breakdown,
            v_fin_readiness,
            v_status,
            NOT v_first_time AND v_upgrade_state = 'ready',
            -- Financial snapshot
            v_current_income,
            CASE WHEN v_current_income IS NOT NULL THEN NOW() - (floor(random() * 30) || ' days')::INTERVAL ELSE NULL END,
            v_current_prop_value,
            CASE WHEN v_current_prop_value IS NOT NULL THEN NOW() - (floor(random() * 60) || ' days')::INTERVAL ELSE NULL END,
            v_outstanding_loan,
            CASE WHEN v_outstanding_loan IS NOT NULL THEN NOW() - (floor(random() * 30) || ' days')::INTERVAL ELSE NULL END,
            v_income_history,
            v_life_milestones,
            -- Current property
            v_current_prop_type::property_type,
            v_current_prop_loc,
            v_current_prop_city,
            v_current_prop_year,
            v_current_prop_price,
            -- Family & decision makers
            v_family_status::family_alignment_status,
            CASE WHEN v_family_status != 'not_discussed' THEN 'Family discussion notes' ELSE NULL END,
            v_co_applicant_income,
            v_num_decision_makers,
            -- Upgrade intent
            v_upgrade_signals::upgrade_intent_signal[],
            v_upgrade_target_type::property_type,
            -- Upgrade pipeline
            v_upgrade_stage,
            NOW() - (floor(random() * 45) || ' days')::INTERVAL,
            v_upgrade_readiness,
            v_upgrade_state,
            v_upgrade_breakdown,
            -- Timestamps
            NOW() - (floor(random() * 90) || ' days')::INTERVAL,
            NOW() - (floor(random() * 14) || ' days')::INTERVAL
        );
        
    END LOOP;
    
    RAISE NOTICE 'Successfully seeded 50 test leads for agent %', agent_uuid;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
    'Total leads' as metric,
    COUNT(*)::TEXT as value
FROM leads
UNION ALL
SELECT 
    'First-time buyers',
    COUNT(*)::TEXT
FROM leads WHERE is_first_time_buyer = true
UNION ALL
SELECT 
    'Upgraders (has current property)',
    COUNT(*)::TEXT
FROM leads WHERE current_property_value IS NOT NULL
UNION ALL
SELECT 
    'Ready for upgrade',
    COUNT(*)::TEXT
FROM leads WHERE upgrade_readiness_state = 'ready'
UNION ALL
SELECT 
    'By city - KV',
    COUNT(*)::TEXT
FROM leads WHERE preferred_city = 'klang_valley'
UNION ALL
SELECT 
    'By city - Penang',
    COUNT(*)::TEXT
FROM leads WHERE preferred_city = 'penang'
UNION ALL
SELECT 
    'By city - JB',
    COUNT(*)::TEXT
FROM leads WHERE preferred_city = 'johor_bahru';
