export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL';

export type Shipment = {
  id: string;
  route: string;
  cargo: string;
  value: string;
  eta: string;
  risk: number;
  disruption: string;
  carrier: string;
  asset: string;
  action: 'Reroute' | 'Monitor';
};

export type AIAction = {
  id: string;
  kind: 'REROUTE' | 'REDEPLOY' | 'ESCALATE';
  subject: string;
  level: Severity;
  title: string;
  confidence: number;
  description: string;
  recommendation: string;
};

export const shipments: Shipment[] = [
  { id: 'SHP-1042', route: 'Mumbai → Frankfurt', cargo: 'Vaccines', value: '$1.25M', eta: 'Sep 16', risk: 92, disruption: 'Mumbai Port Strike', carrier: 'Carrier B', asset: 'TRK-204', action: 'Reroute' },
  { id: 'SHP-1067', route: 'Mumbai → Dubai', cargo: 'Automotive Parts', value: '$380K', eta: 'Sep 15', risk: 88, disruption: 'Mumbai Port Strike', carrier: 'Carrier B', asset: 'TRK-312', action: 'Reroute' },
  { id: 'SHP-1051', route: 'Chennai → Singapore', cargo: 'Pharmaceuticals', value: '$740K', eta: 'Sep 19', risk: 84, disruption: 'Chennai Cyclone Warning', carrier: 'Carrier D', asset: 'TRK-088', action: 'Reroute' },
  { id: 'SHP-1063', route: 'Delhi → Frankfurt', cargo: 'Electronics', value: '$510K', eta: 'Sep 20', risk: 81, disruption: 'Delhi Highway Closure', carrier: 'Carrier A', asset: 'TRK-201', action: 'Reroute' },
  { id: 'SHP-1043', route: 'Pune → Dubai', cargo: 'Electronics', value: '$680K', eta: 'Sep 17', risk: 78, disruption: 'Carrier Capacity Reduction', carrier: 'Carrier A', asset: 'TRK-109', action: 'Monitor' },
  { id: 'SHP-1082', route: 'Mumbai → Singapore', cargo: 'Food Products', value: '$295K', eta: 'Sep 17', risk: 76, disruption: 'Mumbai Port Strike', carrier: 'Carrier D', asset: 'TRK-290', action: 'Monitor' },
  { id: 'SHP-1075', route: 'Ahmedabad → Dubai', cargo: 'Chemicals', value: '$560K', eta: 'Sep 16', risk: 67, disruption: 'Carrier Capacity Reduction', carrier: 'Carrier A', asset: 'TRK-178', action: 'Monitor' },
  { id: 'SHP-1091', route: 'Chennai → Frankfurt', cargo: 'Medical Devices', value: '$1.08M', eta: 'Sep 21', risk: 55, disruption: 'Chennai Cyclone Warning', carrier: 'Carrier B', asset: 'TRK-367', action: 'Monitor' },
  { id: 'SHP-1104', route: 'Mundra → Rotterdam', cargo: 'Industrial Equipment', value: '$430K', eta: 'Sep 23', risk: 48, disruption: 'Carrier Capacity Reduction', carrier: 'Carrier C', asset: 'VSL-003', action: 'Monitor' },
  { id: 'SHP-1112', route: 'Bengaluru → Dubai', cargo: 'Semiconductors', value: '$890K', eta: 'Sep 18', risk: 36, disruption: 'None', carrier: 'Carrier A', asset: 'TRK-221', action: 'Monitor' },
  { id: 'SHP-1121', route: 'Mumbai → Singapore', cargo: 'Textiles', value: '$210K', eta: 'Sep 22', risk: 24, disruption: 'None', carrier: 'Carrier D', asset: 'TRK-284', action: 'Monitor' },
  { id: 'SHP-1130', route: 'Delhi → Dubai', cargo: 'Consumer Goods', value: '$185K', eta: 'Sep 20', risk: 18, disruption: 'None', carrier: 'Carrier B', asset: 'TRK-304', action: 'Monitor' },
];

