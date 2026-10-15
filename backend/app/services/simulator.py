"""
Mock Serial Data Simulator - For CI/testing without hardware
"""

import asyncio
import random
from typing import Optional, Callable, Dict, Any
from datetime import datetime
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class MockSerialSimulator:
    def __init__(self):
        self.running = False
        self.callback: Optional[Callable[[Dict], None]] = None
        self.interval = 1.0  # seconds
        self.task: Optional[asyncio.Task] = None
        
        # Simulated sensor baselines
        self.baselines = {
            "water_level": {"value": 45.0, "variance": 5.0, "unit": "cm", "min": 0, "max": 200},
            "temperature": {"value": 23.5, "variance": 2.0, "unit": "°C", "min": -40, "max": 80},
            "humidity": {"value": 65.0, "variance": 5.0, "unit": "%", "min": 0, "max": 100},
            "gas": {"value": 450, "variance": 50, "unit": "ppm", "min": 0, "max": 10000},
            "battery": {"value": 3.85, "variance": 0.05, "unit": "V", "min": 3.0, "max": 4.2},
        }
        
        # Add some drift over time
        self.drift = {sensor: 0.0 for sensor in self.baselines}

    def set_callback(self, callback: Callable[[Dict], None]):
        self.callback = callback

    def set_interval(self, interval: float):
        self.interval = interval

    async def start(self):
        if self.running:
            return
        
        self.running = True
        logger.info("Starting mock serial simulator")
        self.task = asyncio.create_task(self._run_loop())

    async def stop(self):
        self.running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        logger.info("Mock serial simulator stopped")

    async def _run_loop(self):
        sensor_types = list(self.baselines.keys())
        
        while self.running:
            for sensor_type in sensor_types:
                if not self.running:
                    break
                
                baseline = self.baselines[sensor_type]
                
                # Add some drift
                self.drift[sensor_type] += random.uniform(-0.1, 0.1)
                self.drift[sensor_type] = max(-5.0, min(5.0, self.drift[sensor_type]))
                
                # Generate value with noise
                value = baseline["value"] + self.drift[sensor_type] + random.uniform(-baseline["variance"], baseline["variance"])
                value = max(baseline["min"], min(baseline["max"], value))
                
                message = {
                    "type": "sensor_reading",
                    "sensor": sensor_type,
                    "value": round(value, 2),
                    "unit": baseline["unit"],
                    "timestamp": int(datetime.now().timestamp()),
                }
                
                if self.callback:
                    await self.callback(message)
                
                await asyncio.sleep(self.interval / len(self.baselines))
            
            # Occasionally send device status
            if random.random() < 0.1:
                status_message = {
                    "type": "device_status",
                    "firmware_version": "1.0.0",
                    "hardware_version": "1.0",
                    "uptime_seconds": int((datetime.now() - datetime(2024, 1, 1)).total_seconds()),
                    "free_heap": random.randint(1000, 2000),
                    "sensors_active": list(self.baselines.keys()),
                    "actuators_state": {"pump": False, "valve": False},
                }
                if self.callback:
                    await self.callback(status_message)

    def set_baseline(self, sensor_type: str, value: float):
        if sensor_type in self.baselines:
            self.baselines[sensor_type]["value"] = value

    def get_baselines(self) -> Dict:
        return self.baselines