"""
WebSocket connection manager
"""

from typing import Dict, Set, Any
from app.websocket.connection import WebSocketConnection


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[WebSocketConnection, Set[str]] = {}
        self.topic_subscriptions: Dict[str, Set[WebSocketConnection]] = {}

    async def connect(self, websocket):
        connection = WebSocketConnection(websocket)
        self.active_connections[connection] = set()
        return connection

    def disconnect(self, websocket):
        connection = None
        for conn in self.active_connections:
            if conn.websocket == websocket:
                connection = conn
                break
        
        if connection:
            # Remove from all topic subscriptions
            for topic in connection.topics:
                if topic in self.topic_subscriptions:
                    self.topic_subscriptions[topic].discard(connection)
                    if not self.topic_subscriptions[topic]:
                        del self.topic_subscriptions[topic]
            
            del self.active_connections[connection]

    async def subscribe(self, websocket, topics: list):
        connection = None
        for conn in self.active_connections:
            if conn.websocket == websocket:
                connection = conn
                break
        
        if connection:
            for topic in topics:
                connection.topics.add(topic)
                if topic not in self.topic_subscriptions:
                    self.topic_subscriptions[topic] = set()
                self.topic_subscriptions[topic].add(connection)

    async def unsubscribe(self, websocket, topics: list):
        connection = None
        for conn in self.active_connections:
            if conn.websocket == websocket:
                connection = conn
                break
        
        if connection:
            for topic in topics:
                connection.topics.discard(topic)
                if topic in self.topic_subscriptions:
                    self.topic_subscriptions[topic].discard(connection)
                    if not self.topic_subscriptions[topic]:
                        del self.topic_subscriptions[topic]

    async def broadcast(self, topic: str, message: Dict[str, Any]):
        if topic in self.topic_subscriptions:
            disconnected = []
            for connection in self.topic_subscriptions[topic]:
                try:
                    await connection.send(message)
                except Exception:
                    disconnected.append(connection)
            
            # Clean up disconnected connections
            for conn in disconnected:
                self.disconnect(conn.websocket)

    async def broadcast_to_all(self, message: Dict[str, Any]):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send(message)
            except Exception:
                disconnected.append(connection)
        
        for conn in disconnected:
            self.disconnect(conn.websocket)

    def get_connection_count(self) -> int:
        return len(self.active_connections)

    def get_topic_subscriber_count(self, topic: str) -> int:
        return len(self.topic_subscriptions.get(topic, set()))