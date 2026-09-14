-- =============================================================================
-- ChainGuard AI — Complete Supabase PostgreSQL Production Schema & Seed Data
-- IBM BoB AI Innovation Hackathon 2026
-- =============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/_/sql
-- 2. Open the SQL Editor, paste this entire file, and click "Run".
-- 3. All 11 tables, indices, RLS policies, auth triggers, and seed records will be created.
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 0. Table: profiles (User Authentication & Roles)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    full_name VARCHAR(255),
    avatar_url TEXT,
    provider VARCHAR(50) DEFAULT 'email',
    role VARCHAR(50) DEFAULT 'Operations Lead',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profile RLS Policies
DROP POLICY IF EXISTS "Allow users to read own profile" ON profiles;
CREATE POLICY "Allow users to read own profile" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
CREATE POLICY "Allow users to update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to insert own profile" ON profiles;
CREATE POLICY "Allow users to insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow service_role full access profiles" ON profiles;
CREATE POLICY "Allow service_role full access profiles" ON profiles FOR ALL USING (true);

-- Auto-create profile trigger on new Supabase signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, provider)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 1. Table: product_profiles
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_profiles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    min_temp_c DOUBLE PRECISION DEFAULT 2.0,
    max_temp_c DOUBLE PRECISION DEFAULT 8.0,
    max_excursion_mins INTEGER DEFAULT 30,
    critical_temp_c DOUBLE PRECISION DEFAULT 10.0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. Table: carriers
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS carriers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    transport_mode VARCHAR(50) DEFAULT 'ROAD',
    reliability_score DOUBLE PRECISION DEFAULT 0.90,
    cost_index DOUBLE PRECISION DEFAULT 1.0,
    available_capacity_teu INTEGER DEFAULT 50,
    cold_chain_certified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 3. Table: disruptions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS disruptions (
    id VARCHAR(64) PRIMARY KEY,
    disruption_id VARCHAR(64) UNIQUE,
    title VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    disruption_type VARCHAR(100) NOT NULL,
    type VARCHAR(100),
    location VARCHAR(255) NOT NULL,
    severity VARCHAR(50) DEFAULT 'HIGH',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    duration_hours INTEGER DEFAULT 72,
    affected_corridor VARCHAR(255),
    affected_corridors TEXT,
    description TEXT,
    delay_estimate_hours DOUBLE PRECISION DEFAULT 48.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_disruptions_status ON disruptions(status);
CREATE INDEX IF NOT EXISTS idx_disruptions_severity ON disruptions(severity);

-- -----------------------------------------------------------------------------
-- 4. Table: fleet_assets
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fleet_assets (
    id VARCHAR(64) PRIMARY KEY,
    asset_id VARCHAR(64) UNIQUE,
    asset_type VARCHAR(50) NOT NULL,
    identifier VARCHAR(100) NOT NULL,
    registration VARCHAR(100),
    location VARCHAR(255) NOT NULL,
    current_location VARCHAR(255),
    latitude DOUBLE PRECISION DEFAULT 18.95,
    longitude DOUBLE PRECISION DEFAULT 72.82,
    capacity_tons DOUBLE PRECISION DEFAULT 20.0,
    capacity DOUBLE PRECISION DEFAULT 20.0,
    status VARCHAR(50) DEFAULT 'IDLE',
    idle_hours DOUBLE PRECISION DEFAULT 14.0,
    active_hours DOUBLE PRECISION DEFAULT 31.0,
    available_hours DOUBLE PRECISION DEFAULT 168.0,
    available_from TIMESTAMP WITH TIME ZONE,
    utilisation_pct DOUBLE PRECISION DEFAULT 18.5,
    utilization DOUBLE PRECISION DEFAULT 18.5,
    is_refrigerated BOOLEAN DEFAULT TRUE,
    temperature_capable BOOLEAN DEFAULT TRUE,
    assigned_shipment_id VARCHAR(64),
    assigned_shipment VARCHAR(64),
    match_score INTEGER DEFAULT 91,
    projected_gain VARCHAR(50) DEFAULT '+35.7%',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fleet_assets_status ON fleet_assets(status);
CREATE INDEX IF NOT EXISTS idx_fleet_assets_type ON fleet_assets(asset_type);

-- -----------------------------------------------------------------------------
-- 5. Table: containers
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS containers (
    id VARCHAR(64) PRIMARY KEY,
    container_id VARCHAR(64) UNIQUE,
    shipment_id VARCHAR(64),
    container_type VARCHAR(50) DEFAULT 'REEFER_40FT',
    product_type VARCHAR(100) DEFAULT 'mRNA Vaccines',
    status VARCHAR(50) DEFAULT 'NORMAL',
    current_temperature DOUBLE PRECISION DEFAULT 5.4,
    peak_temperature DOUBLE PRECISION DEFAULT 5.8,
    target_min_temperature DOUBLE PRECISION DEFAULT 2.0,
    target_max_temperature DOUBLE PRECISION DEFAULT 8.0,
    required_range VARCHAR(50) DEFAULT '2°C - 8°C',
    latitude DOUBLE PRECISION DEFAULT 18.95,
    longitude DOUBLE PRECISION DEFAULT 72.82,
    current_location VARCHAR(255) DEFAULT 'Mumbai Port',
    asset_id VARCHAR(64),
    is_anomaly BOOLEAN DEFAULT FALSE,
    anomaly_layer VARCHAR(50) DEFAULT 'NONE',
    spoilage_risk_pct DOUBLE PRECISION DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_containers_status ON containers(status);
CREATE INDEX IF NOT EXISTS idx_containers_shipment ON containers(shipment_id);

-- -----------------------------------------------------------------------------
-- 6. Table: shipments
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shipments (
    id VARCHAR(64) PRIMARY KEY,
    shipment_id VARCHAR(64) UNIQUE,
    route VARCHAR(255) NOT NULL,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    cargo VARCHAR(255) NOT NULL,
    cargo_type VARCHAR(255),
    value VARCHAR(50) DEFAULT '$1.25M',
    value_usd DOUBLE PRECISION DEFAULT 1250000.0,
    cargo_value DOUBLE PRECISION DEFAULT 1250000.0,
    eta VARCHAR(50) DEFAULT 'Sep 16',
    risk INTEGER DEFAULT 92,
    risk_score INTEGER DEFAULT 92,
    disruption VARCHAR(255) DEFAULT 'Mumbai Port Strike',
    disruption_id VARCHAR(64) REFERENCES disruptions(id) ON DELETE SET NULL,
    carrier VARCHAR(100) DEFAULT 'Carrier B',
    asset VARCHAR(64) DEFAULT 'TRK-204',
    asset_id VARCHAR(64) REFERENCES fleet_assets(id) ON DELETE SET NULL,
    container_id VARCHAR(64) REFERENCES containers(id) ON DELETE SET NULL,
    action VARCHAR(100) DEFAULT 'Reroute',
    status VARCHAR(50) DEFAULT 'AT_RISK',
    priority VARCHAR(50) DEFAULT 'CRITICAL',
    delay_hours INTEGER DEFAULT 72,
    current_location VARCHAR(255) DEFAULT 'Mumbai Port',
    is_cold_chain BOOLEAN DEFAULT TRUE,
    temperature_controlled BOOLEAN DEFAULT TRUE,
    product_profile_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_priority ON shipments(priority);
CREATE INDEX IF NOT EXISTS idx_shipments_disruption ON shipments(disruption_id);

-- -----------------------------------------------------------------------------
-- 7. Table: sensor_readings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sensor_readings (
    id SERIAL PRIMARY KEY,
    shipment_id VARCHAR(64) REFERENCES shipments(id) ON DELETE CASCADE,
    container_id VARCHAR(64) REFERENCES containers(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    time_label VARCHAR(50) DEFAULT '14:00',
    temperature_c DOUBLE PRECISION NOT NULL,
    temperature DOUBLE PRECISION,
    humidity_pct DOUBLE PRECISION DEFAULT 65.0,
    humidity DOUBLE PRECISION DEFAULT 65.0,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_anomaly BOOLEAN DEFAULT FALSE,
    anomaly_layer VARCHAR(50),
    is_excursion BOOLEAN DEFAULT FALSE,
    excursion_duration_mins INTEGER DEFAULT 0,
    peak_temperature_c DOUBLE PRECISION,
    severity VARCHAR(50) DEFAULT 'NORMAL',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    sensor_status VARCHAR(50) DEFAULT 'OPERATIONAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_container ON sensor_readings(container_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_shipment ON sensor_readings(shipment_id);

-- -----------------------------------------------------------------------------
-- 8. Table: cold_chain_alerts
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cold_chain_alerts (
    id VARCHAR(64) PRIMARY KEY,
    alert_id VARCHAR(64) UNIQUE,
    container_id VARCHAR(64) REFERENCES containers(id) ON DELETE CASCADE,
    shipment_id VARCHAR(64) REFERENCES shipments(id) ON DELETE CASCADE,
    severity VARCHAR(50) DEFAULT 'CRITICAL',
    alert_type VARCHAR(100) DEFAULT 'EXCURSION_TEMPERATURE_SPIKE',
    temperature DOUBLE PRECISION DEFAULT 10.3,
    peak_temperature DOUBLE PRECISION DEFAULT 11.2,
    duration_minutes INTEGER DEFAULT 45,
    configured_range VARCHAR(50) DEFAULT '2°C - 8°C',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    recommended_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- -----------------------------------------------------------------------------
-- 9. Table: cold_storage_hubs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cold_storage_hubs (
    id VARCHAR(64) PRIMARY KEY,
    hub_id VARCHAR(64) UNIQUE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    capacity_tons DOUBLE PRECISION DEFAULT 500.0,
    available_tons DOUBLE PRECISION DEFAULT 180.0,
    occupied_pct DOUBLE PRECISION DEFAULT 64.0,
    certified BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'OPERATIONAL',
    contact VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 10. Table: recommendations
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recommendations (
    id VARCHAR(64) PRIMARY KEY,
    recommendation_id VARCHAR(64) UNIQUE,
    kind VARCHAR(50) NOT NULL,
    recommendation_type VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    level VARCHAR(50) DEFAULT 'CRITICAL',
    title VARCHAR(255) NOT NULL,
    confidence INTEGER DEFAULT 94,
    description TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    explanation TEXT,
    shipment_id VARCHAR(64) REFERENCES shipments(id) ON DELETE CASCADE,
    disruption_id VARCHAR(64) REFERENCES disruptions(id) ON DELETE SET NULL,
    asset_id VARCHAR(64) REFERENCES fleet_assets(id) ON DELETE SET NULL,
    delay_reduction_hours INTEGER DEFAULT 28,
    expected_delay_reduction INTEGER DEFAULT 28,
    risk_reduction_percent INTEGER DEFAULT 64,
    expected_risk_reduction INTEGER DEFAULT 64,
    financial_saving VARCHAR(50) DEFAULT '$800K',
    expected_cost_impact VARCHAR(50) DEFAULT '$800K',
    recommended_route VARCHAR(255),
    recommended_carrier VARCHAR(100),
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 11. Table: simulation_runs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS simulation_runs (
    id SERIAL PRIMARY KEY,
    disruption_id VARCHAR(64) REFERENCES disruptions(id) ON DELETE CASCADE,
    disruption_type VARCHAR(100) NOT NULL,
    duration_hours INTEGER DEFAULT 72,
    severity VARCHAR(50) DEFAULT 'CRITICAL',
    before_delay INTEGER DEFAULT 72,
    after_delay INTEGER DEFAULT 44,
    delay_reduction INTEGER DEFAULT 28,
    exposure_before VARCHAR(50) DEFAULT '$1.25M',
    exposure_after VARCHAR(50) DEFAULT '$450K',
    critical_shipments_protected INTEGER DEFAULT 3,
    confidence INTEGER DEFAULT 94,
    comparison_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- Row Level Security (RLS) Policies
-- =============================================================================
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE disruptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cold_chain_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cold_storage_hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;

-- Public / Anonymous Read Access (Allows Frontend Client Direct Queries)
CREATE POLICY "Allow public read shipments" ON shipments FOR SELECT USING (true);
CREATE POLICY "Allow public read disruptions" ON disruptions FOR SELECT USING (true);
CREATE POLICY "Allow public read fleet_assets" ON fleet_assets FOR SELECT USING (true);
CREATE POLICY "Allow public read containers" ON containers FOR SELECT USING (true);
CREATE POLICY "Allow public read sensor_readings" ON sensor_readings FOR SELECT USING (true);
CREATE POLICY "Allow public read cold_chain_alerts" ON cold_chain_alerts FOR SELECT USING (true);
CREATE POLICY "Allow public read cold_storage_hubs" ON cold_storage_hubs FOR SELECT USING (true);
CREATE POLICY "Allow public read recommendations" ON recommendations FOR SELECT USING (true);
CREATE POLICY "Allow public read simulation_runs" ON simulation_runs FOR SELECT USING (true);
CREATE POLICY "Allow public read product_profiles" ON product_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read carriers" ON carriers FOR SELECT USING (true);

-- Service Role Full Access
CREATE POLICY "Allow service_role full access shipments" ON shipments FOR ALL USING (true);
CREATE POLICY "Allow service_role full access disruptions" ON disruptions FOR ALL USING (true);
CREATE POLICY "Allow service_role full access fleet_assets" ON fleet_assets FOR ALL USING (true);
CREATE POLICY "Allow service_role full access containers" ON containers FOR ALL USING (true);
CREATE POLICY "Allow service_role full access sensor_readings" ON sensor_readings FOR ALL USING (true);
CREATE POLICY "Allow service_role full access cold_chain_alerts" ON cold_chain_alerts FOR ALL USING (true);
CREATE POLICY "Allow service_role full access cold_storage_hubs" ON cold_storage_hubs FOR ALL USING (true);
CREATE POLICY "Allow service_role full access recommendations" ON recommendations FOR ALL USING (true);
CREATE POLICY "Allow service_role full access simulation_runs" ON simulation_runs FOR ALL USING (true);
CREATE POLICY "Allow service_role full access product_profiles" ON product_profiles FOR ALL USING (true);
CREATE POLICY "Allow service_role full access carriers" ON carriers FOR ALL USING (true);

-- =============================================================================
-- SEED DATA INSERTION
-- =============================================================================

-- 1. Product Profiles (7 columns: id, name, min_temp_c, max_temp_c, max_excursion_mins, critical_temp_c, description)
INSERT INTO product_profiles (id, name, min_temp_c, max_temp_c, max_excursion_mins, critical_temp_c, description)
VALUES 
('VACCINES_SOP', 'Vaccines (WHO/SOP Profile)', 2.0, 8.0, 30, 10.0, 'Configured Product/SOP Range 2–8°C'),
('PHARMA_SOP', 'General Pharmaceuticals', 2.0, 8.0, 60, 12.0, 'Configured Product/SOP Range 2–8°C'),
('BIOLOGICS_SOP', 'Biologics', 2.0, 8.0, 45, 10.5, 'Configured Product/SOP Range 2–8°C')
ON CONFLICT (id) DO NOTHING;

-- 2. Carriers (7 columns: id, name, transport_mode, reliability_score, cost_index, available_capacity_teu, cold_chain_certified)
INSERT INTO carriers (id, name, transport_mode, reliability_score, cost_index, available_capacity_teu, cold_chain_certified)
VALUES
('CAR-A', 'Carrier A', 'ROAD', 0.88, 1.0, 40, true),
('CAR-B', 'Carrier B', 'ROAD_SEA', 0.94, 1.1, 65, true),
('CAR-C', 'Carrier C', 'SEA', 0.82, 0.9, 80, false),
('CAR-D', 'Carrier D', 'AIR_SEA', 0.91, 1.2, 30, true)
ON CONFLICT (id) DO NOTHING;

-- 3. Disruptions (11 columns: id, disruption_id, title, disruption_type, severity, location, affected_corridor, duration_hours, status, description, delay_estimate_hours)
INSERT INTO disruptions (id, disruption_id, title, disruption_type, severity, location, affected_corridor, duration_hours, status, description, delay_estimate_hours)
VALUES
('DIS-01', 'DIS-01', 'Mumbai Port Strike', 'PORT_STRIKE', 'CRITICAL', 'Mumbai, India — Jawaharlal Nehru Port', 'West Coast Sea Corridor', 72, 'ACTIVE', 'Dock workers at JNPT have initiated an indefinite strike over wage disputes. Container operations halted.', 72.0),
('DIS-02', 'DIS-02', 'Chennai Cyclone Warning', 'WEATHER', 'HIGH', 'Chennai, India — Bay of Bengal corridor', 'East Coast Marine Corridor', 48, 'ACTIVE', 'Severe cyclonic storm approaching Bay of Bengal. Maritime traffic suspended.', 48.0),
('DIS-03', 'DIS-03', 'Delhi Highway Closure', 'ROAD_CLOSURE', 'MEDIUM', 'Delhi, India — NH-48 corridor', 'Northern Freight Corridor', 24, 'ACTIVE', 'Bridge inspection and flash flooding on NH-48 causing severe congestion.', 24.0),
('DIS-04', 'DIS-04', 'Carrier Capacity Reduction', 'CAPACITY_REDUCTION', 'MEDIUM', 'Western India — Carrier network', 'Western Rail & Feeder', 36, 'ACTIVE', 'Shortage of qualified reefer drivers impacting transit capacity across Maharashtra.', 36.0)
ON CONFLICT (id) DO NOTHING;

-- 4. Fleet Assets (13 columns: id, asset_id, asset_type, identifier, location, capacity_tons, status, idle_hours, utilisation_pct, is_refrigerated, match_score, projected_gain, assigned_shipment_id)
INSERT INTO fleet_assets (id, asset_id, asset_type, identifier, location, capacity_tons, status, idle_hours, utilisation_pct, is_refrigerated, match_score, projected_gain, assigned_shipment_id)
VALUES
('TRK-204', 'TRK-204', 'TRUCK', 'MH-04-AB-204', 'Mumbai', 24.0, 'IDLE', 14.0, 18.5, true, 91, '+35.7%', NULL),
('CTN-117', 'CTN-117', 'CONTAINER', 'MSKU-CTN-117', 'Mundra', 28.0, 'IDLE', 22.0, 12.0, true, 87, '+36.6%', NULL),
('TRK-089', 'TRK-089', 'TRUCK', 'MH-12-CD-089', 'Pune', 20.0, 'IDLE', 8.0, 24.3, true, 83, '+37.5%', NULL),
('VSL-003', 'VSL-003', 'VESSEL', 'IMO-9912003', 'Chennai', 1200.0, 'IDLE', 36.0, 8.2, false, 78, '+35.8%', NULL),
('CTN-8801', 'CTN-8801', 'CONTAINER', 'CTN-8801-REEFER', 'Mumbai Port', 22.0, 'ACTIVE', 0.0, 88.0, true, 95, '+0.0%', 'SHP-1042'),
('CTN-8824', 'CTN-8824', 'CONTAINER', 'CTN-8824-REEFER', 'Chennai', 22.0, 'ACTIVE', 0.0, 79.0, true, 92, '+0.0%', 'SHP-1051'),
('CTN-8831', 'CTN-8831', 'CONTAINER', 'CTN-8831-REEFER', 'Mundra', 22.0, 'ACTIVE', 0.0, 82.0, true, 89, '+0.0%', 'SHP-1082')
ON CONFLICT (id) DO NOTHING;

-- 5. Containers (18 columns: id, container_id, shipment_id, container_type, product_type, status, current_temperature, peak_temperature, target_min_temperature, target_max_temperature, required_range, latitude, longitude, current_location, asset_id, is_anomaly, anomaly_layer, spoilage_risk_pct)
INSERT INTO containers (id, container_id, shipment_id, container_type, product_type, status, current_temperature, peak_temperature, target_min_temperature, target_max_temperature, required_range, latitude, longitude, current_location, asset_id, is_anomaly, anomaly_layer, spoilage_risk_pct)
VALUES
('CTN-8801', 'CTN-8801', 'SHP-1042', 'REEFER_40FT', 'Pfizer COVID-19 Vaccine Vials', 'CRITICAL', 10.3, 11.2, 2.0, 8.0, '2°C - 8°C', 18.9401, 72.8347, 'Mumbai JNPT', 'TRK-204', true, 'L1_BOUNDS', 87.4),
('CTN-8824', 'CTN-8824', 'SHP-1051', 'REEFER_40FT', 'Pharmaceutical Consignment', 'NORMAL', 4.8, 5.1, 2.0, 8.0, '2°C - 8°C', 13.0827, 80.2707, 'Chennai Port', 'VSL-003', false, 'NONE', 8.0),
('CTN-8831', 'CTN-8831', 'SHP-1082', 'REEFER_40FT', 'Insulin Cartridges', 'NORMAL', 3.9, 4.2, 2.0, 8.0, '2°C - 8°C', 22.8395, 69.7214, 'Mundra Port', 'CTN-117', false, 'NONE', 4.5),
('CTN-4421', 'CTN-4421', 'SHP-1063', 'REEFER_40FT', 'Semiconductors (Thermal Controlled)', 'NORMAL', 5.2, 5.4, 2.0, 8.0, '2°C - 8°C', 28.6139, 77.2090, 'Delhi Cargo Terminal', 'TRK-089', false, 'NONE', 12.0)
ON CONFLICT (id) DO NOTHING;

-- 6. Shipments (27 columns: id, shipment_id, route, origin, destination, cargo, cargo_type, value, value_usd, cargo_value, eta, risk, risk_score, disruption, disruption_id, carrier, asset, asset_id, container_id, action, status, priority, delay_hours, current_location, is_cold_chain, temperature_controlled, product_profile_id)
INSERT INTO shipments (id, shipment_id, route, origin, destination, cargo, cargo_type, value, value_usd, cargo_value, eta, risk, risk_score, disruption, disruption_id, carrier, asset, asset_id, container_id, action, status, priority, delay_hours, current_location, is_cold_chain, temperature_controlled, product_profile_id)
VALUES
('SHP-1042', 'SHP-1042', 'Mumbai -> Frankfurt', 'Mumbai', 'Frankfurt', 'Vaccines (Biologics)', 'Biologics / Vaccines', '$1.25M', 1250000.0, 1250000.0, 'Sep 16', 92, 92, 'Mumbai Port Strike', 'DIS-01', 'Carrier B', 'TRK-204', 'TRK-204', 'CTN-8801', 'Reroute', 'AT_RISK', 'CRITICAL', 72, 'Mumbai JNPT', true, true, 'VACCINES_SOP'),
('SHP-1051', 'SHP-1051', 'Chennai -> Singapore', 'Chennai', 'Singapore', 'Pharmaceuticals', 'Pharma', '$740K', 740000.0, 740000.0, 'Sep 17', 78, 78, 'Chennai Cyclone Warning', 'DIS-02', 'Carrier C', 'VSL-003', 'VSL-003', 'CTN-8824', 'Expedite', 'AT_RISK', 'HIGH', 48, 'Chennai Port', true, true, 'PHARMA_SOP'),
('SHP-1063', 'SHP-1063', 'Delhi -> Frankfurt', 'Delhi', 'Frankfurt', 'High-Value Semiconductors', 'Electronics', '$510K', 510000.0, 510000.0, 'Sep 18', 64, 64, 'Delhi Highway Closure', 'DIS-03', 'Carrier A', 'TRK-089', 'TRK-089', 'CTN-4421', 'Reroute', 'DELAYED', 'MEDIUM', 24, 'Delhi Terminal', true, true, 'PHARMA_SOP'),
('SHP-1077', 'SHP-1077', 'Pune -> Dubai', 'Pune', 'Dubai', 'Diagnostic Kits', 'Healthcare', '$380K', 380000.0, 380000.0, 'Sep 19', 42, 42, 'Carrier Capacity Reduction', 'DIS-04', 'Carrier B', 'TRK-204', 'TRK-204', 'CTN-8801', 'Monitor', 'ON_TRACK', 'LOW', 0, 'Pune Cargo Hub', true, true, 'BIOLOGICS_SOP'),
('SHP-1082', 'SHP-1082', 'Mundra -> Rotterdam', 'Mundra', 'Rotterdam', 'Insulin Cartridges', 'Biologics', '$890K', 890000.0, 890000.0, 'Sep 21', 35, 35, 'None', NULL, 'Carrier B', 'CTN-117', 'CTN-117', 'CTN-8831', 'Monitor', 'ON_TRACK', 'LOW', 0, 'Mundra Port', true, true, 'VACCINES_SOP'),
('SHP-1090', 'SHP-1090', 'Ahmedabad -> Hamburg', 'Ahmedabad', 'Hamburg', 'Specialty Chemicals', 'Chemicals', '$620K', 620000.0, 620000.0, 'Sep 22', 28, 28, 'None', NULL, 'Carrier D', 'CTN-117', 'CTN-117', 'CTN-8831', 'Monitor', 'ON_TRACK', 'LOW', 0, 'Ahmedabad Terminal', false, false, NULL),
('SHP-1104', 'SHP-1104', 'Bangalore -> London', 'Bangalore', 'London', 'Medical Devices', 'Electronics', '$430K', 430000.0, 430000.0, 'Sep 23', 22, 22, 'None', NULL, 'Carrier A', 'TRK-089', 'TRK-089', 'CTN-4421', 'Monitor', 'ON_TRACK', 'LOW', 0, 'Bangalore Hub', false, false, NULL),
('SHP-1118', 'SHP-1118', 'Kolkata -> Tokyo', 'Kolkata', 'Tokyo', 'Clinical Trial Samples', 'Biologics', '$950K', 950000.0, 950000.0, 'Sep 24', 18, 18, 'None', NULL, 'Carrier D', 'VSL-003', 'VSL-003', 'CTN-8824', 'Monitor', 'ON_TRACK', 'LOW', 0, 'Kolkata Port', true, true, 'BIOLOGICS_SOP')
ON CONFLICT (id) DO NOTHING;

-- 7. Cold Storage Hubs (12 columns: id, hub_id, name, location, latitude, longitude, capacity_tons, available_tons, occupied_pct, certified, status, contact)
INSERT INTO cold_storage_hubs (id, hub_id, name, location, latitude, longitude, capacity_tons, available_tons, occupied_pct, certified, status, contact)
VALUES
('HUB-PUNE-01', 'HUB-PUNE-01', 'Pune Pharma Cold Hub', 'Pune, Maharashtra', 18.5204, 73.8567, 200.0, 140.0, 30.0, true, 'OPERATIONAL', '+91 20 2740 1000'),
('HUB-MUN-01', 'HUB-MUN-01', 'Mundra Port Cold Terminal', 'Mundra, Gujarat', 22.8395, 69.7214, 350.0, 210.0, 40.0, true, 'OPERATIONAL', '+91 2838 255000'),
('HUB-CHN-01', 'HUB-CHN-01', 'Chennai Port Reefer Station', 'Chennai, Tamil Nadu', 13.0827, 80.2707, 400.0, 320.0, 20.0, true, 'OPERATIONAL', '+91 44 2536 2201'),
('HUB-DEL-01', 'HUB-DEL-01', 'Delhi NCR Cargo Cold Hub', 'Delhi NCR', 28.5562, 77.1000, 250.0, 180.0, 28.0, true, 'OPERATIONAL', '+91 11 4963 8000')
ON CONFLICT (id) DO NOTHING;

-- 8. Cold Chain Alerts (12 columns: id, alert_id, container_id, shipment_id, severity, alert_type, temperature, peak_temperature, duration_minutes, configured_range, status, recommended_action)
INSERT INTO cold_chain_alerts (id, alert_id, container_id, shipment_id, severity, alert_type, temperature, peak_temperature, duration_minutes, configured_range, status, recommended_action)
VALUES
('ALT-001', 'ALT-001', 'CTN-8801', 'SHP-1042', 'CRITICAL', 'EXCURSION_TEMPERATURE_SPIKE', 10.3, 11.2, 45, '2°C - 8°C', 'ACTIVE', 'Divert container immediately to Pune Pharma Cold Hub (74 km, ETA 58m) or deploy auxiliary cooling unit.')
ON CONFLICT (id) DO NOTHING;

-- 9. Recommendations (23 columns: id, recommendation_id, kind, recommendation_type, subject, level, title, confidence, description, recommendation, explanation, shipment_id, disruption_id, asset_id, delay_reduction_hours, expected_delay_reduction, risk_reduction_percent, expected_risk_reduction, financial_saving, expected_cost_impact, recommended_route, recommended_carrier, status)
INSERT INTO recommendations (id, recommendation_id, kind, recommendation_type, subject, level, title, confidence, description, recommendation, explanation, shipment_id, disruption_id, asset_id, delay_reduction_hours, expected_delay_reduction, risk_reduction_percent, expected_risk_reduction, financial_saving, expected_cost_impact, recommended_route, recommended_carrier, status)
VALUES
('REC-a1', 'REC-a1', 'REROUTE', 'REROUTE', 'SHP-1042 (Vaccines, $1.25M)', 'CRITICAL', 'Reroute via Mundra Port + Carrier B', 94, 'SHP-1042 is trapped in the Mumbai Port strike corridor. Rerouting via Mundra Port avoids 72h strike delay and protects temperature-critical vaccine vials.', 'Reroute shipment SHP-1042 through Mundra Port using Carrier B (Certified Cold Chain reefer).', 'Mumbai Port is under indefinite strike with 72h duration. Mundra Port has 210 tons of available cold storage and immediate berth slots.', 'SHP-1042', 'DIS-01', 'TRK-204', 28, 28, 64, 64, '$800K', '$800K', 'Mumbai -> Mundra -> Frankfurt', 'Carrier B', 'PENDING'),
('REC-a2', 'REC-a2', 'DIVERT', 'DIVERT', 'CTN-8801 (COVID-19 Vaccine Vials)', 'CRITICAL', 'Emergency Diversion to Pune Pharma Cold Hub', 97, 'CTN-8801 telemetry indicates temperature of 10.3°C (+5.3°C above 8°C limit) persisting for 45 minutes.', 'Execute immediate diversion to Pune Pharma Cold Hub (HUB-PUNE-01, 74 km away).', 'SOP limit exceeded. Excursion risk model indicates 87.4% probability of irreversible thermal spoilage if uncorrected within 30 minutes.', 'SHP-1042', NULL, 'TRK-204', 4, 4, 90, 90, '$1.25M', '$1.25M', 'Mumbai -> Pune Pharma Cold Hub', 'Carrier B', 'PENDING'),
('REC-a3', 'REC-a3', 'REDEPLOY', 'REDEPLOY', 'TRK-204 (Idle in Mumbai, 14h)', 'HIGH', 'Redeploy TRK-204 to Mundra Feeder Run', 91, 'TRK-204 has been idle for 14 hours at Mumbai. Redeploying to Mundra corridor increases fleet utilisation from 18.5% to 54.2%.', 'Assign TRK-204 to Mundra export feeder for urgent pharmaceutical transport.', 'Fleet asset TRK-204 has active reefer certification and is located within 12 km of current staging area.', 'SHP-1042', NULL, 'TRK-204', 18, 18, 45, 45, '$340K', '$340K', 'Mumbai JNPT -> Mundra Port', 'Carrier B', 'PENDING'),
('REC-a4', 'REC-a4', 'ESCALATE', 'ESCALATE', 'SHP-1051 (Chennai Port, $740K)', 'HIGH', 'Expedite Departure before Cyclone Landfall', 88, 'Cyclone storm warning approaching Bay of Bengal. Expediting departure avoids 48h maritime suspension.', 'Advance vessel departure by 6 hours with prioritized customs clearance.', 'Port authorities project port closure within 14 hours. Expediting avoids container demurrage and risk escalation.', 'SHP-1051', 'DIS-02', 'VSL-003', 24, 24, 52, 52, '$280K', '$280K', 'Chennai -> Singapore (Direct Expedited)', 'Carrier C', 'PENDING')
ON CONFLICT (id) DO NOTHING;

-- 10. Simulation Runs (12 columns: disruption_id, disruption_type, duration_hours, severity, before_delay, after_delay, delay_reduction, exposure_before, exposure_after, critical_shipments_protected, confidence, comparison_data)
INSERT INTO simulation_runs (disruption_id, disruption_type, duration_hours, severity, before_delay, after_delay, delay_reduction, exposure_before, exposure_after, critical_shipments_protected, confidence, comparison_data)
VALUES
('DIS-01', 'PORT_STRIKE', 72, 'CRITICAL', 72, 44, 28, '$1.25M', '$450K', 3, 94, '{"carrier_a_delay": 58, "carrier_b_delay": 44, "cost_delta": "+8.2%", "risk_delta": "-64%"}'::jsonb);

-- -----------------------------------------------------------------------------
-- FINISHED!
-- -----------------------------------------------------------------------------
