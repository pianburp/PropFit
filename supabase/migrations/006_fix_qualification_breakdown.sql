-- Update existing leads that have NULL or empty qualification_breakdown
-- This script generates realistic breakdown scores for existing seeded data

UPDATE leads
SET qualification_breakdown = jsonb_build_object(
    'income_score', 
    CASE 
        WHEN qualification_score >= 80 THEN 70 + floor(random() * 30)
        WHEN qualification_score >= 60 THEN 50 + floor(random() * 35)
        WHEN qualification_score >= 40 THEN 30 + floor(random() * 40)
        ELSE 20 + floor(random() * 30)
    END,
    'location_score',
    CASE 
        WHEN qualification_score >= 80 THEN 70 + floor(random() * 30)
        WHEN qualification_score >= 60 THEN 50 + floor(random() * 35)
        WHEN qualification_score >= 40 THEN 35 + floor(random() * 35)
        ELSE 20 + floor(random() * 30)
    END,
    'credit_score',
    CASE 
        WHEN financing_readiness = 'strong' THEN 75 + floor(random() * 25)
        WHEN financing_readiness = 'moderate' THEN 50 + floor(random() * 30)
        ELSE 30 + floor(random() * 30)
    END,
    'urgency_score',
    CASE move_in_timeline
        WHEN 'immediate' THEN 90 + floor(random() * 10)
        WHEN '1_3_months' THEN 80 + floor(random() * 15)
        WHEN '3_6_months' THEN 60 + floor(random() * 20)
        WHEN '6_12_months' THEN 40 + floor(random() * 20)
        ELSE 20 + floor(random() * 30)
    END,
    'total_score', qualification_score,
    'details', jsonb_build_object(
        'income_analysis', 
        CASE 
            WHEN qualification_score >= 80 THEN 'Excellent income-to-budget ratio. Very comfortable financing position.'
            WHEN qualification_score >= 60 THEN 'Good income level. Budget is within reasonable affordability range.'
            WHEN qualification_score >= 40 THEN 'Moderate income. May need to adjust budget expectations slightly.'
            ELSE 'Income may be stretched for desired budget. Consider lower price range.'
        END,
        'location_analysis',
        CASE 
            WHEN qualification_score >= 70 THEN 'Excellent location-budget match! Preferred areas align well with budget.'
            WHEN qualification_score >= 50 THEN 'Good location fit. Most preferred areas are within budget range.'
            WHEN qualification_score >= 35 THEN 'Some preferred areas may be a stretch. Consider adjacent neighborhoods.'
            ELSE 'Preferred areas significantly exceed budget. Will suggest alternatives.'
        END,
        'credit_analysis',
        CASE financing_readiness
            WHEN 'strong' THEN 'Strong financing profile. Stable employment and low debt obligations.'
            WHEN 'moderate' THEN 'Moderate financing readiness. Standard loan approval expected.'
            ELSE 'Some financing concerns. May benefit from pre-approval process.'
        END,
        'urgency_analysis',
        CASE move_in_timeline
            WHEN 'immediate' THEN 'High urgency - actively looking and ready to make decisions.'
            WHEN '1_3_months' THEN 'Good timeline. Motivated buyer/renter with clear intent.'
            WHEN '3_6_months' THEN 'Moderate timeline. Good for nurturing relationship.'
            ELSE 'Flexible timeline. May be exploring options, needs nurturing.'
        END
    )
)
WHERE qualification_breakdown IS NULL 
   OR qualification_breakdown = '{}'::JSONB;

-- Verify the update
SELECT 
    name,
    qualification_score,
    qualification_breakdown->>'income_score' as income_score,
    qualification_breakdown->>'location_score' as location_score,
    qualification_breakdown->>'credit_score' as credit_score,
    qualification_breakdown->>'urgency_score' as urgency_score
FROM leads 
LIMIT 5;
