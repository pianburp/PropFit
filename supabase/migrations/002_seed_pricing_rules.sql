-- ============================================
-- SEED DATA: Malaysia Pricing Rules
-- ============================================

-- Klang Valley - Rental Rules
INSERT INTO pricing_rules (city, intent, area_rules) VALUES
('klang_valley', 'rent', '{
    "cheras": {"min_budget": 1500, "max_budget": 3500, "tier": "budget", "avg_rent": 2200},
    "seri_kembangan": {"min_budget": 1500, "max_budget": 3500, "tier": "budget", "avg_rent": 2000},
    "setapak": {"min_budget": 1500, "max_budget": 3000, "tier": "budget", "avg_rent": 1800},
    "kepong": {"min_budget": 1500, "max_budget": 3200, "tier": "budget", "avg_rent": 2000},
    "puchong": {"min_budget": 1800, "max_budget": 4000, "tier": "budget", "avg_rent": 2500},
    "kajang": {"min_budget": 1200, "max_budget": 3000, "tier": "budget", "avg_rent": 1800},
    "semenyih": {"min_budget": 1000, "max_budget": 2500, "tier": "budget", "avg_rent": 1500},
    "petaling_jaya": {"min_budget": 2500, "max_budget": 6000, "tier": "mid", "avg_rent": 3500},
    "old_klang_road": {"min_budget": 2000, "max_budget": 5000, "tier": "mid", "avg_rent": 3000},
    "subang_jaya": {"min_budget": 2500, "max_budget": 5500, "tier": "mid", "avg_rent": 3500},
    "shah_alam": {"min_budget": 1800, "max_budget": 4500, "tier": "mid", "avg_rent": 2800},
    "kota_damansara": {"min_budget": 2500, "max_budget": 5500, "tier": "mid", "avg_rent": 3800},
    "ampang": {"min_budget": 2000, "max_budget": 5000, "tier": "mid", "avg_rent": 3200},
    "mont_kiara": {"min_budget": 4500, "max_budget": 15000, "tier": "premium", "avg_rent": 7000},
    "bangsar": {"min_budget": 4000, "max_budget": 12000, "tier": "premium", "avg_rent": 6500},
    "damansara_heights": {"min_budget": 5000, "max_budget": 20000, "tier": "premium", "avg_rent": 9000},
    "klcc": {"min_budget": 5000, "max_budget": 18000, "tier": "premium", "avg_rent": 8000},
    "bukit_bintang": {"min_budget": 4000, "max_budget": 12000, "tier": "premium", "avg_rent": 6000},
    "desa_parkcity": {"min_budget": 4500, "max_budget": 10000, "tier": "premium", "avg_rent": 6500},
    "ttdi": {"min_budget": 3500, "max_budget": 8000, "tier": "premium", "avg_rent": 5000}
}'::JSONB);

-- Klang Valley - Buy Rules
INSERT INTO pricing_rules (city, intent, area_rules) VALUES
('klang_valley', 'buy', '{
    "cheras": {"min_budget": 300000, "max_budget": 600000, "tier": "budget", "avg_price": 450000},
    "seri_kembangan": {"min_budget": 280000, "max_budget": 550000, "tier": "budget", "avg_price": 400000},
    "setapak": {"min_budget": 250000, "max_budget": 500000, "tier": "budget", "avg_price": 380000},
    "kepong": {"min_budget": 300000, "max_budget": 600000, "tier": "budget", "avg_price": 420000},
    "puchong": {"min_budget": 350000, "max_budget": 700000, "tier": "budget", "avg_price": 500000},
    "kajang": {"min_budget": 250000, "max_budget": 550000, "tier": "budget", "avg_price": 380000},
    "semenyih": {"min_budget": 200000, "max_budget": 450000, "tier": "budget", "avg_price": 320000},
    "petaling_jaya": {"min_budget": 450000, "max_budget": 1200000, "tier": "mid", "avg_price": 750000},
    "old_klang_road": {"min_budget": 400000, "max_budget": 900000, "tier": "mid", "avg_price": 600000},
    "subang_jaya": {"min_budget": 500000, "max_budget": 1100000, "tier": "mid", "avg_price": 750000},
    "shah_alam": {"min_budget": 350000, "max_budget": 850000, "tier": "mid", "avg_price": 550000},
    "kota_damansara": {"min_budget": 500000, "max_budget": 1000000, "tier": "mid", "avg_price": 700000},
    "ampang": {"min_budget": 400000, "max_budget": 900000, "tier": "mid", "avg_price": 600000},
    "mont_kiara": {"min_budget": 900000, "max_budget": 3000000, "tier": "premium", "avg_price": 1500000},
    "bangsar": {"min_budget": 800000, "max_budget": 2500000, "tier": "premium", "avg_price": 1400000},
    "damansara_heights": {"min_budget": 1500000, "max_budget": 5000000, "tier": "premium", "avg_price": 2500000},
    "klcc": {"min_budget": 1000000, "max_budget": 4000000, "tier": "premium", "avg_price": 1800000},
    "bukit_bintang": {"min_budget": 700000, "max_budget": 2000000, "tier": "premium", "avg_price": 1200000},
    "desa_parkcity": {"min_budget": 1000000, "max_budget": 2500000, "tier": "premium", "avg_price": 1600000},
    "ttdi": {"min_budget": 700000, "max_budget": 1800000, "tier": "premium", "avg_price": 1100000}
}'::JSONB);

