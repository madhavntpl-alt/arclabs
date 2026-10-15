#!/usr/bin/env python3
"""
Socat-based Serial Mock Service
Alternative to Python mock that uses socat for virtual serial port creation
"""

import asyncio
import json
import random
import os
import signal
import subprocess
import sys
import asyncio.subprocess
from typing import Optional, Callable, Dict, Any
from datetime import datetime


class SocatSerialSimulator:
    """
    Mock serial simulator using socat for virtual serial port pairs.
    Creates a PTY pair: one end for the backend, one for the simulator.
    """

    def __init__(self):
        self.running = False
        self.callback: Optional[Callable[[Dict], None]] = None
        self.interval = float(os.getenv("MOCK_INTERVAL", "1.0"))
        self.socat_process: Optional[asyncio.subprocess.Process] = None
        self.pty_master: Optional[str] = None
        self.pty_slave: Optional[str] = None
        self.reader_task: Optional[asyncio.Task] = None
        
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

        # Create PTY pair using socat
        await self._create_pty_pair()
        
        self.running = True
        self.reader_task = asyncio.create_task(self._run_loop())

    async def _create_pty_pair(self):
        """Create a PTY pair using socat"""
        # Create a PTY pair using socat
        # One end will be used by the backend, the other by our simulator
        cmd = [
            "socat",
            "-d", "-d",
            "PTY,link=/tmp/ttyVIRT0,raw,echo=0,waitslave",
            "PTY,link=/tmp/ttyVIRT1,raw,echo=0,waitslave"
        ]
        
        self.socat_process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        # Wait for PTYs to be created
        await asyncio.sleep(1)
        
        # The master PTY is what the backend will connect to
        self.pty_master = "/tmp/ttyVIRT0"
        self.pty_slave = "/tmp/ttyVIRT1"
        
        print(f"[SocatSerial] Created PTY pair: {self.pty_master} <-> {self.pty_slave}")

    async def stop(self):
        self.running = False
        if self.reader_task:
            self.reader_task.cancel()
            try:
                await self.reader_task
            except asyncio.CancelledError:
                pass
        
        if self.socat_process:
            self.socat_process.terminate()
            try:
                await self.socat_process.wait()
            except ProcessLookupError:
                pass
        
        # Clean up PTY links
        for pty in ["/tmp/ttyVIRT0", "/tmp/ttyVIRT1"]:
            try:
                os.unlink(pty)
            except FileNotFoundError:
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


class MockSerialPort:
    """Mock serial port that reads from the PTY created by socat."""
    
    def __init__(self, port: str, baudrate: int = 115200, timeout: float = 1.0):
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout
        self.is_open = False
        self._reader: Optional[asyncio.StreamReader] = None
        self._writer: Optional[asyncio.StreamWriter] = None
        self._buffer = ""
        self.simulator: Optional[SocatSerialSimulator] = None

    async def open(self):
        if self.is_open:
            return
            
        # Connect to the PTY created by socat
        try:
            self._reader, self._writer = await asyncio.open_serial_connection(
                url=self.port,
                baudrate=self.baudrate
            )
            self.is_open = True
            print(f"[MockSerialPort] Connected to {self.port}")
        except Exception as e:
            print(f"[MockSerialPort] Failed to connect to {self.port}: {e}")
            raise

    async def close(self):
        if self._writer:
            self._writer.close()
            await self._writer.wait_closed()
        self.is_open = False

    async def readline(self) -> bytes:
        if not self._reader:
            return b""
        try:
            line = await asyncio.wait_for(self._reader.readline(), timeout=self.timeout)
            return line
        except asyncio.TimeoutError:
            return b""

    def write(self, data: bytes) -> int:
        if self._writer:
            self._writer.write(data)
            return len(data)
        return 0

    def set_simulator(self, simulator: SocatSerialSimulator):
        self.simulator = simulator


async def main():
    simulator = SocatSerialSimulator()
    
    def print_message(msg):
        print(json.dumps(msg))
    
    simulator.set_callback(print_message)
    simulator.set_interval(1.0)
    
    print("[SocatSerial] Starting socat-based mock serial simulator...", flush=True)
    await simulator.start()
    
    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        await simulator.stop()
        print("\n[SocatSerial] Stopped")


if __name__ == "__main__":
    import json
    import time
    asyncio.run(main())