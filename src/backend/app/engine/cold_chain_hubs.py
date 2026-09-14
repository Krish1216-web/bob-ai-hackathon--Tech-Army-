"""
ChainGuard AI — Cold Storage Hubs & Traffic Model
Source: LiveCold-Pathway-RAG-main (core/hub_manager.py)
"""

import math
from typing import Dict, List, Any

COLD_STORAGE_HUBS = [
    {
        "id": "HUB-MUMBAI-01",
        "name": "Navi Mumbai Central Cold Logistics Hub",
        "location": "Navi Mumbai (JNPT Area)",
        "lat": 18.98,
        "lng": 73.02,
        "temp_zones": ["ultra_cold", "chilled", "frozen"],
        "capacity_tons": 500.0,
        "available_tons": 180.0,
        "status": "OPERATIONAL"
    },
    {
        "id": "HUB-MUNDRA-01",
        "name": "Mundra Port Cold Terminal",
        "location": "Mundra Special Economic Zone",
        "lat": 22.84,
        "lng": 69.71,
        "temp_zones": ["ultra_cold", "chilled", "frozen", "ambient"],
        "capacity_tons": 850.0,
        "available_tons": 420.0,
        "status": "OPERATIONAL"
    },
    {
        "id": "HUB-AHMEDABAD-01",
        "name": "Ahmedabad Pharma Cold Hub",
        "location": "Sanand Industrial Hub",
        "lat": 23.02,
        "lng": 72.57,
        "temp_zones": ["ultra_cold", "chilled"],
        "capacity_tons": 350.0,
        "available_tons": 110.0,
        "status": "OPERATIONAL"
    },
    {
        "id": "HUB-CHENNAI-01",
        "name": "Chennai Port Cold Storage Hub",
        "location": "Ennore Port Logistics Zone",
        "lat": 13.08,
        "lng": 80.27,
        "temp_zones": ["chilled", "frozen"],
        "capacity_tons": 400.0,
        "available_tons": 95.0,
        "status": "OPERATIONAL"
    }
]

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def find_nearest_qualified_hub(curr_lat: float, curr_lng: float, product_type: str = "vaccines") -> Dict[str, Any]:
    best_hub = None
    min_dist = float("inf")

    for hub in COLD_STORAGE_HUBS:
        if hub["status"] != "OPERATIONAL" or hub["available_tons"] <= 10.0:
            continue
        dist = haversine_km(curr_lat, curr_lng, hub["lat"], hub["lng"])
        if dist < min_dist:
            min_dist = dist
            best_hub = {**hub, "distance_km": round(dist, 1), "eta_minutes": max(15, round(dist * 1.5))}

    return best_hub or {**COLD_STORAGE_HUBS[0], "distance_km": 14.0, "eta_minutes": 25}
