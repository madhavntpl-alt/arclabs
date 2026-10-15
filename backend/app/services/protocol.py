"""
Protocol - JSON Lines parser, checksum, framing
"""

import json
import crcmod
from typing import Optional, Dict, Any, Generator
from app.core.logging import get_logger

logger = get_logger(__name__)

# CRC32 function for checksum validation
crc32_func = crcmod.predefined.mkPredefinedCrcFun('crc-32')


class ProtocolParser:
    def __init__(self):
        self.buffer = ""
        self.sequence = 0

    def parse_line(self, line: str) -> Optional[Dict]:
        """Parse a single JSON line"""
        line = line.strip()
        if not line:
            return None

        try:
            message = json.loads(line)
            
            # Validate checksum if present
            if "checksum" in message:
                provided_checksum = message.pop("checksum")
                calculated_checksum = self._calculate_checksum(json.dumps(message, separators=(',', ':')))
                if provided_checksum != calculated_checksum:
                    logger.warning(f"Checksum mismatch: {provided_checksum} != {calculated_checksum}")
                    return None
            
            # Add sequence number if not present
            if "sequence" not in message:
                self.sequence += 1
                message["sequence"] = self.sequence
            
            return message
        except json.JSONDecodeError as e:
            logger.warning(f"JSON decode error: {e} - Line: {line[:100]}")
            return None

    def _calculate_checksum(self, data: str) -> str:
        """Calculate CRC32 checksum"""
        return format(crc32_func(data.encode('utf-8')), '08x')

    def encode_message(self, message: Dict) -> str:
        """Encode message as JSON line with checksum"""
        # Add sequence
        self.sequence += 1
        message["sequence"] = self.sequence
        
        # Add timestamp if not present
        if "timestamp" not in message:
            import time
            message["timestamp"] = int(time.time())
        
        # Calculate checksum
        message_json = json.dumps(message, separators=(',', ':'))
        checksum = self._calculate_checksum(message_json)
        message["checksum"] = checksum
        
        # Re-encode with checksum
        return json.dumps(message, separators=(',', ':')) + "\n"


class ProtocolValidator:
    """Validate message structure and content"""
    
    REQUIRED_FIELDS = {
        "sensor_reading": ["type", "timestamp", "payload"],
        "device_status": ["type", "timestamp", "payload"],
        "event": ["type", "timestamp", "payload"],
        "command_ack": ["type", "timestamp", "payload"],
        "command": ["type", "timestamp", "payload"],
        "config_update": ["type", "timestamp", "payload"],
    }

    SENSOR_TYPES = {"water_level", "temperature", "humidity", "gas", "battery"}
    COMMAND_TYPES = {"pump_on", "pump_off", "relay_set", "calibrate", "reset", "get_status"}

    @classmethod
    def validate(cls, message: Dict) -> tuple[bool, Optional[str]]:
        """Validate message structure"""
        msg_type = message.get("type")
        
        if not msg_type:
            return False, "Missing type field"
        
        # Check required fields
        required = cls.REQUIRED_FIELDS.get(msg_type, [])
        for field in required:
            if field not in message:
                return False, f"Missing required field: {field}"
        
        # Type-specific validation
        if msg_type == "sensor_reading":
            payload = message.get("payload", {})
            if "sensor" not in payload or payload["sensor"] not in cls.SENSOR_TYPES:
                return False, f"Invalid sensor type: {payload.get('sensor')}"
            if "value" not in payload or not isinstance(payload["value"], (int, float)):
                return False, "Invalid sensor value"
        
        elif msg_type == "command":
            payload = message.get("payload", {})
            if "command" not in payload or payload["command"] not in cls.COMMAND_TYPES:
                return False, f"Invalid command type: {payload.get('command')}"
        
        return True, None


# Convenience functions
def parse_line(line: str) -> Optional[Dict]:
    parser = ProtocolParser()
    return parser.parse_line(line)


def encode_message(message: Dict) -> str:
    parser = ProtocolParser()
    return parser.encode_message(message)


def validate_message(message: Dict) -> tuple[bool, Optional[str]]:
    return ProtocolValidator.validate(message)


import time