-- Penang - Rental Rules
INSERT INTO pricing_rules (city, intent, area_rules) VALUES
('penang', 'rent', '{
    "butterworth": {"min_budget": 800, "max_budget": 2000, "tier": "budget", "avg_rent": 1200},
    "bayan_lepas": {"min_budget": 1200, "max_budget": 3000, "tier": "budget", "avg_rent": 1800},
    "jelutong": {"min_budget": 1200, "max_budget": 2800, "tier": "budget", "avg_rent": 1800},
    "air_itam": {"min_budget": 1000, "max_budget": 2500, "tier": "budget", "avg_rent": 1600},
    "gelugor": {"min_budget": 1500, "max_budget": 3500, "tier": "mid", "avg_rent": 2200},
    "pulau_tikus": {"min_budget": 2000, "max_budget": 5000, "tier": "mid", "avg_rent": 3000},
    "tanjung_tokong": {"min_budget": 2000, "max_budget": 5500, "tier": "mid", "avg_rent": 3200},
    "georgetown": {"min_budget": 2500, "max_budget": 6000, "tier": "premium", "avg_rent": 3800},
    "gurney": {"min_budget": 3500, "max_budget": 10000, "tier": "premium", "avg_rent": 5500},
    "tanjung_bungah": {"min_budget": 3000, "max_budget": 8000, "tier": "premium", "avg_rent": 4500}
}'::JSONB);

-- Penang - Buy Rules
INSERT INTO pricing_rules (city, intent, area_rules) VALUES
('penang', 'buy', '{
    "butterworth": {"min_budget": 180000, "max_budget": 400000, "tier": "budget", "avg_price": 280000},
    "bayan_lepas": {"min_budget": 280000, "max_budget": 600000, "tier": "budget", "avg_price": 420000},
    "jelutong": {"min_budget": 300000, "max_budget": 550000, "tier": "budget", "avg_price": 400000},
    "air_itam": {"min_budget": 250000, "max_budget": 500000, "tier": "budget", "avg_price": 350000},
    "gelugor": {"min_budget": 350000, "max_budget": 700000, "tier": "mid", "avg_price": 500000},
    "pulau_tikus": {"min_budget": 500000, "max_budget": 1000000, "tier": "mid", "avg_price": 700000},
    "tanjung_tokong": {"min_budget": 500000, "max_budget": 1200000, "tier": "mid", "avg_price": 750000},
    "georgetown": {"min_budget": 600000, "max_budget": 1500000, "tier": "premium", "avg_price": 900000},
    "gurney": {"min_budget": 800000, "max_budget": 2500000, "tier": "premium", "avg_price": 1400000},
    "tanjung_bungah": {"min_budget": 700000, "max_budget": 2000000, "tier": "premium", "avg_price": 1100000}
}'::JSONB);

-- Johor Bahru - Rental Rules
INSERT INTO pricing_rules (city, intent, area_rules) VALUES
('johor_bahru', 'rent', '{
    "skudai": {"min_budget": 800, "max_budget": 2000, "tier": "budget", "avg_rent": 1200},
    "tampoi": {"min_budget": 800, "max_budget": 2200, "tier": "budget", "avg_rent": 1300},
    "perling": {"min_budget": 900, "max_budget": 2300, "tier": "budget", "avg_rent": 1400},
    "taman_universiti": {"min_budget": 800, "max_budget": 2000, "tier": "budget", "avg_rent": 1200},
    "masai": {"min_budget": 700, "max_budget": 1800, "tier": "budget", "avg_rent": 1100},
    "mount_austin": {"min_budget": 1200, "max_budget": 3000, "tier": "mid", "avg_rent": 1800},
    "tebrau": {"min_budget": 1200, "max_budget": 3200, "tier": "mid", "avg_rent": 2000},
    "taman_molek": {"min_budget": 1500, "max_budget": 3500, "tier": "mid", "avg_rent": 2200},
    "bukit_indah": {"min_budget": 1500, "max_budget": 4000, "tier": "mid", "avg_rent": 2500},
    "medini": {"min_budget": 2000, "max_budget": 5000, "tier": "premium", "avg_rent": 3000},
    "puteri_harbour": {"min_budget": 3000, "max_budget": 8000, "tier": "premium", "avg_rent": 4500},
    "iskandar_puteri": {"min_budget": 2500, "max_budget": 6000, "tier": "premium", "avg_rent": 3500}
}'::JSONB);

-- Johor Bahru - Buy Rules
INSERT INTO pricing_rules (city, intent, area_rules) VALUES
('johor_bahru', 'buy', '{
    "skudai": {"min_budget": 180000, "max_budget": 400000, "tier": "budget", "avg_price": 280000},
    "tampoi": {"min_budget": 200000, "max_budget": 450000, "tier": "budget", "avg_price": 300000},
    "perling": {"min_budget": 220000, "max_budget": 480000, "tier": "budget", "avg_price": 320000},
    "taman_universiti": {"min_budget": 180000, "max_budget": 400000, "tier": "budget", "avg_price": 280000},
    "masai": {"min_budget": 150000, "max_budget": 350000, "tier": "budget", "avg_price": 240000},
    "mount_austin": {"min_budget": 300000, "max_budget": 600000, "tier": "mid", "avg_price": 420000},
    "tebrau": {"min_budget": 280000, "max_budget": 600000, "tier": "mid", "avg_price": 400000},
    "taman_molek": {"min_budget": 350000, "max_budget": 700000, "tier": "mid", "avg_price": 500000},
    "bukit_indah": {"min_budget": 400000, "max_budget": 800000, "tier": "mid", "avg_price": 550000},
    "medini": {"min_budget": 500000, "max_budget": 1200000, "tier": "premium", "avg_price": 750000},
    "puteri_harbour": {"min_budget": 700000, "max_budget": 2000000, "tier": "premium", "avg_price": 1100000},
    "iskandar_puteri": {"min_budget": 550000, "max_budget": 1400000, "tier": "premium", "avg_price": 850000}
}'::JSONB);
