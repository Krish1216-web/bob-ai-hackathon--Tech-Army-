"""
ChainGuard AI — 4-Layer Cold-Chain Anomaly Detection Engine
Source: LiveCold-Pathway-RAG-main (core/anomaly_detector.py)
4-Layer Detection:
  L1: Physical Bounds     — Reject impossible temperatures
  L2: Rate-of-Change      — Flag sudden jumps (sensor fault)
  L3: Statistical Z-Score — Detect outliers from rolling mean
  L4: Stuck Sensor        — Flag repeated identical readings
"""

import time
import threading
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Optional, Dict

PHYSICAL_LIMITS = {
    "vaccines":        (-90.0, 30.0),
    "frozen_meat":     (-45.0, 25.0),
    "dairy":           (-10.0, 35.0),
    "seafood":         (-30.0, 30.0),
    "pharmaceuticals": (-15.0, 40.0),
    "ice_cream":       (-50.0, 20.0),
    "fruits":          (-5.0,  45.0),
    "flowers":         (-5.0,  40.0),
    "default":         (-60.0, 60.0),
}

MAX_RATE_OF_CHANGE = 3.0    # °C per reading interval
ZSCORE_THRESHOLD = 3.5
STUCK_SENSOR_COUNT = 8
STUCK_EPSILON = 0.001
WINDOW_SIZE = 20

@dataclass
class AnomalyResult:
    is_anomaly: bool = False
    layer: str = ""               # "L1_BOUNDS", "L2_RATE", "L3_ZSCORE", "L4_STUCK", "NONE"
    reason: str = ""
    original_temp: float = 0.0
    corrected_temp: Optional[float] = None

    def __bool__(self):
        return self.is_anomaly

@dataclass
class ShipmentSensorState:
    history: list = field(default_factory=list)
    timestamps: list = field(default_factory=list)
    consecutive_same: int = 0
    last_temp: Optional[float] = None
    last_time: float = 0.0
    total_readings: int = 0
    anomalies_detected: int = 0

class AnomalyDetector:
    def __init__(self):
        self._states = defaultdict(ShipmentSensorState)
        self._lock = threading.Lock()
        self._global_stats = {
            "total_readings": 0,
            "total_anomalies": 0,
            "l1_bounds": 0,
            "l2_rate": 0,
            "l3_zscore": 0,
            "l4_stuck": 0,
        }

    def check(self, shipment_id: str, temp: float, product_type: str = "default") -> AnomalyResult:
        with self._lock:
            state = self._states[shipment_id]
            state.total_readings += 1
            self._global_stats["total_readings"] += 1
            now = time.time()

            # L1: Physical Bounds
            p_key = product_type.lower().replace(" ", "_")
            limits = PHYSICAL_LIMITS.get(p_key, PHYSICAL_LIMITS["default"])
            if temp < limits[0] or temp > limits[1]:
                state.anomalies_detected += 1
                self._global_stats["total_anomalies"] += 1
                self._global_stats["l1_bounds"] += 1
                return AnomalyResult(
                    is_anomaly=True,
                    layer="L1_BOUNDS",
                    reason=f"Temperature {temp:.1f}°C outside physical limits [{limits[0]}, {limits[1]}]°C for {product_type}",
                    original_temp=temp,
                    corrected_temp=state.last_temp if state.last_temp is not None else (limits[0] + limits[1]) / 2.0
                )

            # L2: Rate-of-Change
            if state.last_temp is not None:
                delta = abs(temp - state.last_temp)
                if delta > MAX_RATE_OF_CHANGE:
                    state.anomalies_detected += 1
                    self._global_stats["total_anomalies"] += 1
                    self._global_stats["l2_rate"] += 1
                    return AnomalyResult(
                        is_anomaly=True,
                        layer="L2_RATE",
                        reason=f"Rate of change {delta:.1f}°C exceeds max {MAX_RATE_OF_CHANGE}°C/interval",
                        original_temp=temp,
                        corrected_temp=state.last_temp
                    )

            # L4: Stuck Sensor
            if state.last_temp is not None and abs(temp - state.last_temp) < STUCK_EPSILON:
                state.consecutive_same += 1
                if state.consecutive_same >= STUCK_SENSOR_COUNT:
                    state.anomalies_detected += 1
                    self._global_stats["total_anomalies"] += 1
                    self._global_stats["l4_stuck"] += 1
                    return AnomalyResult(
                        is_anomaly=True,
                        layer="L4_STUCK",
                        reason=f"Sensor stuck at {temp:.2f}°C for {state.consecutive_same} consecutive readings",
                        original_temp=temp,
                        corrected_temp=temp
                    )
            else:
                state.consecutive_same = 0

            # L3: Statistical Z-Score
            if len(state.history) >= 5:
                mean = sum(state.history) / len(state.history)
                variance = sum((x - mean) ** 2 for x in state.history) / len(state.history)
                std_dev = variance ** 0.5
                if std_dev > 0.05:
                    z = abs(temp - mean) / std_dev
                    if z > ZSCORE_THRESHOLD:
                        state.anomalies_detected += 1
                        self._global_stats["total_anomalies"] += 1
                        self._global_stats["l3_zscore"] += 1
                        return AnomalyResult(
                            is_anomaly=True,
                            layer="L3_ZSCORE",
                            reason=f"Z-Score {z:.2f} exceeds threshold {ZSCORE_THRESHOLD}",
                            original_temp=temp,
                            corrected_temp=mean
                        )

            # Update valid state
            state.history.append(temp)
            if len(state.history) > WINDOW_SIZE:
                state.history.pop(0)
            state.last_temp = temp
            state.last_time = now

            return AnomalyResult(
                is_anomaly=False,
                layer="NONE",
                reason="Verified by 4-layer anomaly detector",
                original_temp=temp,
                corrected_temp=temp
            )

anomaly_engine = AnomalyDetector()
