"""
ChainGuard AI — Cold Chain SOP & Product Temperature Profiles
Source: LiveCold-Pathway-RAG-main (core/sop_parser.py)
"""

from typing import Dict, Tuple

SOP_PRODUCT_RANGES: Dict[str, Tuple[float, float]] = {
    "vaccines":        (2.0, 8.0),
    "pharmaceuticals": (2.0, 8.0),
    "biologics":       (2.0, 8.0),
    "dairy":           (2.0, 6.0),
    "frozen_meat":     (-18.0, -12.0),
    "seafood":         (-1.0, 2.0),
    "vegetables":      (7.0, 10.0),
    "fruits":          (8.0, 12.0),
    "ice_cream":       (-25.0, -18.0),
    "flowers":         (2.0, 8.0),
}

def get_product_temp_range(product_name: str) -> Tuple[float, float]:
    key = str(product_name or "").lower().replace(" ", "_")
    return SOP_PRODUCT_RANGES.get(key, (2.0, 8.0))

def classify_excursion(temp_c: float, product_name: str) -> Tuple[bool, str, float]:
    safe_min, safe_max = get_product_temp_range(product_name)
    if temp_c < safe_min:
        dev = safe_min - temp_c
        severity = "CRITICAL" if dev > 3.0 else "MEDIUM"
        return True, severity, dev
    elif temp_c > safe_max:
        dev = temp_c - safe_max
        severity = "CRITICAL" if dev > 2.0 else "MEDIUM"
        return True, severity, dev
    return False, "NORMAL", 0.0
