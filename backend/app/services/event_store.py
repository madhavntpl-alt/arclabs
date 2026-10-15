"""
Event Store - SQLite persistence, query, rotation
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from app.models.event import EventLog, EventQuery, PaginatedEvents, EventStats
from app.core.logging import get_logger

logger = get_logger(__name__)


class EventStore:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.max_events = 100000
        self.rotation_interval_days = 30

    async def save(self, event) -> EventLog:
        """Save an event to the database"""
        db_event = EventLog(
            id=event.id,
            event_type=event.event_type,
            severity=event.severity,
            device_id=event.device_id,
            message=event.message,
            metadata=event.metadata,
            timestamp=event.timestamp,
            correlation_id=event.correlation_id,
        )
        self.db.add(db_event)
        await self.db.commit()
        await self.db.refresh(db_event)
        return db_event

    async def save_batch(self, events: List) -> List:
        """Save multiple events in batch"""
        db_events = []
        for event in events:
            db_event = EventLog(
                id=event.id,
                event_type=event.event_type,
                severity=event.severity,
                device_id=event.device_id,
                message=event.message,
                metadata=event.metadata,
                timestamp=event.timestamp,
                correlation_id=event.correlation_id,
            )
            db_events.append(db_event)
        
        self.db.add_all(db_events)
        await self.db.commit()
        for db_event in db_events:
            await self.db.refresh(db_event)
        return db_events

    async def query(self, query: EventQuery) -> tuple[List, int]:
        """Query events with filters"""
        stmt = select(EventLog)
        
        # Apply filters
        conditions = []
        if query.event_type:
            conditions.append(EventLog.event_type == query.event_type)
        if query.event_types:
            conditions.append(EventLog.event_type.in_(query.event_types))
        if query.severity:
            conditions.append(EventLog.severity == query.severity)
        if query.severities:
            conditions.append(EventLog.severity.in_(query.severities))
        if query.device_id:
            conditions.append(EventLog.device_id == query.device_id)
        if query.device_ids:
            conditions.append(EventLog.device_id.in_(query.device_ids))
        if query.start:
            conditions.append(EventLog.timestamp >= query.start)
        if query.end:
            conditions.append(EventLog.timestamp <= query.end)
        if query.search:
            conditions.append(EventLog.message.ilike(f"%{query.search}%"))
        
        if conditions:
            stmt = stmt.where(and_(*conditions))
        
        # Apply sorting
        sort_field = query.sort.lstrip("-")
        sort_desc = query.sort.startswith("-")
        if hasattr(EventLog, sort_field):
            sort_column = getattr(EventLog, sort_field)
            if sort_desc:
                stmt = stmt.order_by(desc(sort_column))
            else:
                stmt = stmt.order_by(sort_column)
        else:
            stmt = stmt.order_by(desc(EventLog.timestamp))
        
        # Get total count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.db.scalar(count_stmt) or 0
        
        # Apply pagination
        stmt = stmt.offset(query.offset).limit(query.limit)
        
        result = await self.db.execute(stmt)
        events = result.scalars().all()
        
        return list(events), total

    async def get_by_id(self, event_id: str) -> Optional[EventLog]:
        stmt = select(EventLog).where(EventLog.id == event_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def delete(self, event_id: str) -> bool:
        event = await self.get_by_id(event_id)
        if event:
            await self.db.delete(event)
            await self.db.commit()
            return True
        return False

    async def get_stats(self, start: datetime, end: datetime) -> EventStats:
        stmt = select(EventLog).where(
            and_(EventLog.timestamp >= start, EventLog.timestamp <= end)
        )
        result = await self.db.execute(stmt)
        events = result.scalars().all()
        
        by_type = {}
        by_severity = {}
        by_device = {}
        
        for event in events:
            by_type[event.event_type] = by_type.get(event.event_type, 0) + 1
            by_severity[event.severity] = by_severity.get(event.severity, 0) + 1
            by_device[event.device_id] = by_device.get(event.device_id, 0) + 1
        
        return EventStats(
            by_type=by_type,
            by_severity=by_severity,
            by_device=by_device,
            total=len(events),
            time_range={"start": start.isoformat(), "end": end.isoformat()},
        )

    async def rotate_old_events(self) -> int:
        """Delete events older than rotation interval"""
        cutoff = datetime.now() - timedelta(days=self.rotation_interval_days)
        stmt = select(EventLog).where(EventLog.timestamp < cutoff)
        result = await self.db.execute(stmt)
        old_events = result.scalars().all()
        
        for event in old_events:
            await self.db.delete(event)
        
        await self.db.commit()
        return len(old_events)

    async def cleanup(self) -> int:
        """Clean up old events if over max limit"""
        count_stmt = select(func.count(EventLog.id))
        total = await self.db.scalar(count_stmt) or 0
        
        if total > self.max_events:
            excess = total - self.max_events
            # Delete oldest events
            stmt = select(EventLog).order_by(EventLog.timestamp).limit(excess)
            result = await self.db.execute(stmt)
            old_events = result.scalars().all()
            
            for event in old_events:
                await self.db.delete(event)
            
            await self.db.commit()
            return excess
        
        return 0