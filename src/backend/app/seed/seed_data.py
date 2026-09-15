from sqlalchemy.orm import Session
from app.models.shipment import Shipment
from app.models.disruption import Disruption
from app.models.fleet_asset import FleetAsset
from app.models.container import Container
from app.models.sensor_reading import SensorReading
from app.models.cold_chain_alert import ColdChainAlert
from app.models.cold_storage_hub import ColdStorageHub
from app.models.recommendation import Recommendation
from app.models.product_profile import ProductProfile
from app.models.carrier import Carrier
from datetime import datetime, timedelta

def seed_database(db: Session):
    # Check if already seeded
    if db.query(Shipment).count() > 0:
        return

    # 1. Product Profiles
    profiles = [
        ProductProfile(id="VACCINES_SOP", name="Vaccines (WHO/SOP Profile)", min_temp_c=2.0, max_temp_c=8.0, max_excursion_mins=30, critical_temp_c=10.0, description="Configured Product/SOP Range 2–8°C"),
        ProductProfile(id="PHARMA_SOP", name="General Pharmaceuticals", min_temp_c=2.0, max_temp_c=8.0, max_excursion_mins=60, critical_temp_c=12.0, description="Configured Product/SOP Range 2–8°C"),
        ProductProfile(id="BIOLOGICS_SOP", name="Biologics", min_temp_c=2.0, max_temp_c=8.0, max_excursion_mins=45, critical_temp_c=10.5, description="Configured Product/SOP Range 2–8°C"),
    ]
    db.add_all(profiles)

    # 2. Carriers
    carriers = [
        Carrier(id="CAR-A", name="Carrier A", transport_mode="ROAD", reliability_score=0.88, cost_index=1.0, available_capacity_teu=40, cold_chain_certified=True),
        Carrier(id="CAR-B", name="Carrier B", transport_mode="ROAD_SEA", reliability_score=0.94, cost_index=1.1, available_capacity_teu=65, cold_chain_certified=True),
        Carrier(id="CAR-C", name="Carrier C", transport_mode="SEA", reliability_score=0.82, cost_index=0.9, available_capacity_teu=80, cold_chain_certified=False),
        Carrier(id="CAR-D", name="Carrier D", transport_mode="AIR_SEA", reliability_score=0.91, cost_index=1.2, available_capacity_teu=30, cold_chain_certified=True),
    ]
    db.add_all(carriers)

    # 3. Disruptions
    disruptions_data = [
        Disruption(
            id="DIS-01",
            title="Mumbai Port Strike",
            disruption_type="PORT_STRIKE",
            severity="CRITICAL",
            location="Mumbai, India — Jawaharlal Nehru Port",
            affected_corridor="West Coast Sea Corridor",
            duration_hours=72,
            status="ACTIVE",
            description="Dock workers at JNPT have initiated an indefinite strike over wage disputes. Container operations halted.",
            delay_estimate_hours=72.0
        ),
        Disruption(
            id="DIS-02",
            title="Chennai Cyclone Warning",
            disruption_type="WEATHER",
            severity="HIGH",
            location="Chennai, India — Bay of Bengal corridor",
            affected_corridor="East Coast Marine Corridor",
            duration_hours=48,
            status="ACTIVE",
            description="Severe cyclonic storm approaching Bay of Bengal. Maritime traffic suspended.",
            delay_estimate_hours=48.0
        ),
        Disruption(
            id="DIS-03",
            title="Delhi Highway Closure",
            disruption_type="ROAD_CLOSURE",
            severity="MEDIUM",
            location="Delhi, India — NH-48 corridor",
            affected_corridor="Northern Freight Corridor",
            duration_hours=24,
            status="ACTIVE",
            description="Bridge inspection and flash flooding on NH-48 causing severe congestion.",
            delay_estimate_hours=24.0
        ),
        Disruption(
            id="DIS-04",
            title="Carrier Capacity Reduction",
            disruption_type="CAPACITY_REDUCTION",
            severity="MEDIUM",
            location="Western India — Carrier network",
            affected_corridor="Western Rail & Feeder",
            duration_hours=36,
            status="ACTIVE",
            description="Shortage of qualified reefer drivers impacting transit capacity across Maharashtra.",
            delay_estimate_hours=36.0
        ),
    ]
    db.add_all(disruptions_data)

    # 4. Fleet Assets
    assets = [
        FleetAsset(id="TRK-204", asset_type="TRUCK", identifier="MH-04-AB-204", location="Mumbai", capacity_tons=24.0, status="IDLE", idle_hours=14.0, utilisation_pct=18.5, is_refrigerated=True, match_score=91, projected_gain="+35.7%"),
        FleetAsset(id="CTN-117", asset_type="CONTAINER", identifier="MSKU-CTN-117", location="Mundra", capacity_tons=28.0, status="IDLE", idle_hours=22.0, utilisation_pct=12.0, is_refrigerated=True, match_score=87, projected_gain="+36.6%"),
        FleetAsset(id="TRK-089", asset_type="TRUCK", identifier="MH-12-CD-089", location="Pune", capacity_tons=20.0, status="IDLE", idle_hours=8.0, utilisation_pct=24.3, is_refrigerated=True, match_score=83, projected_gain="+37.5%"),
        FleetAsset(id="VSL-003", asset_type="VESSEL", identifier="IMO-9912003", location="Chennai", capacity_tons=1200.0, status="IDLE", idle_hours=36.0, utilisation_pct=8.2, is_refrigerated=False, match_score=78, projected_gain="+35.8%"),
        FleetAsset(id="TRK-505", asset_type="TRUCK", identifier="MH-14-EF-505", location="Delhi", capacity_tons=26.0, status="IDLE", idle_hours=18.0, utilisation_pct=15.0, is_refrigerated=True, match_score=94, projected_gain="+38.2%"),
        FleetAsset(id="CTN-402", asset_type="CONTAINER", identifier="CTN-402-REEFER", location="Ahmedabad", capacity_tons=24.0, status="IDLE", idle_hours=24.0, utilisation_pct=14.5, is_refrigerated=True, match_score=89, projected_gain="+34.1%"),
        FleetAsset(id="TRK-318", asset_type="TRUCK", identifier="KA-01-GH-318", location="Bengaluru", capacity_tons=22.0, status="IDLE", idle_hours=10.0, utilisation_pct=22.1, is_refrigerated=True, match_score=92, projected_gain="+36.4%"),
        FleetAsset(id="CTN-8801", asset_type="CONTAINER", identifier="CTN-8801-REEFER", location="Mumbai Port", capacity_tons=22.0, status="ACTIVE", idle_hours=0.0, utilisation_pct=88.0, is_refrigerated=True, assigned_shipment_id="SHP-1042"),
        FleetAsset(id="CTN-8824", asset_type="CONTAINER", identifier="CTN-8824-REEFER", location="Chennai", capacity_tons=22.0, status="ACTIVE", idle_hours=0.0, utilisation_pct=79.0, is_refrigerated=True, assigned_shipment_id="SHP-1051"),
        FleetAsset(id="CTN-8831", asset_type="CONTAINER", identifier="CTN-8831-REEFER", location="Mundra", capacity_tons=22.0, status="ACTIVE", idle_hours=0.0, utilisation_pct=82.0, is_refrigerated=True, assigned_shipment_id="SHP-1082"),
    ]
    db.add_all(assets)

    # 5. Containers
    containers_data = [
        Container(id="CTN-8801", container_id="CTN-8801", shipment_id="SHP-1042", container_type="REEFER_40FT", product_type="mRNA Vaccines", status="CRITICAL", current_temperature=10.3, peak_temperature=11.2, target_min_temperature=2.0, target_max_temperature=8.0, required_range="2°C - 8°C", latitude=18.95, longitude=72.82, current_location="Mumbai Port", asset_id="TRK-204", is_anomaly=True, anomaly_layer="L2_RATE_OF_CHANGE", spoilage_risk_pct=94.0),
        Container(id="CTN-8824", container_id="CTN-8824", shipment_id="SHP-1051", container_type="REEFER_40FT", product_type="Pharmaceuticals", status="NORMAL", current_temperature=5.2, peak_temperature=5.6, target_min_temperature=2.0, target_max_temperature=8.0, required_range="2°C - 8°C", latitude=13.08, longitude=80.27, current_location="Chennai Port", asset_id="TRK-109", is_anomaly=False, anomaly_layer="NONE", spoilage_risk_pct=5.0),
        Container(id="CTN-8831", container_id="CTN-8831", shipment_id="SHP-1082", container_type="REEFER_40FT", product_type="Biologics", status="MEDIUM", current_temperature=7.1, peak_temperature=7.4, target_min_temperature=2.0, target_max_temperature=8.0, required_range="2°C - 8°C", latitude=22.84, longitude=69.71, current_location="Mundra Port", asset_id="TRK-302", is_anomaly=False, anomaly_layer="NONE", spoilage_risk_pct=35.0),
    ]
    db.add_all(containers_data)

    # 6. Cold Storage Hubs
    hubs_data = [
        ColdStorageHub(id="HUB-MUMBAI-01", hub_id="HUB-MUMBAI-01", name="Navi Mumbai Central Cold Logistics Hub", location="Navi Mumbai (JNPT Area)", latitude=18.98, longitude=73.02, capacity=500.0, capacity_tons=500.0, available_capacity=180.0, available_tons=180.0, occupied_pct=64.0, certified=True, temp_zones=["ultra_cold", "chilled", "frozen"], status="OPERATIONAL", contact="+91 22 2724 0001"),
        ColdStorageHub(id="HUB-MUNDRA-01", hub_id="HUB-MUNDRA-01", name="Mundra Port Cold Terminal", location="Mundra Special Economic Zone", latitude=22.84, longitude=69.71, capacity=850.0, capacity_tons=850.0, available_capacity=420.0, available_tons=420.0, occupied_pct=50.6, certified=True, temp_zones=["ultra_cold", "chilled", "frozen", "ambient"], status="OPERATIONAL", contact="+91 2838 255 100"),
        ColdStorageHub(id="HUB-AHMEDABAD-01", hub_id="HUB-AHMEDABAD-01", name="Ahmedabad Pharma Cold Hub", location="Sanand Industrial Hub", latitude=23.02, longitude=72.57, capacity=350.0, capacity_tons=350.0, available_capacity=110.0, available_tons=110.0, occupied_pct=68.6, certified=True, temp_zones=["ultra_cold", "chilled"], status="OPERATIONAL", contact="+91 79 2656 4000"),
        ColdStorageHub(id="HUB-CHENNAI-01", hub_id="HUB-CHENNAI-01", name="Chennai Port Cold Storage Hub", location="Ennore Port Logistics Zone", latitude=13.08, longitude=80.27, capacity=400.0, capacity_tons=400.0, available_capacity=95.0, available_tons=95.0, occupied_pct=76.2, certified=True, temp_zones=["chilled", "frozen"], status="OPERATIONAL", contact="+91 44 2522 1000"),
    ]
    db.add_all(hubs_data)

    # 7. Shipments
    shipments_data = [
        Shipment(id='SHP-1042', route='Mumbai → Frankfurt', origin='Mumbai', destination='Frankfurt', cargo='Vaccines', value='$1.25M', value_usd=1250000.0, eta='Sep 16', risk=92, disruption='Mumbai Port Strike', carrier='Carrier B', asset='TRK-204', action='Reroute', status='AT_RISK', priority='CRITICAL', is_cold_chain=True, product_profile_id='VACCINES_SOP'),
        Shipment(id='SHP-1067', route='Mumbai → Dubai', origin='Mumbai', destination='Dubai', cargo='Automotive Parts', value='$380K', value_usd=380000.0, eta='Sep 15', risk=88, disruption='Mumbai Port Strike', carrier='Carrier B', asset='TRK-312', action='Reroute', status='AT_RISK', priority='HIGH', is_cold_chain=False),
        Shipment(id='SHP-1051', route='Chennai → Singapore', origin='Chennai', destination='Singapore', cargo='Pharmaceuticals', value='$740K', value_usd=740000.0, eta='Sep 19', risk=84, disruption='Chennai Cyclone Warning', carrier='Carrier D', asset='TRK-088', action='Reroute', status='AT_RISK', priority='HIGH', is_cold_chain=True, product_profile_id='PHARMA_SOP'),
        Shipment(id='SHP-1063', route='Delhi → Frankfurt', origin='Delhi', destination='Frankfurt', cargo='Electronics', value='$510K', value_usd=510000.0, eta='Sep 20', risk=81, disruption='Delhi Highway Closure', carrier='Carrier A', asset='TRK-201', action='Reroute', status='AT_RISK', priority='HIGH', is_cold_chain=False),
        Shipment(id='SHP-1043', route='Pune → Dubai', origin='Pune', destination='Dubai', cargo='Electronics', value='$680K', value_usd=680000.0, eta='Sep 17', risk=78, disruption='Carrier Capacity Reduction', carrier='Carrier A', asset='TRK-109', action='Monitor', status='DELAYED', priority='MEDIUM', is_cold_chain=False),
        Shipment(id='SHP-1082', route='Mumbai → Singapore', origin='Mumbai', destination='Singapore', cargo='Food Products', value='$295K', value_usd=295000.0, eta='Sep 17', risk=76, disruption='Mumbai Port Strike', carrier='Carrier D', asset='TRK-290', action='Monitor', status='DELAYED', priority='MEDIUM', is_cold_chain=True, product_profile_id='BIOLOGICS_SOP'),
        Shipment(id='SHP-1075', route='Ahmedabad → Dubai', origin='Ahmedabad', destination='Dubai', cargo='Chemicals', value='$560K', value_usd=560000.0, eta='Sep 16', risk=67, disruption='Carrier Capacity Reduction', carrier='Carrier A', asset='TRK-178', action='Monitor', status='DELAYED', priority='MEDIUM', is_cold_chain=False),
        Shipment(id='SHP-1091', route='Chennai → Frankfurt', origin='Chennai', destination='Frankfurt', cargo='Medical Devices', value='$1.08M', value_usd=1080000.0, eta='Sep 21', risk=55, disruption='Chennai Cyclone Warning', carrier='Carrier B', asset='TRK-367', action='Monitor', status='ON_TRACK', priority='NORMAL', is_cold_chain=False),
        Shipment(id='SHP-1104', route='Mundra → Rotterdam', origin='Mundra', destination='Rotterdam', cargo='Industrial Equipment', value='$430K', value_usd=430000.0, eta='Sep 23', risk=48, disruption='Carrier Capacity Reduction', carrier='Carrier C', asset='VSL-003', action='Monitor', status='ON_TRACK', priority='NORMAL', is_cold_chain=False),
        Shipment(id='SHP-1112', route='Bengaluru → Dubai', origin='Bengaluru', destination='Dubai', cargo='Semiconductors', value='$890K', value_usd=890000.0, eta='Sep 18', risk=36, disruption='None', carrier='Carrier A', asset='TRK-221', action='Monitor', status='ON_TRACK', priority='NORMAL', is_cold_chain=False),
        Shipment(id='SHP-1121', route='Mumbai → Singapore', origin='Mumbai', destination='Singapore', cargo='Textiles', value='$210K', value_usd=210000.0, eta='Sep 22', risk=24, disruption='None', carrier='Carrier D', asset='TRK-284', action='Monitor', status='ON_TRACK', priority='NORMAL', is_cold_chain=False),
        Shipment(id='SHP-1130', route='Delhi → Dubai', origin='Delhi', destination='Dubai', cargo='Consumer Goods', value='$185K', value_usd=185000.0, eta='Sep 20', risk=18, disruption='None', carrier='Carrier B', asset='TRK-304', action='Monitor', status='ON_TRACK', priority='NORMAL', is_cold_chain=False),
    ]
    db.add_all(shipments_data)

    # 8. Sensor Readings for Cold Chain
    now = datetime.utcnow()
    readings = [
        SensorReading(shipment_id='SHP-1042', container_id='CTN-8801', timestamp=now - timedelta(hours=8), time_label='06:00', temperature_c=5.8, is_excursion=False, severity='NORMAL'),
        SensorReading(shipment_id='SHP-1042', container_id='CTN-8801', timestamp=now - timedelta(hours=6), time_label='08:00', temperature_c=6.1, is_excursion=False, severity='NORMAL'),
        SensorReading(shipment_id='SHP-1042', container_id='CTN-8801', timestamp=now - timedelta(hours=4), time_label='10:00', temperature_c=6.5, is_excursion=False, severity='NORMAL'),
        SensorReading(shipment_id='SHP-1042', container_id='CTN-8801', timestamp=now - timedelta(hours=2), time_label='12:00', temperature_c=8.2, is_excursion=True, severity='MEDIUM'),
        SensorReading(shipment_id='SHP-1042', container_id='CTN-8801', timestamp=now, time_label='14:00', temperature_c=10.3, is_excursion=True, excursion_duration_mins=45, peak_temperature_c=11.2, severity='CRITICAL'),
        # CTN-8824 (Pharmaceuticals)
        SensorReading(shipment_id='SHP-1051', container_id='CTN-8824', timestamp=now - timedelta(hours=4), time_label='10:00', temperature_c=5.0, is_excursion=False, severity='NORMAL'),
        SensorReading(shipment_id='SHP-1051', container_id='CTN-8824', timestamp=now, time_label='14:00', temperature_c=5.2, is_excursion=False, severity='NORMAL'),
        # CTN-8831 (Biologics)
        SensorReading(shipment_id='SHP-1082', container_id='CTN-8831', timestamp=now - timedelta(hours=4), time_label='10:00', temperature_c=6.8, is_excursion=False, severity='NORMAL'),
        SensorReading(shipment_id='SHP-1082', container_id='CTN-8831', timestamp=now, time_label='14:00', temperature_c=7.1, is_excursion=False, severity='MEDIUM', peak_temperature_c=7.4, excursion_duration_mins=18),
    ]
    db.add_all(readings)

    # 9. Cold Chain Alerts
    alerts = [
        ColdChainAlert(
            id="alert-ctn-8801",
            alert_id="alert-ctn-8801",
            container_id="CTN-8801",
            shipment_id="SHP-1042",
            severity="CRITICAL",
            alert_type="EXCURSION_TEMPERATURE_SPIKE",
            temperature=10.3,
            peak_temperature=11.2,
            duration_minutes=45,
            configured_range="2°C - 8°C",
            status="ACTIVE",
            recommended_action="Inspect reefer compressor unit immediately. If unrecovered within 15 minutes, divert to Navi Mumbai Central Cold Logistics Hub (14.2 km)."
        ),
        ColdChainAlert(
            id="alert-ctn-8831",
            alert_id="alert-ctn-8831",
            container_id="CTN-8831",
            shipment_id="SHP-1082",
            severity="MEDIUM",
            alert_type="TEMPERATURE_APPROACHING_LIMIT",
            temperature=7.1,
            peak_temperature=7.4,
            duration_minutes=18,
            configured_range="2°C - 8°C",
            status="ACTIVE",
            recommended_action="Approaching upper threshold. Adjust compressor setpoint to 4.0°C and monitor telemetry stream."
        )
    ]
    db.add_all(alerts)

    # 10. Recommendations
    recs = [
        Recommendation(
            id='a1',
            kind='REROUTE',
            subject='SHP-1042',
            level='CRITICAL',
            title='Reroute Shipment — SHP-1042',
            confidence=94,
            description='SHP-1042 (Vaccines, $1.25M) is currently routed through Mumbai Port, which is under an active strike with 72h expected duration. Risk score has escalated to 92/100.',
            recommendation='Reroute via Mundra Port and assign Carrier B with cold-chain capability.',
            why_reasons="1. Mumbai Port Strike introduces +72h delay and risk of reefer power loss.\n2. Mundra Port has 420T available reefer plug capacity.\n3. Avoids $1.25M spoilage loss and saves 28 hours.",
            shipment_id='SHP-1042',
            asset_id='TRK-204',
            delay_reduction_hours=28,
            risk_reduction_percent=64,
            financial_saving='$800K'
        ),
        Recommendation(
            id='a2',
            kind='REROUTE',
            subject='SHP-1051',
            level='HIGH',
            title='Reroute Shipment — SHP-1051',
            confidence=89,
            description='SHP-1051 (Pharmaceuticals, $740K) faces coastal weather disruptions along the Chennai corridor.',
            recommendation='Divert overland via Bengaluru inland freight terminal and assign Carrier B.',
            why_reasons="1. Cyclone warning threatens marine feeder routes from Chennai.\n2. Inland road transit via Bengaluru maintains safe delivery window.",
            shipment_id='SHP-1051',
            asset_id='TRK-089',
            delay_reduction_hours=18,
            risk_reduction_percent=52,
            financial_saving='$340K'
        ),
        Recommendation(
            id='a3',
            kind='REDEPLOY',
            subject='TRK-204',
            level='CRITICAL',
            title='Redeploy Asset — TRK-204',
            confidence=91,
            description='Refrigerated asset TRK-204 is currently IDLE in Mumbai (14h) while high-priority cold-chain shipment SHP-1042 requires immediate overland rerouting.',
            recommendation='Assign TRK-204 to SHP-1042 for expedited transfer to Mundra Port.',
            why_reasons="1. TRK-204 is pre-chilled with certified reefer compressor.\n2. Utilisation increases from 18.5% to 54.2% (+35.7% gain).",
            shipment_id='SHP-1042',
            asset_id='TRK-204',
            delay_reduction_hours=24,
            risk_reduction_percent=58,
            financial_saving='$450K'
        ),
        Recommendation(
            id='a4',
            kind='ESCALATE',
            subject='SHP-1067',
            level='HIGH',
            title='Expedite Carrier — SHP-1067',
            confidence=86,
            description='Automotive components on SHP-1067 risk missing assembly schedule in Dubai due to port congestion.',
            recommendation='Upgrade to Direct Express Air Freight via Carrier D.',
            why_reasons="1. Assembly plant downtime penalty exceeds air freight surcharge.\n2. Guarantees on-time delivery by Sep 15.",
            shipment_id='SHP-1067',
            asset_id='TRK-312',
            delay_reduction_hours=32,
            risk_reduction_percent=60,
            financial_saving='$210K'
        ),
        Recommendation(
            id='a5',
            kind='REROUTE',
            subject='SHP-1091',
            level='HIGH',
            title='Reroute Shipment — SHP-1091',
            confidence=92,
            description='SHP-1091 (Medical Devices, $1.08M) faces storm delays on Chennai corridor.',
            recommendation='Divert via Hyderabad Cargo Terminal and assign Carrier D.',
            why_reasons="1. Cyclone warning active along East Coast corridor.\n2. Overland routing via Hyderabad avoids marine disruption.\n3. Protects $1.08M in high-value medical devices.",
            shipment_id='SHP-1091',
            asset_id='TRK-367',
            delay_reduction_hours=20,
            risk_reduction_percent=55,
            financial_saving='$420K'
        ),
        Recommendation(
            id='a6',
            kind='THERMAL',
            subject='CTN-9902',
            level='CRITICAL',
            title='Thermal Excursion — CTN-9902',
            confidence=96,
            description='Container CTN-9902 temperature sensor stream breached upper SOP threshold (+11.8°C vs 2-8°C target). Spoilage risk at 94.2%.',
            recommendation='Divert immediately to Pune Pharma Cold Hub (74 km) and ramp reefer compressor power.',
            why_reasons="1. Sensor stream breached 8.0°C upper SOP limit.\n2. Pune Cold Hub verified at 74 km proximity with 140T available capacity.\n3. Prevents $950K cargo loss.",
            shipment_id='SHP-1042',
            asset_id='CTN-9902',
            delay_reduction_hours=14,
            risk_reduction_percent=72,
            financial_saving='$950K'
        ),
        Recommendation(
            id='a7',
            kind='REDEPLOY',
            subject='TRK-505',
            level='HIGH',
            title='Redeploy Asset — TRK-505',
            confidence=94,
            description='Refrigerated truck TRK-505 is currently IDLE in Delhi (18h). Assign to urgent Northern corridor consignment.',
            recommendation='Assign TRK-505 to SHP-1063 for expedited transit.',
            why_reasons="1. TRK-505 is idle in Delhi Terminal.\n2. Utilisation increases from 15.0% to 53.2% (+38.2% gain).",
            shipment_id='SHP-1063',
            asset_id='TRK-505',
            delay_reduction_hours=16,
            risk_reduction_percent=50,
            financial_saving='$310K'
        )
    ]
    db.add_all(recs)

    db.commit()
    print("Database seeded with rich scenario data successfully across all 10 schema tables!")
