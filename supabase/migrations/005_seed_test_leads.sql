-- Seed 100 Test Leads for PropFit Testing
-- Run this migration after setting up an agent account
-- Replace 'YOUR_AGENT_UUID' with your actual agent ID from Supabase auth.users

-- ============================================
-- HELPER: Create test agent if not exists
-- ============================================
-- First, we need a test agent. This query assumes you have a user in auth.users.
-- Get your user ID from Supabase Dashboard > Authentication > Users
-- Then insert into agents table if not already there:

-- INSERT INTO agents (id, full_name, phone, agency_name, license_number, preferred_cities, subscription_status)
-- VALUES (
--     'YOUR_AGENT_UUID'::UUID,
--     'Test Agent',
--     '+60123456789',
--     'PropFit Realty',
--     'REN12345',
--     ARRAY['klang_valley', 'penang', 'johor_bahru'],
--     'active'
-- ) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEED 100 LEADS
-- ============================================
-- IMPORTANT: Replace 'YOUR_AGENT_UUID' below with your actual agent UUID

DO $$
DECLARE
    agent_uuid UUID := 'YOUR_AGENT_UUID'; -- REPLACE THIS!
    
    -- Malaysian names arrays
    malay_first_names TEXT[] := ARRAY['Ahmad', 'Muhammad', 'Mohd', 'Abdul', 'Ali', 'Hassan', 'Ibrahim', 'Ismail', 'Farid', 'Azman', 'Razak', 'Hafiz', 'Amir', 'Zulkifli', 'Ramli', 'Siti', 'Nurul', 'Fatimah', 'Aishah', 'Nor', 'Zainab', 'Aminah', 'Haslina', 'Fauziah', 'Rosmah'];
    malay_last_names TEXT[] := ARRAY['bin Abdullah', 'bin Ahmad', 'bin Hassan', 'bin Ibrahim', 'bin Ismail', 'binti Abdullah', 'binti Ahmad', 'binti Hassan', 'binti Ibrahim', 'binti Ismail', 'bin Mohd', 'binti Mohd', 'bin Yusof', 'binti Yusof', 'bin Osman'];
    chinese_names TEXT[] := ARRAY['Tan Wei Ming', 'Lee Chong Wei', 'Wong Kah Wai', 'Lim Mei Ling', 'Ng Siew Mei', 'Chan Kok Leong', 'Goh Bee Ling', 'Ong Kim Huat', 'Low Yee Ling', 'Teh Soon Huat', 'Foo Mei Yen', 'Yeoh Beng Kiat', 'Cheah Soo Lin', 'Koh Wei Liang', 'Sim Hui Ling', 'Chin Mei Fong', 'Lau Kok Wai', 'Yap Suk Mei', 'Hew Keng Soon', 'Pang Mei Yun'];
    indian_names TEXT[] := ARRAY['Rajesh Kumar', 'Suresh Nair', 'Anand Pillai', 'Priya Devi', 'Lakshmi Menon', 'Krishnan Muthu', 'Ganesh Rajan', 'Deepa Krishnan', 'Vikram Singh', 'Arjun Nair', 'Meera Devi', 'Santhosh Kumar', 'Revathi Nair', 'Balaji Rao', 'Kavitha Pillai'];
    
    -- Areas for each city
    klang_valley_areas TEXT[] := ARRAY['Mont Kiara', 'Bangsar', 'KLCC', 'Damansara Heights', 'Sri Hartamas', 'Desa ParkCity', 'Bukit Jalil', 'Cheras', 'Kepong', 'Setapak', 'Puchong', 'Subang Jaya', 'Petaling Jaya', 'Shah Alam', 'Cyberjaya', 'Kajang', 'Ampang', 'Segambut', 'Sentul', 'Wangsa Maju'];
    penang_areas TEXT[] := ARRAY['George Town', 'Gurney Drive', 'Tanjung Bungah', 'Batu Ferringhi', 'Jelutong', 'Air Itam', 'Gelugor', 'Sungai Nibong', 'Bayan Lepas', 'Bukit Jambul', 'Queensbay', 'Butterworth', 'Seberang Jaya', 'Perai', 'Simpang Ampat'];
    johor_bahru_areas TEXT[] := ARRAY['Iskandar Puteri', 'Johor Bahru City', 'Mount Austin', 'Permas Jaya', 'Tebrau', 'Danga Bay', 'Bukit Indah', 'Taman Molek', 'Taman Sentosa', 'Skudai', 'Kulai', 'Pasir Gudang', 'Masai', 'Ulu Tiram', 'Senai'];
    
    cities TEXT[] := ARRAY['klang_valley', 'penang', 'johor_bahru'];
    intents TEXT[] := ARRAY['rent', 'buy'];
    timelines TEXT[] := ARRAY['immediate', '1_3_months', '3_6_months', '6_12_months', 'flexible'];
    employment_types TEXT[] := ARRAY['permanent', 'contract', 'self_employed', 'business_owner', 'freelance'];
    statuses TEXT[] := ARRAY['new', 'contacted', 'viewing_scheduled', 'negotiating', 'closed_won', 'closed_lost', 'nurturing'];
    qualification_statuses TEXT[] := ARRAY['pending', 'not_qualified', 'stretch', 'qualified'];
    financing_types TEXT[] := ARRAY['weak', 'moderate', 'strong'];
    
    i INTEGER;
    lead_name TEXT;
    lead_phone TEXT;
    lead_city TEXT;
    lead_intent TEXT;
    lead_areas TEXT[];
    income_min INTEGER;
    income_max INTEGER;
    budget_min INTEGER;
    budget_max INTEGER;
    timeline TEXT;
    emp_type TEXT;
    years_job INTEGER;
    loan_commitment INTEGER;
    loan_rejection BOOLEAN;
    first_time_buyer BOOLEAN;
    lease_end DATE;
    lead_email TEXT;
    lead_notes TEXT;
    qual_score INTEGER;
    qual_status TEXT;
    fin_readiness TEXT;
    lead_status TEXT;
    is_upgrade BOOLEAN;
    name_pool INTEGER;
    -- Score breakdown variables
    income_score INTEGER;
    location_score INTEGER;
    credit_score INTEGER;
    urgency_score INTEGER;
    qual_breakdown JSONB;
    income_analysis TEXT;
    location_analysis TEXT;
    credit_analysis TEXT;
    urgency_analysis TEXT;
