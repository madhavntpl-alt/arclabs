#!/usr/bin/env python3
"""
Mock Serial Data Simulator
For testing without hardware - generates realistic sensor data
"""

import asyncio
import json
import random
import time
from typing import Optional, Callable, Dict, Any
from datetime import datetime


class MockSerialSimulator:
    def __init__(self):
        self.running = False
        self.callback: Optional[Callable[[Dict], None]] = None
        self.interval = float(os.getenv("MOCK_INTERVAL", "1.0"))
        self.task: Optional[asyncio.Task] = None
        
        # Sensor baselines with realistic values
        self.baselines = {
            "water_level": {"value": 45.0, "variance": 5.0, "unit": "cm", "min": 0, "max": 200},
            "temperature": {"value": 23.5, "variance": 2.0, "unit": "°C", "min": -40, "max": 80},
            "humidity": {"value": 65.0, "variance": 5.0, "unit": "%", "min": 0, "max": 100},
            "gas": {"value": 450, "variance": 50, "unit": "ppm", "min": 0, "max": 10000},
            "battery": {"value": 3.85, "variance": 0.05, "unit": "V", "min": 3.0, "max": 4.2},
        }
        
        # Add some drift over time
        self.drift = {sensor: 0.0 for sensor in self.baselines}
        
        # Event probability
        self.event_probability = 0.01

    def set_callback(self, callback: Callable[[Dict], None]):
        self.callback = callback

    def set_interval(self, interval: float):
        self.interval = interval

    async def start(self):
        if self.running:
            return
        
        self.running = True
        print("[MockSerial] Starting mock serial simulator...")
        self.task = asyncio.create_task(self._run_loop())

    async def stop(self):
        self.running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass

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
                    "timestamp": int(time.time()),
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
                    "uptime_seconds": int(time.time()),
                    "free_heap": random.randint(1000, 2000),
                    "sensors_active": list(self.baselines.keys()),
                    "actuators_state": {"pump": False, "valve": False},
                }
                if self.callback:
                    await self.callback(status_message)
            
            # Occasionally send events
            if random.random() < self.event_probability:
                event_types = [
                    ("threshold_exceeded", "warning", "Water level below minimum: 8.5 cm", {"sensor": "water_level", "value": 8.5, "threshold": 10}),
                    ("automation_triggered", "info", "Automation rule 'Low Water Pump' executed", {"rule_id": "rule_1", "rule_name": "Low Water Pump"}),
                    ("device_connected", "info", "Device connected", {}),
                ]
                event_type, severity, message, metadata = random.choice(event_types)
                event_message = {
                    "type": "event",
                    "event_type": event_type,
                    "severity": severity,
                    "message": message,
                    "metadata": metadata,
                    "timestamp": int(time.time()),
                }
                if self.callback:
                    await self.callback(event_message)

    def set_baseline(self, sensor_type: str, value: float):
        if sensor_type in self.baselines:
            self.baselines[sensor_type]["value"] = value

    def get_baselines(self) -> Dict:
        return self.baselines.copy()


# Serial port simulation for pyserial compatibility
class MockSerial:
    def __init__(self, port: str, baudrate: int = 115200, timeout: float = 1.0):
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout
        self.is_open = False
        self._buffer = ""
        self.simulator = MockSerialSimulator()
        self.simulator.set_callback(self._on_message)
        
    def open(self):
        self.is_open = True
        asyncio.create_task(self.simulator.start())
        
    def close(self):
        self.is_open = False
        if self.simulator.task:
            self.simulator.task.cancel()
            try:
                asyncio.get_event_loop().run_until_complete(self.simulator.task)
            except asyncio.CancelledError:
                pass
        
    def readline(self) -> bytes:
        if self._buffer:
            line_end = self._buffer.find('\n')
            if line_end != -1:
                line = self._buffer[:line_end + 1]
                self._buffer = self._buffer[line_end + 1:]
                return line.encode()
        return b""
    
    def write(self, data: bytes) -> int:
        # Handle commands from backend
        try:
            command = json.loads(data.decode().strip())
            print(f"[MockSerial] Received command: {command}")
        except:
            pass
        return len(data)
    
    def _on_message(self, message: Dict):
        line = json.dumps(message) + "\n"
        self._buffer += line
    
    def in_waiting(self) -> int:
        return len(self._buffer)
    
    def read(self, size: int = 1) -> bytes:
        if self._buffer:
            result = self._buffer[:size]
            self._buffer = self._buffer[size:]
            return result.encode()
        return b""


# Main entry point for standalone service
async def main():
    simulator = MockSerialSimulator()
    
    def print_message(msg):
        print(json.dumps(msg))
    
    simulator.set_callback(print_message)
    simulator.set_interval(1.0)
    
    print("[MockSerial] Starting mock serial simulator...", flush=True)
    await simulator.start()
    
    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        await simulator.stop()
        print("\n[MockSerial] Stopped")


if __name__ == "__main__":
    import json
    import os
    import time
    asyncio.run(main())