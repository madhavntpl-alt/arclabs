"""
Unit tests for Event Store
"""

import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime
from app.services.event_store import EventStore
from app.models.event import EventLog, EventQuery, EventStats


class TestEventStore:
    @pytest.fixture
    def event_store(self):
        mock_db = AsyncMock()
        return EventStore(mock_db)

    @pytest.mark.asyncio
    async def test_save_event(self, event_store):
        event = MagicMock()
        event.id = "evt_1"
        event.event_type = "threshold_exceeded"
        event.severity = "warning"
        event.device_id = "device_1"
        event.message = "Water level low"
        event.metadata = {"sensor": "water_level", "value": 8.5}
        event.timestamp = datetime.now()
        event.correlation_id = "corr_1"
        
        saved = await event_store.save(event)
        assert saved is not None
        assert saved.id == "evt_1"

    @pytest.mark.asyncio
    async def test_query_events(self, event_store):
        event_store.db.execute = AsyncMock()
        event_store.db.scalar = AsyncMock(return_value=2)
        
        mock_events = [MagicMock(id="evt_1"), MagicMock(id="evt_2")]
        event_store.db.execute.return_value.scalars.return_value.all.return_value = [MagicMock(), MagicMock()]
        
        query = EventQuery(limit=10, offset=0)
        events, total = await event_store.query(query)
        
        assert len(events) == 2
        assert total == 2

    @pytest.mark.asyncio
    async def test_get_stats(self, event_store):
        start = datetime.now()
        end = datetime.now()
        
        # Mock events for stats
        mock_events = [
            MagicMock(event_type="threshold_exceeded", severity="warning", device_id="device_1"),
            MagicMock(event_type="automation_triggered", severity="info", device_id="device_1"),
        ]
        
        event_store.db.execute = AsyncMock()
        event_store.db.execute.return_value.scalars.return_value.all.return_value = mock_events
        
        stats = await event_store.get_stats(datetime.now(), datetime.now())
        
        assert stats.by_type["threshold_exceeded"] == 1
        assert stats.by_type["automation_triggered"] == 1
        assert stats.by_severity["warning"] == 1
        assert stats.by_severity["info"] == 1
        assert stats.by_device["device_1"] == 2
        assert stats.total == 2