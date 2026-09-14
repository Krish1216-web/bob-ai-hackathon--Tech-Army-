-- =============================================================================
-- ChainGuard AI — Complete Supabase PostgreSQL Production Schema
-- IBM BoB AI Innovation Hackathon 2026
-- =============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. Table: disruptions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS disruptions (
    id VARCHAR(64) PRIMARY KEY,
    disruption_id VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    disruption_type VARCHAR(100) NOT NULL,
    type VARCHAR(100),
    location VARCHAR(255) NOT NULL,
    severity VARCHAR(50) DEFAULT 'HIGH', -- CRITICAL, HIGH, MEDIUM, LOW
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, MONITORING, RESOLVED
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
-- 2. Table: fleet_assets
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fleet_assets (
    id VARCHAR(64) PRIMARY KEY,
    asset_id VARCHAR(64) UNIQUE NOT NULL,
    asset_type VARCHAR(50) NOT NULL, -- TRUCK, CONTAINER, VESSEL
    identifier VARCHAR(100) NOT NULL,
    registration VARCHAR(100),
    location VARCHAR(255) NOT NULL,
    current_location VARCHAR(255),
    latitude DOUBLE PRECISION DEFAULT 18.95,
    longitude DOUBLE PRECISION DEFAULT 72.82,
    capacity_tons DOUBLE PRECISION DEFAULT 20.0,
    capacity DOUBLE PRECISION DEFAULT 20.0,
    status VARCHAR(50) DEFAULT 'IDLE', -- IDLE, ASSIGNED, ACTIVE, MAINTENANCE, IN_TRANSIT
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
-- 3. Table: containers
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS containers (
    id VARCHAR(64) PRIMARY KEY,
    container_id VARCHAR(64) UNIQUE NOT NULL,
    shipment_id VARCHAR(64),
    container_type VARCHAR(50) DEFAULT 'REEFER_40FT',
    product_type VARCHAR(100) DEFAULT 'mRNA Vaccines',
    status VARCHAR(50) DEFAULT 'NORMAL', -- NORMAL, MEDIUM, CRITICAL, INVESTIGATING, RESOLVED
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
-- 4. Table: shipments
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shipments (
    id VARCHAR(64) PRIMARY KEY,
    shipment_id VARCHAR(64) UNIQUE NOT NULL,
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
    disruption_id VARCHAR(64) REFERENCES disruptions(disruption_id) ON DELETE SET NULL,
    carrier VARCHAR(100) DEFAULT 'Carrier B',
    asset VARCHAR(64) DEFAULT 'TRK-204',
    asset_id VARCHAR(64) REFERENCES fleet_assets(asset_id) ON DELETE SET NULL,
    container_id VARCHAR(64) REFERENCES containers(container_id) ON DELETE SET NULL,
    action VARCHAR(100) DEFAULT 'Reroute',
    status VARCHAR(50) DEFAULT 'AT_RISK', -- AT_RISK, REROUTED, DELAYED, ON_TRACK
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
-- 5. Table: sensor_readings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sensor_readings (
    id SERIAL PRIMARY KEY,
    shipment_id VARCHAR(64) REFERENCES shipments(shipment_id) ON DELETE CASCADE,
    container_id VARCHAR(64) REFERENCES containers(container_id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    time_label VARCHAR(50) DEFAULT '14:00',
    temperature_c DOUBLE PRECISION NOT NULL,
    temperature DOUBLE PRECISION,
    humidity_pct DOUBLE PRECISION DEFAULT 65.0,
    humidity DOUBLE PRECISION DEFAULT 65.0,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_anomaly BOOLEAN DEFAULT FALSE,
    anomaly_layer VARCHAR(50), -- L1_BOUNDS, L2_RATE, L3_ZSCORE, L4_STUCK, NONE
    is_excursion BOOLEAN DEFAULT FALSE,
    excursion_duration_mins INTEGER DEFAULT 0,
    peak_temperature_c DOUBLE PRECISION,
    severity VARCHAR(50) DEFAULT 'NORMAL', -- NORMAL, MEDIUM, HIGH, CRITICAL
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, INVESTIGATING, RESOLVED
    sensor_status VARCHAR(50) DEFAULT 'OPERATIONAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_container ON sensor_readings(container_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_shipment ON sensor_readings(shipment_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON sensor_readings(timestamp);

-- -----------------------------------------------------------------------------
-- 6. Table: cold_chain_alerts
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cold_chain_alerts (
    id VARCHAR(64) PRIMARY KEY,
    alert_id VARCHAR(64) UNIQUE NOT NULL,
    container_id VARCHAR(64) REFERENCES containers(container_id) ON DELETE CASCADE,
    shipment_id VARCHAR(64) REFERENCES shipments(shipment_id) ON DELETE CASCADE,
    severity VARCHAR(50) DEFAULT 'CRITICAL',
    alert_type VARCHAR(100) DEFAULT 'EXCURSION_TEMPERATURE_SPIKE',
    temperature DOUBLE PRECISION DEFAULT 10.3,
    peak_temperature DOUBLE PRECISION DEFAULT 11.2,
    duration_minutes INTEGER DEFAULT 45,
    configured_range VARCHAR(50) DEFAULT '2°C - 8°C',
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, ACKNOWLEDGED, RESOLVED
    recommended_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_cold_chain_alerts_status ON cold_chain_alerts(status);
CREATE INDEX IF NOT EXISTS idx_cold_chain_alerts_container ON cold_chain_alerts(container_id);

-- -----------------------------------------------------------------------------
-- 7. Table: cold_storage_hubs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cold_storage_hubs (
    id VARCHAR(64) PRIMARY KEY,
    hub_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    capacity DOUBLE PRECISION DEFAULT 500.0,
    capacity_tons DOUBLE PRECISION DEFAULT 500.0,
    available_capacity DOUBLE PRECISION DEFAULT 180.0,
    available_tons DOUBLE PRECISION DEFAULT 180.0,
    occupied_pct DOUBLE PRECISION DEFAULT 64.0,
    certified BOOLEAN DEFAULT TRUE,
    supported_temperature_profiles TEXT[] DEFAULT ARRAY['ultra_cold', 'chilled', 'frozen'],
    temp_zones TEXT[] DEFAULT ARRAY['ultra_cold', 'chilled', 'frozen'],
    status VARCHAR(50) DEFAULT 'OPERATIONAL',
    contact VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cold_storage_hubs_status ON cold_storage_hubs(status);

-- -----------------------------------------------------------------------------
-- 8. Table: recommendations
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recommendations (
    id VARCHAR(64) PRIMARY KEY,
    recommendation_id VARCHAR(64) UNIQUE NOT NULL,
    kind VARCHAR(50) NOT NULL, -- REROUTE, REDEPLOY, ESCALATE, DIVERT
    recommendation_type VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    level VARCHAR(50) DEFAULT 'CRITICAL',
    title VARCHAR(255) NOT NULL,
    confidence INTEGER DEFAULT 94,
    description TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    explanation TEXT,
    why_reasons TEXT,
    shipment_id VARCHAR(64) REFERENCES shipments(shipment_id) ON DELETE CASCADE,
    disruption_id VARCHAR(64) REFERENCES disruptions(disruption_id) ON DELETE SET NULL,
    asset_id VARCHAR(64) REFERENCES fleet_assets(asset_id) ON DELETE SET NULL,
    delay_reduction_hours INTEGER DEFAULT 28,
    expected_delay_reduction INTEGER DEFAULT 28,
    risk_reduction_percent INTEGER DEFAULT 64,
    expected_risk_reduction INTEGER DEFAULT 64,
    financial_saving VARCHAR(50) DEFAULT '$800K',
    expected_cost_impact VARCHAR(50) DEFAULT '$800K',
    recommended_route VARCHAR(255),
    recommended_carrier VARCHAR(100),
    recommended_asset VARCHAR(64),
    actioned BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, ACCEPTED, REJECTED, EXECUTED
    action_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    executed_at TIMESTAMP WITH TIME ZONE,
    actioned_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_shipment ON recommendations(shipment_id);

-- -----------------------------------------------------------------------------
-- 9. Table: recommendation_actions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recommendation_actions (
    id SERIAL PRIMARY KEY,
    recommendation_id VARCHAR(64) REFERENCES recommendations(recommendation_id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- ACCEPT, REJECT, OVERRIDE
    previous_state JSONB,
    new_state JSONB,
    executed_by VARCHAR(100) DEFAULT 'DISPATCHER',
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recommendation_actions_rec ON recommendation_actions(recommendation_id);

-- -----------------------------------------------------------------------------
-- 10. Table: simulation_runs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS simulation_runs (
    id SERIAL PRIMARY KEY,
    disruption_id VARCHAR(64) REFERENCES disruptions(disruption_id) ON DELETE CASCADE,
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
ALTER TABLE recommendation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_runs ENABLE ROW LEVEL SECURITY;

-- Allow public / anon read access for hackathon client demonstration
CREATE POLICY "Allow public read shipments" ON shipments FOR SELECT USING (true);
CREATE POLICY "Allow public read disruptions" ON disruptions FOR SELECT USING (true);
CREATE POLICY "Allow public read fleet_assets" ON fleet_assets FOR SELECT USING (true);
CREATE POLICY "Allow public read containers" ON containers FOR SELECT USING (true);
CREATE POLICY "Allow public read sensor_readings" ON sensor_readings FOR SELECT USING (true);
CREATE POLICY "Allow public read cold_chain_alerts" ON cold_chain_alerts FOR SELECT USING (true);
CREATE POLICY "Allow public read cold_storage_hubs" ON cold_storage_hubs FOR SELECT USING (true);
CREATE POLICY "Allow public read recommendations" ON recommendations FOR SELECT USING (true);
CREATE POLICY "Allow public read simulation_runs" ON simulation_runs FOR SELECT USING (true);

-- Allow service_role full control for backend services
CREATE POLICY "Allow service_role full access shipments" ON shipments FOR ALL USING (true);
CREATE POLICY "Allow service_role full access disruptions" ON disruptions FOR ALL USING (true);
CREATE POLICY "Allow service_role full access fleet_assets" ON fleet_assets FOR ALL USING (true);
CREATE POLICY "Allow service_role full access containers" ON containers FOR ALL USING (true);
CREATE POLICY "Allow service_role full access sensor_readings" ON sensor_readings FOR ALL USING (true);
CREATE POLICY "Allow service_role full access cold_chain_alerts" ON cold_chain_alerts FOR ALL USING (true);
CREATE POLICY "Allow service_role full access cold_storage_hubs" ON cold_storage_hubs FOR ALL USING (true);
CREATE POLICY "Allow service_role full access recommendations" ON recommendations FOR ALL USING (true);
CREATE POLICY "Allow service_role full access recommendation_actions" ON recommendation_actions FOR ALL USING (true);
CREATE POLICY "Allow service_role full access simulation_runs" ON simulation_runs FOR ALL USING (true);
