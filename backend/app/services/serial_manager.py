"""
Serial Manager - Handles serial communication with firmware
"""

import asyncio
import json
import serial
import serial.tools.list_ports
from typing import Optional, Callable, Dict, Any
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class SerialManager:
    def __init__(self):
        self.serial_connection: Optional[serial.Serial] = None
        self.port = settings.SERIAL_PORT
        self.baudrate = settings.SERIAL_BAUDRATE
        self.timeout = settings.SERIAL_TIMEOUT
        self.mock_mode = settings.SERIAL_MOCK
        self.running = False
        self.read_task: Optional[asyncio.Task] = None
        self.message_callback: Optional[Callable[[Dict], None]] = None
        self.reconnect_interval = 5
        self.max_reconnect_attempts = 10
        self.reconnect_attempts = 0
        self.last_message_time = 0
        self.messages_received = 0
        self.messages_sent = 0
        self.errors = 0

    def set_message_callback(self, callback: Callable[[Dict], None]):
        self.message_callback = callback

    async def start(self):
        if self.running:
            return

        self.running = True
        self.reconnect_attempts = 0

        if self.mock_mode:
            logger.info("Starting in mock mode")
            self.read_task = asyncio.create_task(self._mock_reader())
        else:
            await self._connect()
            if self.serial_connection:
                self.read_task = asyncio.create_task(self._read_loop())

    async def stop(self):
        self.running = False
        if self.read_task:
            self.read_task.cancel()
            try:
                await self.read_task
            except asyncio.CancelledError:
                pass
        if self.serial_connection:
            self.serial_connection.close()
            self.serial_connection = None

    async def _connect(self):
        try:
            self.serial_connection = serial.Serial(
                port=self.port,
                baudrate=self.baudrate,
                timeout=self.timeout,
            )
            logger.info(f"Serial connected on {self.port} at {self.baudrate} baud")
            self.reconnect_attempts = 0
        except serial.SerialException as e:
            logger.error(f"Failed to connect to {self.port}: {e}")
            self.serial_connection = None
            raise

    async def _read_loop(self):
        while self.running and self.serial_connection:
            try:
                line = await asyncio.get_event_loop().run_in_executor(
                    None, self.serial_connection.readline
                )
                if line:
                    decoded = line.decode('utf-8', errors='ignore').strip()
                    if decoded:
                        await self._process_line(decoded)
                else:
                    await asyncio.sleep(0.01)
            except serial.SerialException as e:
                logger.error(f"Serial error: {e}")
                self.errors += 1
                await self._handle_disconnect()
                break
            except Exception as e:
                logger.error(f"Read loop error: {e}")
                self.errors += 1
                await asyncio.sleep(0.1)

    async def _process_line(self, line: str):
        self.last_message_time = asyncio.get_event_loop().time()
        self.messages_received += 1

        try:
            message = json.loads(line)
            if self.message_callback:
                await self.message_callback(message)
        except json.JSONDecodeError:
            logger.warning(f"Invalid JSON: {line}")

    async def _mock_reader(self):
        """Generate mock sensor data for testing"""
        import random
        sensor_types = [
            ("water_level", 45.0, 10.0, "cm"),
            ("temperature", 23.0, 5.0, "°C"),
            ("humidity", 65.0, 10.0, "%"),
            ("gas", 450, 100, "ppm"),
            ("battery", 3.85, 0.1, "V"),
        ]

        while self.running:
            for sensor_type, base_value, variance, unit in sensor_types:
                if not self.running:
                    break
                
                value = base_value + random.uniform(-variance, variance)
                message = {
                    "type": "sensor_reading",
                    "sensor": sensor_type,
                    "value": round(value, 2),
                    "unit": unit,
                    "timestamp": int(asyncio.get_event_loop().time())
                }
                
                if self.message_callback:
                    await self.message_callback(message)
                
                await asyncio.sleep(1)  # 1 second between readings

    async def _handle_disconnect(self):
        logger.warning("Serial disconnected, attempting reconnect...")
        self.serial_connection = None
        
        while self.running and self.reconnect_attempts < self.max_reconnect_attempts:
            self.reconnect_attempts += 1
            logger.info(f"Reconnection attempt {self.reconnect_attempts}/{self.max_reconnect_attempts}")
            await asyncio.sleep(self.reconnect_interval)
            
            try:
                await self._connect()
                if self.serial_connection:
                    logger.info("Reconnected successfully")
                    return
            except serial.SerialException:
                continue
        
        logger.error("Max reconnection attempts reached")

    async def send_command(self, command: Dict):
        """Send command to firmware"""
        if self.mock_mode:
            logger.info(f"Mock command sent: {command}")
            return {"success": True, "message": "Mock command acknowledged"}
        
        if not self.serial_connection or not self.serial_connection.is_open:
            raise RuntimeError("Serial connection not available")
        
        try:
            command_json = json.dumps(command) + "\n"
            self.serial_connection.write(command_json.encode('utf-8'))
            self.serial_connection.flush()
            self.messages_sent += 1
            logger.debug(f"Command sent: {command}")
            return {"success": True, "message": "Command sent"}
        except serial.SerialException as e:
            logger.error(f"Failed to send command: {e}")
            self.errors += 1
            raise

    def get_status(self) -> Dict:
        return {
            "connected": self.serial_connection is not None and self.serial_connection.is_open,
            "port": self.port,
            "baudrate": self.baudrate,
            "mock_mode": self.mock_mode,
            "running": self.running,
            "messages_received": self.messages_received,
            "messages_sent": self.messages_sent,
            "errors": self.errors,
            "last_message_time": self.last_message_time,
        }