BEGIN
    -- Verify agent exists
    IF NOT EXISTS (SELECT 1 FROM agents WHERE id = agent_uuid) THEN
        RAISE NOTICE 'Agent UUID % not found. Please create an agent first or replace YOUR_AGENT_UUID with a valid agent ID.', agent_uuid;
        RETURN;
    END IF;

    FOR i IN 1..100 LOOP
        -- Randomize name from different ethnic groups
        name_pool := floor(random() * 3);
        IF name_pool = 0 THEN
            lead_name := malay_first_names[1 + floor(random() * array_length(malay_first_names, 1))] || ' ' || 
                        malay_last_names[1 + floor(random() * array_length(malay_last_names, 1))];
        ELSIF name_pool = 1 THEN
            lead_name := chinese_names[1 + floor(random() * array_length(chinese_names, 1))];
        ELSE
            lead_name := indian_names[1 + floor(random() * array_length(indian_names, 1))];
        END IF;
        
        -- Generate Malaysian phone number
        lead_phone := '+601' || (floor(random() * 10))::TEXT || 
                     lpad((floor(random() * 10000000))::TEXT, 7, '0');
        
        -- Randomize city and get corresponding areas
        lead_city := cities[1 + floor(random() * array_length(cities, 1))];
        IF lead_city = 'klang_valley' THEN
            lead_areas := ARRAY[
                klang_valley_areas[1 + floor(random() * array_length(klang_valley_areas, 1))],
                klang_valley_areas[1 + floor(random() * array_length(klang_valley_areas, 1))]
            ];
        ELSIF lead_city = 'penang' THEN
            lead_areas := ARRAY[
                penang_areas[1 + floor(random() * array_length(penang_areas, 1))],
                penang_areas[1 + floor(random() * array_length(penang_areas, 1))]
            ];
        ELSE
            lead_areas := ARRAY[
                johor_bahru_areas[1 + floor(random() * array_length(johor_bahru_areas, 1))],
                johor_bahru_areas[1 + floor(random() * array_length(johor_bahru_areas, 1))]
            ];
        END IF;
        
        -- Randomize intent
        lead_intent := intents[1 + floor(random() * array_length(intents, 1))];
        
        -- Generate income range (RM 3,000 - RM 50,000)
        income_min := 3000 + floor(random() * 47000);
        income_max := income_min + floor(random() * 5000) + 1000;
        
        -- Generate budget based on intent and income
        IF lead_intent = 'rent' THEN
            budget_min := floor(income_min * 0.2) + floor(random() * 500);
            budget_max := floor(income_max * 0.4) + floor(random() * 1000);
        ELSE -- buy
            budget_min := floor(income_min * 48) + floor(random() * 100000);
            budget_max := floor(income_max * 60) + floor(random() * 200000);
        END IF;
        
        -- Randomize other fields
        timeline := timelines[1 + floor(random() * array_length(timelines, 1))];
        emp_type := employment_types[1 + floor(random() * array_length(employment_types, 1))];
        years_job := floor(random() * 20);
        loan_commitment := floor(random() * 60);
        loan_rejection := random() < 0.15;
        first_time_buyer := random() < 0.6;
        
        -- Lease end date (only for renters, 50% chance)
        IF lead_intent = 'rent' AND random() < 0.5 THEN
            lease_end := CURRENT_DATE + (floor(random() * 365) || ' days')::INTERVAL;
        ELSE
            lease_end := NULL;
        END IF;
        
        -- Email (70% have email)
        IF random() < 0.7 THEN
            lead_email := lower(replace(lead_name, ' ', '.')) || floor(random() * 1000)::TEXT || '@gmail.com';
        ELSE
            lead_email := NULL;
        END IF;
        
        -- Notes
        CASE floor(random() * 5)::INTEGER
            WHEN 0 THEN lead_notes := 'Referred by friend. Urgent requirement.';
            WHEN 1 THEN lead_notes := 'Looking to relocate from outstation.';
            WHEN 2 THEN lead_notes := 'Working in nearby area. Need convenience.';
            WHEN 3 THEN lead_notes := 'Family size increasing. Need larger space.';
            ELSE lead_notes := NULL;
        END CASE;
        
        -- Generate individual scores (0-100 range with realistic distribution)
        income_score := 20 + floor(random() * 80);  -- 20-100
        location_score := 20 + floor(random() * 80);
        credit_score := 30 + floor(random() * 70);
        urgency_score := CASE timeline
            WHEN 'immediate' THEN 90 + floor(random() * 10)
            WHEN '1_3_months' THEN 80 + floor(random() * 15)
            WHEN '3_6_months' THEN 60 + floor(random() * 20)
            WHEN '6_12_months' THEN 40 + floor(random() * 20)
            ELSE 20 + floor(random() * 30)
        END;
        
        -- Calculate weighted total score (40% income, 30% location, 20% credit, 10% urgency)
        qual_score := floor(
            income_score * 0.4 + 
            location_score * 0.3 + 
            credit_score * 0.2 + 
            urgency_score * 0.1
        );
        
        -- Generate analysis text based on scores
        IF income_score >= 80 THEN
            income_analysis := 'Excellent income-to-budget ratio. Very comfortable financing position.';
        ELSIF income_score >= 60 THEN
            income_analysis := 'Good income level. Budget is within reasonable affordability range.';
        ELSIF income_score >= 40 THEN
            income_analysis := 'Moderate income. May need to adjust budget expectations slightly.';
        ELSE
            income_analysis := 'Income may be stretched for desired budget. Consider lower price range.';
        END IF;
        
        IF location_score >= 80 THEN
            location_analysis := 'Excellent location-budget match! Preferred areas align well with budget.';
        ELSIF location_score >= 60 THEN
            location_analysis := 'Good location fit. Most preferred areas are within budget range.';
        ELSIF location_score >= 40 THEN
            location_analysis := 'Some preferred areas may be a stretch. Consider adjacent neighborhoods.';
        ELSE
            location_analysis := 'Preferred areas significantly exceed budget. Will suggest alternatives.';
        END IF;
        
        IF credit_score >= 80 THEN
            credit_analysis := 'Strong financing profile. Stable employment and low debt obligations.';
        ELSIF credit_score >= 60 THEN
            credit_analysis := 'Moderate financing readiness. Standard loan approval expected.';
        ELSIF credit_score >= 40 THEN
            credit_analysis := 'Some financing concerns. May benefit from pre-approval process.';
        ELSE
            credit_analysis := 'Financing challenges present. Recommend credit counseling before purchase.';
        END IF;
        
        IF urgency_score >= 80 THEN
            urgency_analysis := 'High urgency - actively looking and ready to make decisions.';
        ELSIF urgency_score >= 60 THEN
            urgency_analysis := 'Good timeline. Motivated buyer/renter with clear intent.';
        ELSIF urgency_score >= 40 THEN
            urgency_analysis := 'Moderate timeline. Good for nurturing relationship.';
        ELSE
            urgency_analysis := 'Flexible timeline. May be exploring options, needs nurturing.';
        END IF;
        
        -- Build qualification breakdown JSON
        qual_breakdown := jsonb_build_object(
            'income_score', income_score,
            'location_score', location_score,
            'credit_score', credit_score,
            'urgency_score', urgency_score,
            'total_score', qual_score,
            'details', jsonb_build_object(
                'income_analysis', income_analysis,
                'location_analysis', location_analysis,
                'credit_analysis', credit_analysis,
                'urgency_analysis', urgency_analysis
            )
        );
        
        -- Determine qualification status based on total score
        IF qual_score < 45 THEN
            qual_status := 'not_qualified';
            fin_readiness := 'weak';
        ELSIF qual_score < 70 THEN
            qual_status := 'stretch';
            fin_readiness := 'moderate';
        ELSE
            qual_status := 'qualified';
            IF credit_score >= 70 THEN
                fin_readiness := 'strong';
            ELSE
                fin_readiness := 'moderate';
            END IF;
        END IF;
        
        -- Lead status (weighted towards earlier stages)
        CASE floor(random() * 10)::INTEGER
            WHEN 0, 1, 2, 3 THEN lead_status := 'new';
            WHEN 4, 5 THEN lead_status := 'contacted';
            WHEN 6 THEN lead_status := 'viewing_scheduled';
            WHEN 7 THEN lead_status := 'negotiating';
            WHEN 8 THEN lead_status := 'nurturing';
            ELSE lead_status := CASE WHEN random() < 0.5 THEN 'closed_won' ELSE 'closed_lost' END;
        END CASE;
        
        -- Upgrade ready (15% of leads)
        is_upgrade := random() < 0.15;
        
        -- Insert the lead
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
            created_at,
            updated_at
        ) VALUES (
            agent_uuid,
            lead_name,
            lead_phone,
            income_min,
            income_max,
            lead_city,
            lead_areas,
            lead_intent,
            budget_min,
            budget_max,
            timeline,
            emp_type,
            years_job,
            loan_commitment,
            loan_rejection,
            first_time_buyer,
            lease_end,
            lead_email,
            lead_notes,
            qual_score,
            qual_status,
            qual_breakdown,
            fin_readiness,
            lead_status,
            is_upgrade,
            NOW() - (floor(random() * 90) || ' days')::INTERVAL, -- Random creation date in last 90 days
            NOW() - (floor(random() * 30) || ' days')::INTERVAL  -- Random update date in last 30 days
        );
        
    END LOOP;
    
    RAISE NOTICE 'Successfully seeded 100 test leads for agent %', agent_uuid;
END $$;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify your leads were created:
-- SELECT 
--     status, 
--     qualification_status, 
--     preferred_city, 
--     intent, 
--     COUNT(*) 
-- FROM leads 
-- GROUP BY status, qualification_status, preferred_city, intent 
-- ORDER BY status, qualification_status;