export const disruptions = [
  { name: 'Mumbai Port Strike', level: 'CRITICAL' as Severity, location: 'Mumbai, India — Jawaharlal Nehru Port', duration: '72h expected', shipments: 8, exposure: '$1.25M', color: 'red' },
  { name: 'Chennai Cyclone Warning', level: 'HIGH' as Severity, location: 'Chennai, India — Bay of Bengal corridor', duration: '48h expected', shipments: 5, exposure: '$870K', color: 'orange' },
  { name: 'Delhi Highway Closure', level: 'MEDIUM' as Severity, location: 'Delhi, India — NH-48 corridor', duration: '24h expected', shipments: 6, exposure: '$540K', color: 'yellow' },
  { name: 'Carrier Capacity Reduction', level: 'MEDIUM' as Severity, location: 'Western India — Carrier network', duration: '36h expected', shipments: 4, exposure: '$620K', color: 'yellow' },
];

export const actions: AIAction[] = [
  { id: 'a1', kind: 'REROUTE', subject: 'SHP-1042', level: 'CRITICAL', title: 'Reroute Shipment — SHP-1042', confidence: 94, description: 'SHP-1042 (Vaccines, $1.25M) is currently routed through Mumbai Port, which is under an active strike with 72h expected duration. Risk score has escalated to 92/100.', recommendation: 'Reroute via Mundra Port and assign Carrier B with cold-chain capability.' },
  { id: 'a2', kind: 'REROUTE', subject: 'SHP-1051', level: 'HIGH', title: 'Reroute Shipment — SHP-1051', confidence: 87, description: 'SHP-1051 (Pharmaceuticals, $740K) is routed through Chennai, which has an active Cyclone Warning. Risk score is 84/100.', recommendation: 'Reroute via Colombo and assign Carrier D alternate vessel.' },
  { id: 'a3', kind: 'REDEPLOY', subject: 'SHP-1042 · TRK-204', level: 'HIGH', title: 'Redeploy Fleet Asset — TRK-204', confidence: 91, description: 'TRK-204 has been idle in Mumbai for 14 hours with 18.5% utilisation. SHP-1042 requires an asset for the Mundra reroute.', recommendation: 'Redeploy TRK-204 to SHP-1042 for the Mundra → Frankfurt leg.' },
  { id: 'a4', kind: 'ESCALATE', subject: 'SHP-1042 · CTN-8801', level: 'CRITICAL', title: 'Cold-Chain Excursion — CTN-8801', confidence: 96, description: 'CTN-8801 has recorded a temperature excursion of 10.3°C (peak 11.2°C) for 45 minutes, exceeding the configured 2–8°C SOP range for Vaccine cargo.', recommendation: 'Inspect reefer unit immediately. Attempt recovery. Prepare cold-storage diversion if recovery fails.' },
];

export const opportunities = [
  { asset: 'TRK-204', location: 'Mumbai', idle: '14h idle', match: 91, from: '18.5%', to: '54.2%', gain: '+35.7%', shipment: 'SHP-1042', route: 'Mumbai → Frankfurt', cargo: 'Vaccines', value: '$42,000' },
  { asset: 'CTN-117', location: 'Mundra', idle: '22h idle', match: 87, from: '12%', to: '48.6%', gain: '+36.6%', shipment: 'SHP-1051', route: 'Mundra → Singapore', cargo: 'Pharmaceuticals', value: '$28,500' },
  { asset: 'TRK-089', location: 'Pune', idle: '8h idle', match: 83, from: '24.3%', to: '61.8%', gain: '+37.5%', shipment: 'SHP-1063', route: 'Pune → Dubai', cargo: 'Electronics', value: '$19,200' },
  { asset: 'VSL-003', location: 'Chennai', idle: '36h idle', match: 78, from: '8.2%', to: '44%', gain: '+35.8%', shipment: 'SHP-1071', route: 'Chennai → Singapore', cargo: 'Industrial Equipment', value: '$67,000' },
];
