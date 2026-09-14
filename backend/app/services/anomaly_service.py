from dataclasses import dataclass
from typing import Optional, Dict, Tuple

PHYSICAL_LIMITS: Dict[str, Tuple[float, float]] = {
    "vaccines": (-90.0, 30.0),
    "pharmaceuticals": (-15.0, 40.0),
    "food": (-30.0, 35.0),
    "chemicals": (-20.0, 50.0),
    "default": (-50.0, 50.0)
}

MAX_RATE_OF_CHANGE = 3.5 # deg C per reading interval
ZSCORE_THRESHOLD = 3.5
STUCK_COUNT_THRESHOLD = 8

@dataclass
class AnomalyResult:
    is_anomaly: bool = False
    layer: str = "NONE" # L1_BOUNDS, L2_RATE, L3_ZSCORE, L4_STUCK, NONE
    reason: str = ""
    original_temp: float = 0.0
    corrected_temp: Optional[float] = None

class ColdChainAnomalyDetector:
    """
    4-Layer Sensor Anomaly Detection Engine (ported from LiveCold reference):
      L1: Physical bounds check (impossible hardware readings e.g. 500C or -999C)
      L2: Rate of change check (abrupt jump > 3.5C in seconds)
      L3: Statistical Z-score outlier detection against rolling window
      L4: Stuck sensor detection (identical repeated readings)
    """

    def __init__(self):
        self._history: Dict[str, list] = {}
        self._stuck_counts: Dict[str, int] = {}
        self._last_temps: Dict[str, float] = {}

    def inspect_reading(self, entity_id: str, temperature_c: float, product_type: str = "vaccines") -> AnomalyResult:
        product_key = product_type.lower()
        min_limit, max_limit = PHYSICAL_LIMITS.get(product_key, PHYSICAL_LIMITS["default"])

        # L1: Physical Bounds
        if temperature_c < min_limit or temperature_c > max_limit:
            return AnomalyResult(
                is_anomaly=True,
                layer="L1_BOUNDS",
                reason=f"Temperature {temperature_c}°C violates physical bounds [{min_limit}, {max_limit}]°C for {product_type}",
                original_temp=temperature_c,
                corrected_temp=self._last_temps.get(entity_id, (min_limit + max_limit) / 2.0)
            )

        # Initialize history
        if entity_id not in self._history:
            self._history[entity_id] = []
            self._stuck_counts[entity_id] = 0

        hist = self._history[entity_id]
        last_temp = self._last_temps.get(entity_id)

        # L2: Rate of Change
        if last_temp is not None:
            delta = abs(temperature_c - last_temp)
            if delta > MAX_RATE_OF_CHANGE:
                return AnomalyResult(
                    is_anomaly=True,
                    layer="L2_RATE",
                    reason=f"Sudden rate of change of {delta:.1f}°C exceeds threshold of {MAX_RATE_OF_CHANGE}°C/interval",
                    original_temp=temperature_c,
                    corrected_temp=last_temp
                )

        # L4: Stuck Sensor
        if last_temp is not None and abs(temperature_c - last_temp) < 0.001:
            self._stuck_counts[entity_id] += 1
            if self._stuck_counts[entity_id] >= STUCK_COUNT_THRESHOLD:
                return AnomalyResult(
                    is_anomaly=True,
                    layer="L4_STUCK",
                    reason=f"Sensor stuck at {temperature_c}°C for {self._stuck_counts[entity_id]} consecutive readings",
                    original_temp=temperature_c,
                    corrected_temp=temperature_c
                )
        else:
            self._stuck_counts[entity_id] = 0

        # L3: Statistical Z-Score
        if len(hist) >= 5:
            mean = sum(hist) / len(hist)
            variance = sum((x - mean) ** 2 for x in hist) / len(hist)
            std_dev = variance ** 0.5
            if std_dev > 0.05:
                z_score = abs(temperature_c - mean) / std_dev
                if z_score > ZSCORE_THRESHOLD:
                    return AnomalyResult(
                        is_anomaly=True,
                        layer="L3_ZSCORE",
                        reason=f"Z-Score {z_score:.2f} exceeds threshold of {ZSCORE_THRESHOLD}",
                        original_temp=temperature_c,
                        corrected_temp=mean
                    )

        # Valid reading -> update rolling window
        hist.append(temperature_c)
        if len(hist) > 20:
            hist.pop(0)
        self._last_temps[entity_id] = temperature_c

        return AnomalyResult(
            is_anomaly=False,
            layer="NONE",
            reason="Reading verified by 4-layer anomaly filter",
            original_temp=temperature_c,
            corrected_temp=temperature_c
        )

anomaly_detector = ColdChainAnomalyDetector()
