"""
Unit tests for Serial Manager
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.serial_manager import SerialManager


class TestSerialManager:
    @pytest.fixture
    def serial_manager(self):
        return SerialManager()

    @pytest.mark.asyncio
    async def test_start_mock_mode(self, serial_manager):
        with patch.object(settings, 'SERIAL_MOCK', True):
            await serial_manager.start()
            assert serial_manager.running is True
            assert serial_manager.mock_mode is True
            await serial_manager.stop()

    @pytest.mark.asyncio
    async def test_send_command_mock(self, serial_manager):
        with patch.object(settings, 'SERIAL_MOCK', True):
            await serial_manager.start()
            
            command = {"type": "command", "command": "pump_on", "params": {"duration": 30}}
            result = await serial_manager.send_command(command)
            
            assert result["success"] is True
            assert "Mock command acknowledged" in result["message"]
            await serial_manager.stop()

    def test_get_status(self, serial_manager):
        status = serial_manager.get_status()
        assert "connected" in status
        assert "port" in status
        assert "baudrate" in status
        assert "mock_mode" in status
        assert "running" in status