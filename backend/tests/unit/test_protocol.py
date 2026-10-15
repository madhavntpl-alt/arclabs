"""
Unit tests for Protocol parser
"""

import pytest
import json
from app.services.protocol import ProtocolParser, ProtocolValidator, parse_line, encode_message, validate_message


class TestProtocolParser:
    @pytest.fixture
    def parser(self):
        return ProtocolParser()

    def test_parse_valid_sensor_reading(self, parser):
        line = '{"type":"sensor_reading","timestamp":1234567890,"payload":{"sensor":"water_level","value":45.2,"unit":"cm"}}'
        result = parser.parse_line(line)
        
        assert result is not None
        assert result["type"] == "sensor_reading"
        assert result["payload"]["sensor"] == "water_level"
        assert result["payload"]["value"] == 45.2

    def test_parse_invalid_json(self, parser):
        line = '{"type":"sensor_reading","timestamp":1234567890,"payload":{'
        result = parser.parse_line(line)
        
        assert result is None

    def test_parse_empty_line(self, parser):
        result = parser.parse_line("")
        assert result is None
        
        result = parser.parse_line("   ")
        assert result is None

    def test_encode_message(self, parser):
        message = {"type": "command", "command": "pump_on", "params": {"duration": 30}}
        encoded = parser.encode_message(message)
        
        parsed = json.loads(encoded.strip())
        assert parsed["type"] == "command"
        assert parsed["command"] == "pump_on"
        assert "sequence" in parsed
        assert "timestamp" in parsed
        assert "checksum" in parsed

    def test_validate_sensor_reading(self):
        valid_message = {
            "type": "sensor_reading",
            "timestamp": 1234567890,
            "payload": {"sensor": "water_level", "value": 45.2, "unit": "cm"}
        }
        is_valid, error = validate_message(valid_message)
        assert is_valid is True
        assert error is None

    def test_validate_invalid_sensor_type(self):
        invalid_message = {
            "type": "sensor_reading",
            "timestamp": 1234567890,
            "payload": {"sensor": "invalid_sensor", "value": 45.2, "unit": "cm"}
        }
        is_valid, error = validate_message(invalid_message)
        assert is_valid is False
        assert "Invalid sensor type" in error

    def test_validate_missing_fields(self):
        invalid_message = {"type": "sensor_reading"}
        is_valid, error = validate_message(invalid_message)
        assert is_valid is False
        assert "Missing required field" in error